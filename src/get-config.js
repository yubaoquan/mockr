const path = require('path');
const fs = require('fs');

const cwd = process.cwd();
const configFilepath = path.resolve(cwd, './mockr-config.js');
if (!fs.existsSync(configFilepath)) {
  console.error(`Can't find config file ${configFilepath}`);
  process.exit(1);
}

let config = require(configFilepath);
config = Object.assign({
  specialControllers: {},
  controllerRoot: cwd,
  mockServer: {
    port: 3000,
  },
}, config);

module.exports = () => config;
