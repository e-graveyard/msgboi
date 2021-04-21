const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

const bundleDir = './bundle'
const convert = (f) => yaml.load(fs.readFileSync(f))

function writeModule (c, m) {
  const content = 'module.exports=' + JSON.stringify(c)
  const module = path.join(bundleDir, 'msgboi', m + '.js')
  fs.writeFile(module, content, (e) => {
    if (e) {
      console.log(e)
      throw new Error(`msgboi: impossible to generate module "${m}"`)
    }
  })
}

function generateTemplatesModule () {
  const templatesDir = path.join(bundleDir, 'templates')
  if (!fs.existsSync(templatesDir)) {
    throw new Error('msgboi: templates directory not found')
  }

  const t = {}
  fs.readdirSync(templatesDir).forEach((f) => {
    const [name, ext] = f.split('.')

    if (ext === 'yml') {
      t[name] = JSON.stringify({ attachments: [convert(`${templatesDir}/${f}`)] })
    }
  })

  if (!Object.keys(t).length) {
    throw new Error('msgboi: no template file found')
  }

  writeModule(t, 'templates')
}

function generateConfigModule () {
  const configFile = path.join(bundleDir, 'config.yml')
  if (!fs.existsSync(configFile)) {
    throw new Error('msgboi: config file not found')
  }

  const { event, notification } = convert(configFile)
  if (!(event && notification)) {
    throw new Error('msgboi: malformed config file')
  }

  writeModule({ event, notification }, 'config')
}

generateConfigModule()
generateTemplatesModule()
