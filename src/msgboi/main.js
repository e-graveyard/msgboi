/* global MsgboiError */

import * as data from './data'
import * as slack from './slack'
import * as gitlab from './gitlab'
import * as render from './render'

export async function handle (config, postData) {
  /*
    The data received must be a valid JSON document from GitLab. If the data
    could not be parsed into a JS object or the document doesn't seems to come
    from GitLab, an exception is thrown.

    GitLab webhooks for pipeline and merge request events comes with two
    specific keys: "object_kind" and "object_attributes". If these keys are
    undefined, the payload is probably malformed.
    */
  const payload = data.fromJSON(postData)

  if (!payload) {
    throw new MsgboiError(400, 'unable to parse the received POST data')
  }

  if (!(payload.object_kind && payload.object_attributes)) {
    throw new MsgboiError(400, 'malformed POST data')
  }

  /*
    Gitlab sends a lot of data. msgboi tries to make sense out of it by
    identifying the event kind and then creating an object containing some
    relevant information -- about the project, the pipeline stages, the
    pipeline overall status, the commit author, the external references (URLs)
    to these resources etc
    */
  const event = gitlab.read(payload)
  const { kind } = event

  /*
    Two kinds of events can be handled: pipeline events and merge request
    events. The event kind is defined at the "object_kind" key.  Each kind of
    event has it's own "statuses". The pipeline event, for instance, has four
    possible status: "pending", "running", "success" and "failed".

    msgboi must guarantees that user-defined configurations will be followed
    (for instance, if a given status of an event must be notified in Slack).
    */
  let status = null
  let branch = null

  if (kind === 'pipeline') {
    status = event.pipe.status.state
    branch = event.proj.branch.name
  } else if (kind === 'merge_request') {
    status = event.mr.status.state
    branch = event.mr.target.branch.name
  }

  const eventConfig = config.event[kind][status]
  if (!eventConfig.notify) {
    throw new MsgboiError(204, `"${kind}" events are set to not be notified; skipping...`)
  }

  const notificationTargets = config.notification.branch[branch]
  if (!notificationTargets) {
    throw new MsgboiError(204, `no notification rule set for branch "${branch}"; skipping...`)
  }

  // If the template file is undefined for status X of event Y, use the event
  // name as template name fallback.
  const template = eventConfig.template || kind

  /*
    A template file defines a couple of keys that translates into a Slack
    notification. Each key has a value that can be either static or use one or
    more available tags. Each tag is populated directly from the Gitlab event.

        (1) the template file content is loaded in-memory so each tag can be
        replaced to a directly related value defined at the "event" (the object
        created earlier with relevant Gitlab's event data);

        (2) the processed template content (which is a YAML-formatted document)
        is parsed to a JS object;

        (3) the JS object is stringified to a JSON document, which is then
        returned and made available here.

    The document structure follows what the Slack API expect. Roughly speaking,
    the JSON document we made is a single message attachment in Slack.

    Information on Slack's attachment structure can be found here:
    <https://api.slack.com/docs/message-attachments>

    ---

    A null response could either means:

        (1) that the template file could not be found;
        (2) that the template file could not be read;
        (3) that the YAML is malformed.

    In one or more cases, an exception will be thrown.
    */
  const message = await render(template, event)

  return {
    code: 200,
    message: 'ok',
    responses: await slack.notifyAll(notificationTargets, message)
  }
}
