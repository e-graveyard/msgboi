export default class extends Error {
  constructor (code, message, error) {
    super()
    this.content = { code, error, message }
  }
}
