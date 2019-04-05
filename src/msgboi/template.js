const mustache = require('mustache');

const data = require('./data');
const file = require('./file');


/**
    --- TODO: docs ---
 */
function render(content, templateFile)
{
    // do not escape special character for HTML sake
    mustache.escape = ((text) => { return text; });

    return (async () => {
        try {
            templateFile = `./templates/${templateFile}.yml`;
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
