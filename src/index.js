/*
The person who associated a work with this deed has dedicated the work to the
public domain by waiving all of his or her rights to the work worldwide under
copyright law, including all related and neighboring rights, to the extent
allowed by law.

You can copy, modify, distribute and perform the work, even for commercial
purposes, all without asking permission.

AFFIRMER OFFERS THE WORK AS-IS AND MAKES NO REPRESENTATIONS OR WARRANTIES OF
ANY KIND CONCERNING THE WORK, EXPRESS, IMPLIED, STATUTORY OR OTHERWISE,
INCLUDING WITHOUT LIMITATION WARRANTIES OF TITLE, MERCHANTABILITY, FITNESS FOR
A PARTICULAR PURPOSE, NON INFRINGEMENT, OR THE ABSENCE OF LATENT OR OTHER
DEFECTS, ACCURACY, OR THE PRESENT OR ABSENCE OF ERRORS, WHETHER OR NOT
DISCOVERABLE, ALL TO THE GREATEST EXTENT PERMISSIBLE UNDER APPLICABLE LAW.

For more information, please see
<http://creativecommons.org/publicdomain/zero/1.0/>
*/

const slack = require('./slack');
const gitlab = require('./gitlab');
const templateEngine = require('./template');

const MsgboiError = require('./error');


/**
    --- TODO: docs ---
 */
async function deal(payload)
{
    /*
    The data received must be a valid JSON document from GitLab. If the data
    could not be parsed into a JS object or the document doesn't seems to come
    from GitLab, an exception is thrown.

    GitLab webhooks for pipeline and merge request events comes with two
    specific keys: "object_kind" and "object_attributes". If these keys are
    undefined, the payload is probably malformed.
    */
    const data = await (() => {
        try {
            const d = JSON.parse(payload);
            if (!(d.object_kind && d.object_attributes))
                throw new MsgboiError(400, 'Unable to identify the event kind');

            return d;
        }
        catch (e) {
            console.log(e);
            throw new MsgboiError(400, 'Unable to parse the received POST data');
        }
    })();

    /*
    msgboi reads the "MSGBOI_CONFIG" environment variable expecting a filename.
    If the variable is set, it tries to read the file. If it's not, it
    fallbacks to the default config filename "config.yml".

    The configuration file is a YAML-formatted document. If something goes
    wrong reading and/or parsing the file, a null value will be returned,
    throwing a MsgboiError exception.
    */
    const config = await (() => {
        const c = require('./config');
        if (!c)
            throw new MsgboiError(500, 'Unable to load the configurations');

        if (!(c.event && c.notification))
            throw new MsgboiError(500, 'Malformed configurations');

        return {
            event: c.event,
            notification: c.notification,
        };
    })();

    /*
    Gitlab sends a lot of data. msgboi tries to make sense out of it by
    identifying the event kind and then creating an object containing some
    relevant information -- about the project, the pipeline stages, the
    pipeline overall status, the commit author, the external references (URLs)
    to these resources etc
    */
    const event = gitlab.read(data);
    if (!event)
        return null;

    const kind = event.kind;

    /*
    Two kinds of events can be handled: pipeline events and merge request
    events. The event kind is defined at the "object_kind" key.  Each kind of
    event has it's own "statuses". The pipeline event, for instance, has four
    possible status: "pending", "running", "success" and "failed".

    msgboi must guarantees that user-defined configurations will be followed
    (for instance, if a given status of an event must be notified in Slack).
    */
    let template = '';
    switch(kind) {
    case 'pipeline':
        const status = event.pipe.status.state;
        const notify = config.event[kind][status].notify;
        if (!notify)
            return null;

        template = config.event[kind][status].template;
        break;

    case 'merge_request':
        break;

    default:
        return null;
    }

    // If the template file is undefined for status X of event Y, use the event
    // name as template name fallback.
    template = template || kind;

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
    const message = await templateEngine.render(event, template);
    if (!message)
        throw new MsgboiError(500, 'Unable to generate the Slack notification');
}


/**
    --- TODO: docs ---
 */
module.exports = {
    deal: deal,
};
