export function fromJSON (data) {
  try {
    return JSON.parse(data)
  } catch (e) {
    return null
  }
}
