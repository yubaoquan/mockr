
/* global define */
define([
    'pro/javascript/lib/regular',
], (x) => {
    let Regular = window.Regular
    let config = {
        BEGIN: '{',
        END: '}',
    }

    if (Regular.config) {
        Regular.config(config)
    }

    let BaseComponent = Regular.extend({
        request: function(options) {
            if (arguments.length == 2) { // 处理this.request(url, options)的情况
                let url = options
                options = arguments[1]
                options.url = url
            }
            request(options.url, options)
        },
        removeItem: function(list, index, clearList) {
            list.splice(index, 1)
        },
        showTips: function(message) {
            console.info(message)
        },
    })

    function request(url, opt) {
        opt.method = opt.method || 'post'
        window.jQuery.ajax({
            url: url,
            method: opt.method,
            data: opt.data,
            success: function(res) {
                if (res.retCode === 200) {
                    opt.successTips && console.info(opt.successTips)
                    opt.successCb && opt.successCb(res)
                } else {
                    opt.not200Tips && console.warn(opt.not200Tips)
                    opt.onFail && opt.onFail(res)
                }
            },
            error(arg1, arg2, arg3) {
                console.info(arg1)
                console.info(arg2)
                console.info(arg3)
            },
        })
    }

    return BaseComponent
})
