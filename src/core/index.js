async function loadConfig(file)
{
    const fs = require('fs');
    const yaml = require('js-yaml');

    return (() => {
        try {
            return yaml.safeLoad(fs.readFileSync(file, 'utf8'));
        }
        catch (e) {
            return null;
        }
    })();
}


async function main()
{
    const configFile = process.env.CONFIG_FILEPATH || 'config.yml';

    const config = await loadConfig(configFile);
    if (config != null) {
        console.log(JSON.stringify(config));
    }
}


module.exports = main;
