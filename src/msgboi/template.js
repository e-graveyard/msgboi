const mustache = require('mustache');

const data = require('./data');
const file = require('./file');


function loadTemplate(template)
{
    const templateFilePath = `./templates/${template}.yml`;

    if (!file.isReady(templateFilePath))
        throw new MsgboiError(500, `template "${template}" not found`);

    const templateContent = file.read(templateFilePath);

    if (!templateContent)
        throw new MsgboiError(500, `unable to read template "${template}"`);

    return templateContent;
}


/**
    --- TODO: docs ---
 */
async function render(content, templateFile)
{
    // do not escape special character for HTML sake
    mustache.escape = ((text) => { return text; });

    const template = await loadTemplate(templateFile);

    try {
        const rendered = await mustache.render(template, content);
        return await data.fromYAML(rendered);
    }
    catch (e) {
        throw new MsgboiError(500, `unable to render template "${templateFile}"`);
    }
}


/**
    --- TODO: docs ---
 */
module.exports = {
    render: render,
};
