module.exports = {
    restfulURLs: [],
    specialPageEntryMap: './page-entry.json5',
    controllerRoot: './controller',
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
}