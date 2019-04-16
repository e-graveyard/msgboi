const mustache  = require('mustache');
const templates = require('./templates');


/**
    --- TODO: docs ---
 */
async function render(name, content)
{
    // do not escape special character for HTML sake
    mustache.escape = (t => {
        if (typeof(t) === 'string') {
            return t
                .replace(/[\\]/g, '\\\\')
                .replace(/[\"]/g, '\\\"')
                .replace(/[\/]/g, '\\/')
                .replace(/[\b]/g, '\\b')
                .replace(/[\f]/g, '\\f')
                .replace(/[\n]/g, '\\n')
                .replace(/[\r]/g, '\\r')
                .replace(/[\t]/g, '\\t');
        }
        else {
            return t;
        }
    });

    const template = templates[name];

    try {
        return await mustache.render(template, content);
    }
    catch (e) {
        console.log(e);
        throw new MsgboiError(500, `unable to render template "${name}"`);
    }
}


/**
    --- TODO: docs ---
 */
module.exports = render;
