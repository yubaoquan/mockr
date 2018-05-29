# mockr
A simple mock server based on koa.

[中文文档](https://github.com/yubaoquan/mockr/blob/master/README.cn.md)

## Install

> npm i @ybq/mockr

## Usage

> npm run mockr

mockr will find the config file named `mockr-config.js` in current directory

## Config

### Default matching rule
By default, mockr has a rule for all requests: when a request comes, mockr will find the controller in the controller path. The controller path will be the combination of the root controller path and the request's path.

For example, you request `https://3000/a/b/c`, and the controller root path you set in config file is `controllers`, so the final controller path will be `path.resolve(cwd, controllerRoot, '.', ctx.request.path)`, cwd is the directory of config file. If cwd is `/Usr/xxx`, then the final controller path will be `/Usr/xxx/controllers/a/b/c`. Then, mockr will try to require the controller from that path, if the require result is a function, mockr will invoke it, otherwise mockr will execute `ctx.body = requireResult`. So you can write a json file named `c.json` or `c.js` and put it in `/Usr/xxx/controllers/a/b/`.

### Restful URL rule
If there are params in the request URL, for example, the pattern is `/name/${name}/age/${age}`, the real URL is `/name/Tom/age/12`, you can specify the pattern in config file under `restfulURLs`. the value of this config is an array, each item of the array represents an url pattern. In this example, the config will be like this:
```
restfulURLs: [
    ['/name', null, '/age', null],
    // others
]
```

### Special rule
If the rules above is not enough, you can write you own rules to match controllers in special places. You can set `specialControllers` in config file, the value of it is an array, each item of array is an object contains two properties: `url` and `path`, url can be regexp, function or string, path is the relative controller path to controller root. If url is regexp, mockr will execute `url.test(${requestURL})`; If url is function, mockr will execute `url(${requestURL})`, otherwise mockr will just check `url === ${requestURL}`. If check result is true, mockr will invoke the controller specified by the item.



### Page rendering
Mockr supports freemarker template rendering. You need to config `pageEntries`, `templateRoots`, `syncDataRoot` and `static` in config file.

`templateRoots` is an array of string, each item is a directory path. Usually you only need to set one item.

`pageEntries` is an array, each item is an object contains two or three properties: `url`, `template`, `syncDataPath`(can be omitted). `url` is the same as we mentioned in `specialRule`, `template` is the template file of the request, `syncDataRoot` just like controller, it provides sync data for the page.

`syncDataRoot` is like `controllerRoot`, mockr find data file by combining `syncDataRoot` and `syncDataPath`

### Rule priority
When request comming, mockr will first check the `pageEntries` rules to determin wether to render a page or just return data. If request matches in `pageEntries`, and `syndDataPath` for the request is set, mockr will require the data file to get sync data and render the template file in matched page entry. If `syndDataPath` is not set, mockr will try to find the sync data file by default rule.

If request is not a page to render, mockr will check the special rules to find controller.
If found, mockr will use the special controller.

If not found in special rules, mockr will check restfulURLs config.
If found, mockr will find controller by restful rule: params in request URL will be replaced by `_param`.
For example, `/name/Top/age/12` corresponds to `/name/_param/age/_param`.

If still not found, mockr will try to find the controller by default rule.


### Feature

1. Only if you modify the config file you need to restart mockr, otherwise you will not need to restart it. It means the change of mock data or controllers will apply immediately.

### Demo
See [test](https://github.com/yubaoquan/mockr/tree/master/test) for more config detail

## License

ISC