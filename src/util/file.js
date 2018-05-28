const JSON5 = require('json5')
const fs = require('fs')

function json5Require(filepath) {
    if (!fs.existsSync(filepath)) {
        return null
    }
    try {
        const fileContent = fs.readFileSync(filepath, { encoding: 'utf8' })
        return JSON5.parse(fileContent)
    } catch (e) {
        console.info(`require json5 file [${filepath}] failed`, e)
        return null
    }
}

exports.json5Require = json5Require