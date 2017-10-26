module.exports = function (url, width, height) {
    if(url) {
       return  width > 0 && height > 0 ? Menkule.cloudinaryBaseUrl + "/" + "w_" + width + "," + "h_" + height + ",c_fill/" +  url : Menkule.cloudinaryBaseUrl + "/" +  url
    }
    return Menkule.nullImageUrl;
}