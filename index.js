#!/usr/bin/env node
const Koa = require('koa')

const path = require('path')
const fs = require('fs')
const cwd = process.cwd()

const configFilepath = path.resolve(cwd, './config.js')
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
        console.info(typeof controller)
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
    const normalControllerPath = path.resolve(cwd, controllerRoot, `.${ctx.request.path}`)
    const specialController = config.specialControllers.find(item => {
        if (item.matcher) {
            return item.matcher(url)
        }
        return item.reg.test(url)
    })
    if (specialController) {
        return path.resolve(cwd, controllerRoot, specialController.path)
    }
    return normalControllerPath
}

app.use(ctx => {
    const controllerPath = getControllerPath(ctx)
    console.info(controllerPath)
    callControllerOnce(controllerPath, ctx)
})

app.listen(3000)