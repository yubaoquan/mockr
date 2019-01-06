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

function getPageSyncData(ctx, pageEntry) {
  let requirePath = pageEntry.syncDataPath || ctx.request.path;
  requirePath = path.resolve(config.syncDataRoot, requirePath);
  let data;
  try {
    data = require(requirePath);
  } catch (e) {
    data = {};
  }

  if (getType(data) === 'function') {
    data = data(ctx);
  }
  delete require.cache[requirePath];
  return data;
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

if (config.beforeHandler) {
  app.use(config.beforeHandler);
}

app.use(async (ctx, next) => {
  const pageEntry = getPageEntry(ctx);
  if (pageEntry) {
    const syncData = getPageSyncData(ctx, pageEntry);
    try {
      const html = await renderer(pageEntry.template, syncData, config);
      ctx.body = html;
      await next();
    } catch (e) {
      console.error(e);
      ctx.body = String(e);
    }
  } else {
    await callControllerOnce(ctx, config);
    await next();
  }
});

if (config.afterHandler) {
  app.use(config.afterHandler);
}

app.listen(config.mockServer.port || 3000);
