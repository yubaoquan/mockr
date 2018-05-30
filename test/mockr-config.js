module.exports = {
    restfulURLs: [
        ['/a', null, '/b', null],
    ],
    pageEntries: [
        {
            url: (url) => ['', '/', '/index'].includes(url),
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
            url: (url) => url.includes('pageEntry'),
            template: '/page/entry2',
        },
        {
            url: /^\/regexp\/page/,
            template: '/page/entry3.ftl',
        },
    ],
    templateRoots: ['./template'],
    syncDataRoot: 'sync',
    controllerRoot: 'controller',
    specialControllers: [
        {
            url: /^\/ax\//,
            path: './xxx/special.js',
        },
        {
            url: (url) => url.includes('love'),
            path: './love/a.js',
        },
    ],
    static: [
        '.',
    ],
    beforeHandler(ctx, next) {
        console.info('before')
        ctx.response.set('Access-Control-Allow-Origin', '*')
        ctx.response.set('Access-Control-Allow-Methods', 'GET, POST, DELETE')
        ctx.body = 'xxx'
        if (ctx.request.path === '/foo' && ctx.request.method === 'DELETE') {
            ctx.body = { retCode: 200 }
        } else {
            next()
        }
    },
    afterHandler(ctx, next) {
        console.info(`this is after handler`)
        next()
    },
}