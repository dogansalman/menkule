import Handlebars from 'handlebars/dist/handlebars.min.js';
module.exports = function (url, width, height) {
    return new Handlebars.SafeString(Menkule.cloudinaryBaseUrl + "/" + "w_" + width + "," + "h_" + height + ",c_fill/" + (url != null ? url : Menkule.nullImageUrl));
}