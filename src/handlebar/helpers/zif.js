
function executeHelper(expression, options) {
    var result;
    // you can change the context, or merge it with options.data, options.hash
    var context = this;
    if(context) {
        result = (function() {
            try {
                return eval(expression);
            } catch (e) {
                console.warn('Expression: {{x \'' + expression + '\'}}\nJS-Error: ', e, '\nContext: ', context);
            }
        }).call(context); // to make eval's lexical this=context
    }
    return result;
}
module.exports = function () {

    var options = arguments[arguments.length - 1];
    delete arguments[arguments.length - 1];
    return executeHelper.apply(this, [Array.prototype.slice.call(arguments, 0).join(''), options]) ? options.fn(this) : options.inverse(this);

}