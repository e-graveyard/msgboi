const fs = require('fs');
const yaml = require('js-yaml');

module.exports = async () =>
{
    const file = process.env.CONFIG_FILEPATH || 'config.yml';

    return (() => {
        try {
            return yaml.safeLoad(fs.readFileSync(file, 'utf8'));
        }
        catch (e) {
            return null;
        }
    })();
}

