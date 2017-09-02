module.exports = function (value) {
    return value.turkishToLower().replace(/\ /g, '_').replace(/[^a-z0-9_]/gi,'');
}