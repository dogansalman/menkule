import Handlebars from 'handlebars/dist/handlebars.min.js';
module.exports = function (value) {
    return new Handlebars.SafeString(value.turkishToLower().replace(/\ /g, '_').replace(/[^a-z0-9_]/gi,''));
}