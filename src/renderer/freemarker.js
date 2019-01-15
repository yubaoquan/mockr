const path = require('path');
const { getType } = require('../util/type');

module.exports = function(config) {
  const [firstRoot, ...otherRoots] = config.templateRoots;
  const render = require('@ybq/jmockr-ftl-render')({
    templateRoot: firstRoot,
    moduleFtlPathes: otherRoots,
  });

  function getPageSyncData(ctx, args) {
    let requirePath = args.syncDataPath || ctx.request.path;
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

  return function(args, ctx) {
    return new Promise((resolve, reject) => {
      try {
        const syncData = getPageSyncData(ctx, args);
        render(args.template, syncData, html => resolve(html));
      } catch (e) {
        reject(e);
      }
    });
  };
};
