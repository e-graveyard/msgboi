module.exports = class MsgboiError extends Error
{
    constructor(code, message) {
        super();

        this.code = code;
        this.message = message;
    }
}
