module.exports = function (url, width, height) {
     return url ?  Menkule.cloudinaryBaseUrl + "/" + "w_" + width + "," + "h_" + height + ",c_fill/" +  url :  Menkule.nullImageUrl;
}