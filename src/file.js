const fs = require('fs');
const data = require('./data');

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

function isReady(file)
{
    return fs.existsSync(file);
}

function fromJSON(file)
{
    return data.fromJSON(read(file));
}

function fromYAML(file)
{
    return data.fromYAML(read(file));
}

module.exports = {
    read:     read,
    isReady:  isReady,
    fromJSON: fromJSON,
    fromYAML: fromYAML,
}
