const path = require('path');
const { getType } = require('./util/type');
const config = require('./get-config')();
const mock = require('./mock-data');
const mockrDefaultController = require('./default-controller');

const cwd = process.cwd();

async function callControllerOnce(ctx, controllerPath, next) {
  let cacheKey = '';
  try {
    controllerPath = controllerPath || getControllerPath(ctx);
    cacheKey = require.resolve(controllerPath);
    const controller = require(controllerPath);
    await commonPlay(ctx, next, controller);
  } catch (e) {
    callDafaultController(ctx, next, e);
  } finally {
    delete require.cache[cacheKey];
  }
}

function getControllerPath(ctx) {
  const { url } = ctx.request;
  const { controllerRoot } = config;
  // find controller with default match rule
  const normalControllerPath = path.resolve(cwd, controllerRoot, `.${ctx.request.path}`);

  // find controller with restful rule
  const restfulControllerPath = getRestfulControllerPath(ctx.path);

  // find controller with user custom rules
  const specialController = config.specialControllers.find((item) => {
    switch (getType(item.url)) {
      case 'regexp': return item.url.test(url);
      case 'function': return item.url(ctx);
      default:
    }
  });

  if (specialController) {
    return path.resolve(cwd, controllerRoot, specialController.path);
  }

  if (restfulControllerPath) {
    return restfulControllerPath;
  }

  return normalControllerPath;
}

function getRestfulControllerPath(requestPath) {
  const pathSlices = requestPath.substr(1).split('/');
  const matchedItem = config.restfulURLs.find((restfulURL) => {
    if (restfulURL.length !== pathSlices.length) {
      return false;
    }
    const everyEq = restfulURL.every((part, index) => {
      if (part == null) {
        return true;
      }
      return part === `/${pathSlices[index]}`;
    });
    return everyEq;
  });
  if (matchedItem) {
    return getControllerPathByRestfulTemplate(matchedItem);
  }
}

function getControllerPathByRestfulTemplate(template) {
  const controllerRelativePath = template.map((part) => {
    if (part == null) {
      return '_param';
    }
    return part.startsWith('/') ? part.substr(1) : part;
  }).join('/');
  return path.resolve(cwd, config.controllerRoot, controllerRelativePath);
}

async function callDafaultController(ctx, next, error) {
  let cacheKey;
  const { defaultController = mockrDefaultController } = config;
  try {
    let controller = defaultController;
    if (getType(defaultController) === 'string') {
      const controllerPath = path.resolve(cwd, config.controllerRoot, defaultController);
      cacheKey = require.resolve(controllerPath);
      controller = require(controllerPath);
    }
    ctx.error = error;
    await commonPlay(ctx, next, controller);
  } catch (e) {
    console.error(error);
    const errMsg = `Error calling default controller ${defaultController}`;
    console.error(e);
    ctx.body = errMsg;
  } finally {
    if (cacheKey) {
      delete require.cache[cacheKey];
    }
  }
}

async function commonPlay(ctx, next, controller) {
  if (typeof controller === 'function') {
    if (controller.length > 1) { // controller的参数是否有next
      await controller(ctx, next);
    } else {
      await controller(ctx);
      await next();
    }
  } else {
    ctx.body = mock(controller);
    await next();
  }
}
module.exports = callControllerOnce;
