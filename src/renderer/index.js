const htmlRenderer = require('./html');
const ftlRenderer = require('./freemarker');

module.exports = function (config) {
  return config.noTemplateEngine ? htmlRenderer(config) : ftlRenderer(config);
};
