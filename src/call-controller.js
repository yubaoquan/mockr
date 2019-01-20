const path = require('path');
const { getType } = require('./util/type');
const config = require('./get-config')();
const mock = require('./mock-data');

const cwd = process.cwd();

async function callControllerOnce(ctx) {
  let controllerPath;
  let cacheKey = '';
  try {
    controllerPath = getControllerPath(ctx);
    cacheKey = require.resolve(controllerPath);
    const controller = require(controllerPath);
    if (typeof controller === 'function') {
      await controller(ctx);
    } else {
      ctx.body = mock(controller);
    }
  } catch (e) {
    const errMsg = `Error calling controller ${controllerPath}`;
    console.error(e);
    ctx.body = errMsg;
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
      case 'function': return item.url(url);
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

module.exports = callControllerOnce;
