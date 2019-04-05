const fs = require('fs');
const data = require('./data');


/**
    --- TODO: docs ---
 */
function read(file)
{
    return (() => {
        try {
            return fs.readFileSync(file, 'utf8');
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
function isReady(file)
{
    return fs.existsSync(file);
}


/**
    --- TODO: docs ---
 */
function fromJSON(file)
{
    return data.fromJSON(read(file));
}


/**
    --- TODO: docs ---
 */
function fromYAML(file)
{
    return data.fromYAML(read(file));
}


/**
    --- TODO: docs ---
 */
module.exports = {
    read:     read,
    isReady:  isReady,
    fromJSON: fromJSON,
    fromYAML: fromYAML,
};
