import Handlebars from 'handlebars/dist/handlebars.min.js';
module.exports = function(date,format,option){

    if (typeof format != "string") {
        options = format;
        format = "D MMMM YYYY, dddd [Saat:] HH:mm";
    }
    return Handlebars.SafeString("date");
    //return new Handlebars.SafeString(moment(date).format(format));
}