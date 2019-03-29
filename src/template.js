// 3rd-party
const mustache = require('mustache');

// modules
const data = require('./data');
const file = require('./file');

/**
    --- TODO: docs ---
 */
function render(content)
{
    mustache.escape = ((text) => { return text; });

    return (async () => {
        try {
            const templateFile = `./templates/${content.kind}.yml`;
            if (!file.isReady(templateFile))
                return null;

            const template = await file.read(templateFile);
            return JSON.stringify({
                attachments: [
                    await data.fromYAML(mustache.render(template, content))
                ]
            });
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
    render: render,
}
