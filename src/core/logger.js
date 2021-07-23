const color = {
  red: (msg) => `\u001B[1;31m${msg}\u001B[0m`,
  green: (msg) => `\u001B[1;32m${msg}\u001B[0m`,
  yellow: (msg) => `\u001B[1;33m${msg}\u001B[0m`,
  purple: (msg) => `\u001B[0;35m${msg}\u001B[0m`,
  cyan: (msg) => `\u001B[0;36m${msg}\u001B[0m`,
  white: (msg) => `\u001B[1;37m${msg}\u001B[0m`,
  grey: (msg) => `\u001B[2;37m${msg}\u001B[0m`
}

const getTS = () => new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')

function compose (criticality, message, error) {
  const typef = `${criticality}:`
  const q = (t) => `[${color.grey(getTS())}] ${t} ${message}`

  switch (criticality) {
    case 'INFO':
      return q(color.cyan(typef))

    case 'ERROR':
      if (error instanceof Error) {
        message += [
          color.white('ERROR MESSAGE:'),
          color.purple(error.message),
          color.white('STACK TRACE:'),
          error.stack,
          color.white('END OF STACK TRACE')
        ].join('\n')
      }

      return q(color.red(typef))

    case 'WARNING':
      return q(color.yellow(typef))

    case 'SUCCESS':
      return color.green(typef)
  }
}

export default {
  info: (m) => console.info(compose('INFO', m)),
  warn: (m) => console.warn(compose('WARNING', m)),
  success: (m) => console.log(compose('SUCCESS', m)),
  error: (m, e) => console.error(compose('ERROR', m, e))
}
