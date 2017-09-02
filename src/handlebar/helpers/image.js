module.exports = function (url, width, height) {
    return Menkule.cloudinaryBaseUrl + "/" + "w_" + width + "," + "h_" + height + ",c_fill/" + (url != null ? url : Menkule.nullImageUrl);
}