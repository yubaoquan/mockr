const fs = require('fs');
const path = require('path');

module.exports = config => ({ template }) => {
  const tplRoot = config.templateRoots[0];
  const tpl = template.startsWith('/') ? template.slice(1) : template;
  const tplPath = path.resolve(tplRoot, tpl);
  const content = fs.readFileSync(tplPath);
  return String(content);
};
