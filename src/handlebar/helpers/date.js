module.exports = function(date,format,option){

    if (typeof format != "string") {

        option = format;
        format = "D MMMM YYYY, dddd [Saat:] HH:mm";
    }
    return moment(date).format(format);
}