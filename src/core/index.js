const GitlabEvent  = require('./gitlab');
const SlackChannel = require('./slack');

module.exports = async (content) =>
{
    const config  = await require('./config')();
    if (!config) {
        console.log('Something went wrong.');
        return;
    }

    const rules = config.notification.rules;
    const event = new GitlabEvent(content);
    const channel = rules[event.getBranch()];
    if (!channel) {
        console.log('Something went wrong.');
        return;
    }

    const slack = new SlackChannel(channel);
    slack.notify(event.toSlackMessage());
}
