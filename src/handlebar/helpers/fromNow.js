module.exports = function (date, suffix, options) {
    if (typeof suffix != "boolean") {
        options = suffix;
        suffix = false;
    }
    if (typeof suffix != "boolean") suffix = false;
    return moment(date).fromNow(suffix);
}