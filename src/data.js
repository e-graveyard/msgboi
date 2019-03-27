const YAML = require('js-yaml');

function fromJSON(data)
{
    return (() => {
        try {
            return JSON.parse(data);
        }
        catch (e) {
            console.log(e);
            return null;
        }
    })();
}

function fromYAML(data)
{
    return (() => {
        try {
            return YAML.safeLoad(data);
        }
        catch (e) {
            console.log(e);
            return null;
        }
    })();
}

module.exports = {
    fromJSON: fromJSON,
    fromYAML: fromYAML
}
