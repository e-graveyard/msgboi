/* global MsgboiError */

import mustache from 'mustache'
import * as templates from './templates'

export async function render (name, content) {
  // do not escape special character for HTML sake
  mustache.escape = (t) => {
    if (typeof t === 'string') {
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
    } else {
      return t
    }
  }

  const template = templates[name]

  try {
    return await mustache.render(template, content)
  } catch (e) {
    console.log(e)
    throw new MsgboiError(500, `unable to render template "${name}"`)
  }
}
