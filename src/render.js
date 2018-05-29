module.exports = function(config) {
    let [ firstRoot, ...otherRoots ] = config.templateRoots
    let render = require('@ybq/jmockr-ftl-render')({
        templateRoot: firstRoot,
        moduleFtlPathes: otherRoots,
    })
    return function(template, data, config) {
        return new Promise((resolve, reject) => {
            try {
                render(template, data, (html) => resolve(html))
            } catch (e) {
                reject(e)
            }
        })
    }
}
