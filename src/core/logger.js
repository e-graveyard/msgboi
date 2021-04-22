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

function compose (criticality, message, error = undefined) {
  const datef = `[${color.grey(getTS())}]`
  let typef = `${criticality}:`

  switch (criticality) {
    case 'INFO':
      typef = `${color.cyan(typef)}`
      break

    case 'ERROR':
      typef = `${color.red(typef)}`

      if (error) {
        message += `
            \n${color.white('ERROR MESSAGE:')}\n
            ${color.purple(error.message)}
            \n${color.white('STACK TRACE:')}\n
            ${error.stack}
            \n${color.white('END OF STACK TRACE')}\n`
      }
      break

    case 'WARNING':
      typef = `${color.yellow(typef)}`
      break

    case 'SUCCESS':
      typef = `${color.green(typef)}`
      break
  }

  return `${datef} ${typef} ${message}`
}

export const info = (m) => console.info(compose('INFO', m))
export const warn = (m) => console.warn(compose('WARNING', m))
export const success = (m) => console.log(compose('SUCCESS', m))
export const error = (m, e = undefined) => console.error(compose('ERROR', m, e))
