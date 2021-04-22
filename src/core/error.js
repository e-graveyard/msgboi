export class MsgboiError extends Error {
  constructor (code, message, parentError = undefined) {
    super()

    this.content = {
      code: code,
      error: parentError,
      message: message
    }
  }
}
