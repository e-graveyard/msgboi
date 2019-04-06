/**
    --- TODO: docs ---
 */
module.exports = class MsgboiError extends Error
{
    constructor(code, message) {
        super();

        this.content = {
            code: code,
            message: message,
        };
    }
};
