const getType = (o) => {
    const s = Object.prototype.toString.call(o)
    return s.match(/\[object (.*?)\]/)[1].toLowerCase()
}

exports.getType = getType