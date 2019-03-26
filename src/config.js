const File = require('./file');

module.exports = () =>
{
    const name = process.env.CONFIG_FILEPATH || 'config.yml';
    const file = new File(name);

    if (!file.isReady())
        return null;

    return file.toYAML();
}
