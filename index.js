#!/usr/bin/env node
const Koa = require('koa')

const path = require('path')
const fs = require('fs')
const cwd = process.cwd()

const configFilepath = path.resolve(cwd, './mockr-config.js')
if (!fs.existsSync(configFilepath)) {
    console.error(`Can't find config file.`)
    process.exit(1)
}

let config = require(configFilepath)
config = Object.assign({
    specialControllers: {},
    controllerRoot: cwd,
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
        return getControllerPathOfRestfulTemplate(matchedItem)
    }
}

function getControllerPathOfRestfulTemplate(template) {
    const controllerRelativePath = template.map((part) => {
        if (part == null) {
            return '_param'
        }
        return part.startsWith('/') ? part.substr(1) : part
    }).join('/')
    return path.resolve(cwd, config.controllerRoot, `./${controllerRelativePath}`)
}

app.use(ctx => {
    const controllerPath = getControllerPath(ctx)
    callControllerOnce(controllerPath, ctx)
})

app.listen(3000)