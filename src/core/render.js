import mustache from 'mustache'

import logger from './logger'
import MsgboiError from './error'
import * as templates from './templates'

export default function (name, content) {
  // do not escape special character for HTML sake
  mustache.escape = (t) => {
    if (typeof t !== 'string') {
      return t
    }

    /* eslint-disable no-useless-escape */
    return t
      .replace(/[\\]/g, '\\\\')
      .replace(/[\"]/g, '\\"')
      .replace(/[\/]/g, '\\/')
      .replace(/[\b]/g, '\\b')
      .replace(/[\f]/g, '\\f')
      .replace(/[\n]/g, '\\n')
      .replace(/[\r]/g, '\\r')
      .replace(/[\t]/g, '\\t')
    /* eslint-enable */
  }

  try {
    return mustache.render(templates[name], content)
  } catch (e) {
    logger.error(e)
    throw new MsgboiError(500, `unable to render template "${name}"`)
  }
}
