const File = require('./file');

module.exports = () =>
{
    const name = process.env.CONFIG_FILEPATH || 'config.yml';
    const file = new File(name);

    return (() => {
        try {
            if (!file.isReady())
                return null;

            return file.toYAML();
        }
        catch (e) {
            return null;
        }
    })();
}
