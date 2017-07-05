import Handlebars from 'handlebars/runtime';
import  Menkule from '../lib/menkule';
import  accounting from 'accounting-js';

const menkule = new Menkule();
function handlebarsHelper(){}

// Handlebars require
// Select option
Handlebars.registerHelper("select", function (value, options) {
    return options.fn(this)
        .split('\n')
        .map(function (v) {
            var t = 'value="' + value + '"'
            return !RegExp(t).test(v) ? v : v.replace(t, t + ' selected="selected"')
        })
        .join('\n')
});
// Radiobutton option
Handlebars.registerHelper('radio', function( value, options ){
    return options.fn(this)
        .split('\n')
        .map(function (v) {
            var t = 'value="' + value + '"'
            return !RegExp(t).test(v) ? v : v.replace(t, t + ' checked="checked"')
        })
        .join('\n')
});

//For
Handlebars.registerHelper('times', function (n, block) {
    var accum = '';
    for (var i = 1; i <= n; ++i)
        accum += block.fn(i);
    return accum;
});


// Currency Format
Handlebars.registerHelper("currency", function (value, decimalCount, options) {
    if (typeof decimalCount != "number") {
        options = decimalCount;
        decimalCount = 2;
    }
    return new Handlebars.SafeString(accounting.formatMoney(value, '', decimalCount, '.', ','));
});

//Convert Char To Eng
Handlebars.registerHelper("toLink", function (value) {
    return new Handlebars.SafeString(value.turkishToLower().replace(/\ /g, '_').replace(/[^a-z0-9_]/gi,''));
});

//logged
Handlebars.registerHelper('isLogin', function(block) {
    if (menkule.hasToken())
        return block.fn(this);
    else
        return block.inverse(this);
});
//isActive
Handlebars.registerHelper('isActive', function(block) {
    return menkule.getUser().state;
});
//notLogged
Handlebars.registerHelper('notLogged', function(block) {
    if (!menkule.hasToken())
        return block.fn(this);
    else
        return block.inverse(this);
});


// Json Stringify
Handlebars.registerHelper("json", function (data, param) {
    var stringfy = jQuery.parseJSON(data);
    return new Handlebars.SafeString(stringfy[param]);
});


// Images format
Handlebars.registerHelper("image", function (url, width, height) {
    return new Handlebars.SafeString(menkule.cloudinaryBaseUrl + "/" + "w_" + width + "," + "h_" + height + ",c_fill/" + (url != null ? url : menkule.nullImageUrl));
});

// MomentJS format
Handlebars.registerHelper("date", function (date, format, options) {
    if (typeof format != "string") {
        options = format;
        format = "D MMMM YYYY, dddd [Saat:] HH:mm";
    }
    return new Handlebars.SafeString(moment(date).format(format));
});

// MomentJS fromNow
Handlebars.registerHelper("fromNow", function (date, suffix, options) {
    if (typeof suffix != "boolean") {
        options = suffix;
        suffix = false;
    }
    if (typeof suffix != "boolean") suffix = false;
    return new Handlebars.SafeString(moment(date).fromNow(suffix));
});

// Raw Helper
Handlebars.registerHelper('raw-helper', function(options) {
    return options.fn();
});

// Execute helper
Handlebars.registerHelper("x", function(expression, options) {
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
});

// xIf with variables
Handlebars.registerHelper("xif", function(expression, options) {
    return Handlebars.helpers["x"].apply(this, [expression, options]) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper("z", function () {
    var options = arguments[arguments.length - 1]
    delete arguments[arguments.length - 1];
    return Handlebars.helpers["x"].apply(this, [Array.prototype.slice.call(arguments, 0).join(''), options]);
});

Handlebars.registerHelper("zif", function () {
    var options = arguments[arguments.length - 1]
    delete arguments[arguments.length - 1];
    return Handlebars.helpers["x"].apply(this, [Array.prototype.slice.call(arguments, 0).join(''), options]) ? options.fn(this) : options.inverse(this);
});

export default handlebarsHelper;
