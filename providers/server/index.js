import http from 'http'
import * as msgboi from './core/main'
import * as logger from './core/logger'
import * as config from './core/config'

// the HTTP server object
let server = null

// opened sockets "table"
const sockets = new Set()

global.MsgboiError = require('./core/error')

// signal handlers
process.on('SIGINT', exitGracefully)
process.on('SIGHUP', exitGracefully)
process.on('SIGQUIT', exitGracefully)
process.on('SIGTERM', exitGracefully)

logger.info('msgboi has started')

function exitGracefully () {
  if (server) {
    logger.warn('got SIGNAL')

    for (const s of sockets.values()) {
      s.destroy()
    }

    server.close(() => {
      logger.info('server closed')
      process.exit(0)
    })
  }
}

async function handle (c, d) {
  try {
    return await msgboi.handle(c, d)
  } catch (e) {
    return e.content
  }
}

async function loadService (s) {
  server = http.createServer((req, res) => {
    let body = []
    let code = 200

    const u = req.connection.remoteAddress

    req.on('data', (d) => {
      body.push(d)

      if (body.length > 1e6) {
        req.connection.destroy()
      }
    })

    req.on('end', async () => {
      if (code === 200) {
        body = Buffer.concat(body).toString()

        if (body.length) {
          const result = await handle(s.config, body)
          const log = `(${u}) ${result.message}`

          if (result.code < 400) {
            logger.success(log)

            result.responses.forEach((r) => {
              if (r.code < 400) {
                logger.success(`(${u}) notification to channel "${r.channel}" succeded`)
              } else {
                logger.error(
                  `(${u}) notification to channel "${r.channel}" failed with code ${r.code}`
                )
              }
            })
          } else {
            logger.error(log, result.error)
          }

          code = result.code
        } else {
          logger.error(`(${u}) send no content`)
          code = 400
        }
      }

      res.statusCode = code
      res.end()
    })

    if (req.url !== '/') {
      logger.error(`(${u}) requested "${req.url}"`)
      code = 404
    } else if (req.method !== 'POST') {
      logger.error(`(${u}) called with "${req.method}"`)
      code = 405
    } else if (req.headers['content-type'] !== 'application/json') {
      logger.error(`(${u}) used type "${req.headers['content-type']}"`)
      code = 415
    }
  })

  server.on('connection', (s) => {
    sockets.add(s)
    s.on('close', () => sockets.delete(s))
  })

  server.listen(s.port, s.host, () => logger.info(`listening on ${s.host}:${s.port}`))
}

const port = process.env.MSGBOI_PORT || 8080
const host = process.env.MSGBOI_HOST || 'localhost'

try {
  loadService({ port, host, config })
} catch (e) {
  logger.error(e.content.message)
  logger.info('exiting...')

  process.exit(1)
}
