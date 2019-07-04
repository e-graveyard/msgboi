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
            return null;
        }
    })();
}


/**
    --- TODO: docs ---
 */
module.exports = {
    fromJSON,
};
