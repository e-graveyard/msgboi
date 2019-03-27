const file = require('./file');

module.exports = () =>
{
    const name = process.env.CONFIG_FILEPATH || 'config.yml';

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
