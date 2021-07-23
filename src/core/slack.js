import https from 'https'

function s (channel, payload) {
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

  const q = (code) => ({ channel, code })
  return new Promise((resolve, reject) => {
    const req = https.request(info, (res) => resolve(q(res.statusCode)))
    req.on('error', () => reject(new Error(q(500))))
    req.write(payload)
    req.end()
  })
}

export default (channels, message) => Promise.all(channels.map((c) => s(c, message)))
