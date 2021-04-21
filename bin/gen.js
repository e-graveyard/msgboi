/*
The person who associated a work with this deed has dedicated the work to the
public domain by waiving all of his or her rights to the work worldwide under
copyright law, including all related and neighboring rights, to the extent
allowed by law.

You can copy, modify, distribute and perform the work, even for commercial
purposes, all without asking permission.

AFFIRMER OFFERS THE WORK AS-IS AND MAKES NO REPRESENTATIONS OR WARRANTIES OF
ANY KIND CONCERNING THE WORK, EXPRESS, IMPLIED, STATUTORY OR OTHERWISE,
INCLUDING WITHOUT LIMITATION WARRANTIES OF TITLE, MERCHANTABILITY, FITNESS FOR
A PARTICULAR PURPOSE, NON INFRINGEMENT, OR THE ABSENCE OF LATENT OR OTHER
DEFECTS, ACCURACY, OR THE PRESENT OR ABSENCE OF ERRORS, WHETHER OR NOT
DISCOVERABLE, ALL TO THE GREATEST EXTENT PERMISSIBLE UNDER APPLICABLE LAW.

For more information, please see
<http://creativecommons.org/publicdomain/zero/1.0/>
*/

const fs = require('fs')
const yaml = require('js-yaml')

const bundleDir = './bundle'

/**
    --- TODO: docs ---
 */
function convert (file) {
  return yaml.load(fs.readFileSync(file))
}

function writeModule (c, m) {
  const content = `module.exports=${JSON.stringify(c)}`
  const module = `${bundleDir}/msgboi/${m}.js`

  fs.writeFile(module, content, (e) => {
    if (e) {
      console.log(e)
      throw new Error(`msgboi: impossible to generate module "${m}"`)
    }
  })
}

/**
    --- TODO: docs ---
 */
function generateTemplatesModule () {
  const templatesDir = `${bundleDir}/templates`

  if (!fs.existsSync(templatesDir)) {
    throw new Error('msgboi: templates directory not found')
  }

  const t = {}
  fs.readdirSync(templatesDir).map((f) => {
    const s = f.split('.')
    const name = s[0]
    const ext = s[1]

    if (ext === 'yml') {
      t[name] = JSON.stringify({
        attachments: [convert(`${templatesDir}/${f}`)]
      })
    }
  })

  if (!Object.keys(t).length) {
    throw new Error('msgboi: no template file found')
  }

  writeModule(t, 'templates')
}

/**
    --- TODO: docs ---
 */
function generateConfigModule () {
  const configFile = `${bundleDir}/config.yml`

  if (!fs.existsSync(configFile)) {
    throw new Error('msgboi: config file not found')
  }

  const c = convert(configFile)

  if (!(c.event && c.notification)) {
    throw new Error('msgboi: malformed config file')
  }

  writeModule({ event: c.event, notification: c.notification }, 'config')
}

/**
    --- TODO: docs ---
 */
generateConfigModule()
generateTemplatesModule()
