const slack = require('./slack');
const gitlab = require('./gitlab');
const templateEngine = require('./template');

const MsgboiError = require('./error');


/**
    --- TODO: docs ---
 */
module.exports = async (payload) =>
{
    /*
    The data received must be a valid JSON document from GitLab. If the data
    could not be parsed into a JS object or the document doesn't seems to come
    from GitLab, an exception is thrown.

    GitLab webhooks for pipeline and merge request events comes with two
    specific keys: "object_kind" and "object_attributes". If these keys are
    undefined, the payload is probably malformed.
    */
    const request = await (() => {
        try {
            const data = JSON.parse(payload);
            if (!(data.object_kind && data.object_attributes))
                throw new MsgboiError(400, 'Unable to identify the event kind');

            return data;
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
    const config = await require('./config')();
    if (!config)
        throw new MsgboiError(500, 'Unable to load the configurations');

    // Makes the configuration object globally available.
    global.__config = config;

    /*
    Gitlab sends a lot of data. msgboi tries to make sense out of it by
    identifying the event kind and then creating an object containing some
    relevant information -- about the project, the pipeline stages, the
    pipeline overall status, the commit author, the external references (URLs)
    to these resources etc
    */
    const event = gitlab.read(request);
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
            const notify = __config.event[kind][status].notify;
            if (!notify)
                return null;

            template = __config.event[kind][status].template;
            break;

        case 'merge_request':
            break;

        default:
            return null;
            break;
    }

    // If the template file is undefined for status X of event Y, use the event
    // name as template name fallback.
    template = template || kind;

    /*
    A template file defines a couple of keys that translates into a Slack
    notification. Each key has a value that can be either static or use one or
    more available tags. Each tag is populated directly from the Gitlab event.

    First, the template file content is loaded in-memory so each tag can be
    replaced to a directly related value defined at the "event" (the object
    created earlier with relevant Gitlab's event data).

    Second, the processed template content (which is a YAML-formatted document)
    is parsed to a JS object.

    Third and finally, the JS object is stringified to a JSON document, which
    is then returned and made available here.

    The document structure follows what the Slack API expect. Roughly speaking,
    the JSON document we made is a single message attachment in Slack.

    Information on Slack's attachment structure can be found here:
    <https://api.slack.com/docs/message-attachments>
    */
    const message = await templateEngine.render(event, template);
    if (!message)
        throw new MsgboiError(500, 'Unable to generate the message');

    return message;
}
