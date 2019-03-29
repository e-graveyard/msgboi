const file = require('./file');


/**
    --- TODO: docs ---
 */
module.exports = () =>
{
    const name = process.env.MSGBOI_CONFIG || 'config.yml';

    return (() => {
        try {
            if (!file.isReady(name))
                return null;

            return file.fromYAML(name);
        }
        catch (e) {
            console.log(e);
            return null;
        }
    })();
}
