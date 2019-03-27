// modules
const MsgboiError = require('./error');
const slack = require('./slack');
const template = require('./template');

module.exports = async (data) =>
{
    // tries to load "config.yml" (or whatever defined at "CONFIG_FILEPATH")
    const config  = await require('./config')();
    if (!config)
        throw new MsgboiError(500, 'Unable to load the configurations');

    const rules = config.notification.rules;

    const event = await (() => {
        try {
            const parsedData = JSON.parse(data);
            if (!parsedData.object_kind)
                throw new MsgboiError(400, 'Unable to identify the event kind');

            return parsedData;
        }
        catch (e) {
            throw new MsgboiError(400, 'Unable to parse the received POST data');
        }
    })();

    // create a new template based on the received content
    const message = await template.render(event);
    if (!message) {
        return;
    }

    return message;

    /*
    const channel = rules[event.getBranch()];
    if (!channel) {
        return;
    }

    slack.notify(channel, event.toSlackMessage());
    */
}
