import msgboi from './core/main'
import logger from './core/logger'
import * as config from './core/config'

export async function handler (event, _) {
  const r = await (async () => {
    try {
      return await msgboi(config, event.body)
    } catch (e) {
      return e.content
    }
  })()

  if (r.code < 400) {
    logger.success(r.message)

    r.responses.forEach((r) => {
      if (r.code < 400) {
        logger.success(`notification to channel ${r.channel} succeded`)
      } else {
        logger.error(`notification to channel ${r.channel} failed with code ${r.code}`)
      }
    })
  } else {
    logger.error(r.message, r.error)
  }

  return {
    headers: { 'Content-Type': 'application/json' },
    isBase64Encoded: false,
    statusCode: r.code,
    body: null
  }
}
