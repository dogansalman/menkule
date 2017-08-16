module.exports = function (value, decimalCount, options) {
    var accounting = require('accounting-js');
    if (typeof decimalCount != "number") {
        options = decimalCount;
        decimalCount = 2;
    }
    return new Handlebars.SafeString(accounting.formatMoney(value, '', decimalCount, '.', ','));
}