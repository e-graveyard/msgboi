const YAML = require('js-yaml');

/**
    --- TODO: docs ---
 */
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


/**
    --- TODO: docs ---
 */
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


/**
    --- TODO: docs ---
 */
module.exports = {
    fromJSON: fromJSON,
    fromYAML: fromYAML
}
