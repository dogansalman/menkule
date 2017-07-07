module.exports = function (value, options) {
  return options.fn(this)
    .split('\n')
    .map(function (v) {
      const t = 'value="' + value + '"'
      return !(new RegExp(t)).test(v) ? v : v.replace(t, t + ' selected="selected"')
    })
    .join('\n');
};