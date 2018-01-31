module.exports = function (passedString, startString, endString) {
    if(passedString.length < 55) return passedString;
    return passedString.substring(startString, (endString - 3)) + '...';
};