module.exports = function (config) {
  const [firstRoot, ...otherRoots] = config.templateRoots;
  const render = require('@ybq/jmockr-ftl-render')({
    templateRoot: firstRoot,
    moduleFtlPathes: otherRoots,
  });
  return function (template, data) {
    return new Promise((resolve, reject) => {
      try {
        render(template, data, html => resolve(html));
      } catch (e) {
        reject(e);
      }
    });
  };
};
