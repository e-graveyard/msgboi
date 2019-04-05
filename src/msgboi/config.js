const file = require('./file');


/**
    --- TODO: docs ---
 */
function load()
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


/**
    --- TODO: docs ---
 */
module.exports = {
    load: load,
};
