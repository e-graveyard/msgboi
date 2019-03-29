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
        msgboi reads the "MSGBOI_CONFIG" environment variable expecting a
        filename. If the variable is set, it tries to read the file. If it's
        not, it fallbacks to the default config filename "config.yml".

        The configuration file is a YAML-formatted document. If something went
        wrong reading and/or parsing the file, a null value will be returned,
        throwing a MsgboiError exception.
    */
    const config = await require('./config')();
    if (!config)
        throw new MsgboiError(500, 'Unable to load the configurations');

    global.__config = config;

    /*
        The received data must be a valid JSON document from GitLab. If the
        data could not be parsed into a JS object or the document doesn't seems
        to come from GitLab, an exception is throwned.

        GitLab webhooks for pipeline and merge request events comes with two
        specific keys: "object_kind" and "object_attributes". If this keys are
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

    const event = gitlab.read(request);
    if (!event)
        return null;

    const kind = event.kind;

    /*
        msgboi can handle two kinds of events: pipeline events and merge
        request events. The event kind is defined at the "object_kind" key.
        Each kind of event has it's own "statuses". The pipeline event, for
        instance, has four possible status: "pending", "running", "success" and
        "failed".
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

    template = template || kind;

    // create a new template based on the received content
    const message = await templateEngine.render(event, template);
    if (!message)
        throw new MsgboiError(500, 'Unable to generate the message');

    return message;
}
