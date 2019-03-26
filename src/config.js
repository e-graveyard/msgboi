const yaml = require('./yaml');

module.exports = () =>
{
    const file = process.env.CONFIG_FILEPATH || 'config.yml';
    return yaml.load(file);
}
