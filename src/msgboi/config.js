const file = require('./file');


/**
    --- TODO: docs ---
 */
function load()
{
    /*
    msgboi reads the "MSGBOI_CONFIG" environment variable expecting a filename.
    If the variable is set, it tries to read the file. If it's not, it
    fallbacks to the default config filename "config.yml".

    The configuration file is a YAML-formatted document. If something goes
    wrong reading and/or parsing the file, a null value will be returned,
    throwing a MsgboiError exception.
    */
    const name = process.env.MSGBOI_CONFIG || 'config.yml';

    if (!file.isReady(name))
        throw new MsgboiError(500, 'unable to locate the config file');

    const c = file.fromYAML(name);
    if (!c)
        throw new MsgboiError(500, 'unable to load the configurations');

    if (!(c.event && c.notification))
        throw new MsgboiError(500, 'malformed configurations');

    return {
        event: c.event,
        notification: c.notification,
    };
}


/**
    --- TODO: docs ---
 */
module.exports = {
    load: load,
};
