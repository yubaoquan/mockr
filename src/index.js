#!/usr/bin/env node
const Koa = require('koa');
const koaStatic = require('koa-static');
const path = require('path');
const callControllerOnce = require('./call-controller');

const { getType } = require('./util/type');
const config = require('./get-config')();
const renderer = require('./renderer')(config);

const cwd = process.cwd();
const app = new Koa();

function getPageEntry(ctx) {
  const { url, request } = ctx;
  if (!/^get$/i.test(request.method)) {
    return;
  }
  return config.pageEntries.find((item) => {
    switch (getType(item.url)) {
      case 'regexp': return item.url.test(url);
      case 'function': return item.url(url);
      case 'string': return item.url === url;
      default: return false;
    }
  });
}

if (config.static) {
  config.static.forEach((item) => {
    if (getType(item) === 'string') {
      const cssPath = path.resolve(cwd, item);
      app.use(koaStatic(cssPath));
    } else {
      app.use(koaStatic(path.resolve(cwd, item.path), item.option || {}));
    }
  });
}

if (config.beforeController) {
  const valueType = getType(config.beforeController);
  if (valueType === 'string') {
    const controllerPath = path.resolve(cwd, config.controllerRoot, config.beforeController);
    app.use(async (ctx, next) => {
      await callControllerOnce(ctx, controllerPath, next);
    });
  } else if (/function/.test(valueType)) { // function and asyncfunction
    app.use(config.beforeController);
  } else {
    console.error('beforeController must be either string or function');
  }
}

app.use(async (ctx, next) => {
  const pageEntry = getPageEntry(ctx);
  if (pageEntry) {
    try {
      const html = await renderer(pageEntry, ctx);
      ctx.body = html;
      await next();
    } catch (e) {
      console.error(e);
      ctx.body = String(e);
    }
  } else {
    await callControllerOnce(ctx, null, next);
  }
});

if (config.afterController) {
  const valueType = getType(config.afterController);
  if (valueType === 'string') {
    const controllerPath = path.resolve(cwd, config.controllerRoot, config.afterController);
    app.use(async (ctx, next) => {
      await callControllerOnce(ctx, controllerPath, next);
    });
  } else if (/function/.test(valueType)) { // function and asyncfunction
    app.use(config.afterController);
  } else {
    console.error('afterController must be either string or function');
  }
}

const port = config.mockServer.port || 3000;
app.listen(port);
console.info(`Mockr listening on port ${port}`);
