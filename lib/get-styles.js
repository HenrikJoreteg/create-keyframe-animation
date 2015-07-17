var createCssTranslateString = require('./create-css-translate-string')
var prefix = require('./prefix')
var addUnit = require('./add-unit')

var lookups = {
  scale: function (val) {
    return 'scale(' + val + ')'
  },
  rotate: function (val) {
    return 'rotate(' + addUnit(val, 'deg') + ')'
  },
  translate: function (val) {
    return createCssTranslateString(val)
  },
  transform: function (val) {
    return val
  }
}

module.exports = function getStyles (obj) {
  // array of values is assumed to be [x,y,(z)]
  if (Array.isArray(obj)) {
    return prefix + 'transform:' + createCssTranslateString(obj)
  }

  var transformBuff = []
  var otherStyles = []

  // object assumes
  if (typeof obj === 'object') {
    for (var key in obj) {
      if (lookups[key]) {
        transformBuff.push(lookups[key](obj[key]))
      } else {
        otherStyles.push(key + ':' + obj[key])
      }
    }
  }

  otherStyles.push(prefix + 'transform:' + transformBuff.join(''))

  return otherStyles.join(';')
}
