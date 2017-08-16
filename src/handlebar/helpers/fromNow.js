import Handlebars from 'handlebars/dist/handlebars.min.js';
module.exports = function (date, suffix, options) {
    if (typeof suffix != "boolean") {
        options = suffix;
        suffix = false;
    }
    if (typeof suffix != "boolean") suffix = false;
    return new Handlebars.SafeString(moment(date).fromNow(suffix));
}