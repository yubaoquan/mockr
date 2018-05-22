#!/usr/bin/env node
const Koa = require('koa')

const path = require('path')
const fs = require('fs')
const cwd = process.cwd()
const { getType } = require('./util')
const render = require('./render')

const configFilepath = path.resolve(cwd, './mockr-config.js')
if (!fs.existsSync(configFilepath)) {
    console.error(`Can't find config file.`)
    process.exit(1)
}

let config = require(configFilepath)
config = Object.assign({
    specialControllers: {},
    controllerRoot: cwd,
    mockServer: {
        port: 3000,
    },
}, config)

const app = new Koa()

function callControllerOnce(controllerPath, ctx) {
    try {
        const cacheKey = require.resolve(controllerPath)
        const controller = require(controllerPath)
        if (typeof controller === 'function') {
            controller(ctx)
        } else {
            ctx.response.body = controller
        }
        delete require.cache[cacheKey]
    } catch (e) {
        const errMsg = `Controller ${controllerPath} not found`
        console.error(errMsg)
        ctx.body = errMsg
    }
}

function getControllerPath(ctx) {
    const url = ctx.request.url
    const controllerRoot = config.controllerRoot
    // find controller with default match rule
    const normalControllerPath = path.resolve(cwd, controllerRoot, `.${ctx.request.path}`)

    // find controller with restful rule
    const restfulControllerPath = getRestfulControllerPath(ctx.path)

    // find controller with user custom rules
    const specialController = config.specialControllers.find(item => {
        if (item.matcher) {
            return item.matcher(url)
        }
        return item.reg.test(url)
    })

    if (specialController) {
        return path.resolve(cwd, controllerRoot, specialController.path)
    }

    if (restfulControllerPath) {
        console.info(restfulControllerPath)
        return restfulControllerPath
    }

    return normalControllerPath
}

function getRestfulControllerPath(requestPath) {
    const pathSlices = requestPath.substr(1).split('/')
    const matchedItem = config.restfulURLs.find((restfulURL) => {
        if (restfulURL.length !== pathSlices.length) {
            return false
        }
        const everyEq = restfulURL.every((part, index) => {
            if (part == null) {
                return true
            }
            return part === `/${pathSlices[index]}`
        })
        return everyEq
    })
    if (matchedItem) {
        return getControllerPathByRestfulTemplate(matchedItem)
    }
}

function getControllerPathByRestfulTemplate(template) {
    const controllerRelativePath = template.map((part) => {
        if (part == null) {
            return '_param'
        }
        return part.startsWith('/') ? part.substr(1) : part
    }).join('/')
    return path.resolve(cwd, config.controllerRoot, `./${controllerRelativePath}`)
}

function getPageEntry(url) {
    const entry = config.pageEntries.find((item) => {
        switch (getType(item.url)) {
            case 'rexexp': return item.url.test(url)
            case 'function': return item.url(url)
            case 'string': return item.url === url
            default: return false
        }
    })
    return entry
}

function getPageSyncData(ctx, pageEntry) {
    let requirePath = pageEntry.syncDataPath || ctx.request.path
    requirePath = path.resolve(config.syncDataRoot, requirePath)
    let data = require(requirePath)
    if (getType(data) === 'function') {
        data = data(ctx)
    }
    delete require.cache[requirePath]
    return data
}

app.use(ctx => {
    const pageEntry = getPageEntry(ctx.url)
    if (pageEntry) {
        const syncData = getPageSyncData(pageEntry)
        const templateFilepath = path.resolve(cwd, config.templateRoot, pageEntry.file)
        render(templateFilepath, syncData, config)
    } else {
        const controllerPath = getControllerPath(ctx)
        callControllerOnce(controllerPath, ctx)
    }
})

app.listen(config.mockServer.port || 3000)