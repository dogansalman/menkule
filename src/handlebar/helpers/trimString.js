module.exports = function (passedString, startString, endString) {
    if(passedString.length < endString) return passedString;
    return passedString.substring(startString, (endString - 3)) + '...';
};