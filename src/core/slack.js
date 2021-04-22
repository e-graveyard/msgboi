import https from 'https'

function send (channel, payload) {
  const info = {
    hostname: 'hooks.slack.com',
    path: `/services/${channel}`,
    method: 'POST',
    port: 443,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': payload.length
    }
  }

  return new Promise((resolve, reject) => {
    const req = https.request(info, (res) => resolve({ channel: channel, code: res.statusCode }))
    req.on('error', () => reject(new Error({ channel: channel, code: 500 })))
    req.write(payload)
    req.end()
  })
}

export async function notifyAll (channels, message) {
  const promises = channels.map((c) => send(c, message))
  return await Promise.all(promises)
}
