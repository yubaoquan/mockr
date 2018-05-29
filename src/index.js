#!/usr/bin/env node
const Koa = require('koa')
const koaStatic = require('koa-static')
const path = require('path')
const fs = require('fs')
const cwd = process.cwd()
const { getType } = require('./util/type')

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

const render = require('./render')(config)

const app = new Koa()

function callControllerOnce(controllerPath, ctx) {
    try {
        const cacheKey = require.resolve(controllerPath)
        const controller = require(controllerPath)
        if (typeof controller === 'function') {
            controller(ctx)
        } else {
            ctx.body = controller
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
        switch (getType(item.url)) {
            case 'regexp': return item.url.test(url)
            case 'function': return item.url(url)
        }
    })

    if (specialController) {
        return path.resolve(cwd, controllerRoot, specialController.path)
    }

    if (restfulControllerPath) {
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
    return path.resolve(cwd, config.controllerRoot, controllerRelativePath)
}

function getPageEntry(ctx) {
    let { url, request } = ctx
    if (!/^get$/i.test(request.method)) {
        return
    }
    return config.pageEntries.find((item) => {
        switch (getType(item.url)) {
            case 'regexp': return item.url.test(url)
            case 'function': return item.url(url)
            case 'string': return item.url === url
            default: return false
        }
    })
}

function getPageSyncData(ctx, pageEntry) {
    let requirePath = pageEntry.syncDataPath || ctx.request.path
    requirePath = path.resolve(config.syncDataRoot, requirePath)
    let data
    try {
        data = require(requirePath)
    } catch (e) {
        data = {}
    }

    if (getType(data) === 'function') {
        data = data(ctx)
    }
    delete require.cache[requirePath]
    return data
}

if (config.static) {
    config.static.forEach((item) => {
        if (getType(item) === 'string') {
            let cssPath = path.resolve(cwd, item)
            app.use(koaStatic(cssPath))
        } else {
            app.use(koaStatic(path.resolve(cwd, item.path), item.option || {}))
        }
    })
}

app.use(async ctx => {
    return new Promise((resolve, reject) => {
        const pageEntry = getPageEntry(ctx)
        if (pageEntry) {
            const syncData = getPageSyncData(ctx, pageEntry)
            render(pageEntry.template, syncData, config)
                .then((html) => {
                    ctx.body = html
                    resolve()
                })
                .catch((e) => {
                    console.error(e)
                    ctx.body = String(e)
                    resolve()
                })
        } else {
            const controllerPath = getControllerPath(ctx)
            callControllerOnce(controllerPath, ctx)
            resolve()
        }
    })
})

app.listen(config.mockServer.port || 3000)
