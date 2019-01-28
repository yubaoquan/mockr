# mockr
A simple mock server based on koa.

It support ajax mocking, freemarker rendering, html rendering.

[中文文档](https://github.com/yubaoquan/mockr/blob/master/README.cn.md)

## Install

> npm i -g @ybq/mockr

## Usage
Go to directory of mockr config file `mockr-config.js`.
For example the config file is under `/aa/bb/cc`.

```
cd /aa/bb/cc
npm run mockr
```

mockr will find the config file named `mockr-config.js` in current working directory.

## Config

Below is a config demo:
```
module.exports = {
  restfulURLs: [
    ['/a', null, '/b', null],
  ],
  pageEntries: [
    {
      url: url => ['', '/', '/index'].includes(url),
      template: 'index.ftl',
      syncDataPath: 'index-data',
    },
    {
      url: '/tanks/shining.do',
      template: 'pages/tanks/shining.ftl',
    },
    {
      url: '/page',
      template: '/aa/bb/cc.ftl',
      syncDataPath: 'pageASpecial',
    },
    {
      url: ctx => ctx.url.includes('pageEntry'),
      template: 'page/entry2.ftl',
    },
    {
      url: /^\/regexp\/page/,
      template: '/page/entry3.html',
    },
  ],
  noTemplateEngine: true,
  templateRoots: ['./template'],
  syncDataRoot: 'sync',
  controllerRoot: 'controller',
  specialControllers: [
    {
      url: /^\/ax\//,
      path: './xxx/special.js',
    },
    {
      url: url => url.includes('love'),
      path: './love/a.js',
    },
  ],
  static: [
    '.',
  ],
  async beforeController(ctx, next) {
    console.info('before');
    ctx.response.set('Access-Control-Allow-Origin', '*');
    ctx.response.set('Access-Control-Allow-Methods', 'GET, POST, DELETE');
    if (ctx.request.path === '/foo' && ctx.request.method === 'DELETE') {
      ctx.body = { retCode: 200 };
    } else {
      await next();
    }
  },
  async afterController(ctx, next) {
    console.info('this is after handler');
    await next();
  },
  onStartUp() {
    console.info('server started');
  },
};

```

## Request matching
The key concept of mockr is the mapping rule of requests. It is just a simplified koa controller. When requests comming, mockr will find controller of data file according the path of requests or from you configured mapping rule.

### Default matching rule
By default, mockr has a rule for all requests: when a request comes, mockr will find the controller in the controller path. The controller path will be the combination of `controllerRoot` and request's path.

For example, you request `https://3000/a/b/c`, and the controller root path you set in config file is `controllers`, so the final controller path will be `path.resolve(cwd, controllerRoot, '.', ctx.request.path)`,
 cwd is the directory of config file. If cwd is `/Usr/xxx`, then the final controller path will be `/Usr/xxx/controllers/a/b/c`.
 Then, mockr try to require the controller from that path, if the require result is a function, mockr will invoke it, otherwise mockr will execute `ctx.body = mock(requireResult)`. So you can write a json file named `c.json` or `c.js` and put it in `/Usr/xxx/controllers/a/b/`.

### Restful URL rule
If there are params in the request URL, for example, the pattern is `/name/${name}/age/${age}`, the real URL is `/name/Tom/age/12`, you can specify the pattern in config file under `restfulURLs`. the value of this config is an array, each item of the array represents an url pattern. In this example, the config will be like this:
```
restfulURLs: [
    ['/name', null, '/age', null],
    // others
]
```

### Special rule
If rules above are not enough, you can write you own rules to match controllers in special places.
You can set `specialControllers` in config file, which is an object array, each item of it contains two properties: `url` and `path`, url can be regexp, function or string, path is the relative controller path to `controllerRoot`.
If url is regexp, mockr will execute `url.test(${requestURL})`;
If url is function, mockr will execute `url(ctx)`, the ctx is a koa [ctx](https://koajs.com/#context). otherwise mockr will just check `url === ${requestURL}`.
If check result is true, mockr will invoke the controller specified by the item.

### Page rendering
1. Freemarker

Mockr supports freemarker template rendering. You need to config `pageEntries`, `templateRoots`, `syncDataRoot` and `static` in config file.

`templateRoots` is an array of string, each item is a directory path. Usually you only need to set one item.

`pageEntries` is an object array, each item contains two or three properties: `url`, `template`, `syncDataPath`(can be omitted). `url` is the same as we mentioned in `specialRule`, `template` is the template file of the request, `syncDataRoot` just like controller, it provides sync data for the page.

`syncDataRoot` is like `controllerRoot`, mockr find data file by combining `syncDataRoot` and `syncDataPath`

2. HTML
If you don't use a template engine, you can set `noTemplateEngine: true` to. So when mockr dealing page request, it will find html file and send it to client.

### Frontend assets
Config the `static` option to make frontend asset requests to that path. Mockr use `koa-static` to server frontent assets.


### default controller
The option `defaultController` in config file can be string or function. If mockr meet an error calling controller, like controller not found, mockr will call defaultController.

### Rule priority
When request comming, mockr will first check the `pageEntries` rules to determin wether to render a page or just return data. If request matches in `pageEntries`, and `syndDataPath` for the request is set, mockr will require the data file to get sync data and render the template file in matched page entry. If `syndDataPath` is not set, mockr will try to find the sync data file by default rule.

If request is not a page to render, mockr will check the special rules to find controller.
If found, mockr will use the special controller.

If not found in special rules, mockr will check restfulURLs config.
If found, mockr will find controller by restful rule:

params in request URL will be replaced by `_param`.

For example, `/name/Top/age/12` corresponds to `/name/_param/age/_param`.

If still not found, mockr will try to find the controller by default rule.

### Feature

1. Only when you modify the config file `mockr-config.js` you need to restart mockr. Other changes of like `first level required` mock data or controllers will apply immediately without restart.

first level required: It means files which directly required by mockr. For example, when mockr got a request `/abc/dev` and matches the controller `/some/place/ctrl.js`, then the controller file is first level required.
If ctrl.js requires another js file or json file, like this:
```
const dataJson = require('./data.json');
// ...
module.exports = (ctx) => {
  ctx.body = dataJson;
};
```
Then the data.json is is not first level required. So if you modify the content of data.json, you need to restart mockr;

2. You can set `beforeController` and `afterController` to handle some logic before and after the controller logic, like set cross domain allow.

### Demo
See [test](https://github.com/yubaoquan/mockr/tree/master/test) for more config detail

## License

ISC
