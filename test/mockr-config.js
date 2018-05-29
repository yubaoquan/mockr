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
            template: '/page/entry3',
        },
    ],
    templateRoots: ['./template'],
    syncDataRoot: 'sync',
    controllerRoot: 'controller',
    specialControllers: [
        {
            reg: /^\/ax\//,
            path: './xxx/special.js',
        },
        {
            matcher: (url) => {
                return url.includes('love')
            },
            path: './love/a.js',
        },
    ],
    static: [
        '.',
    ],
}