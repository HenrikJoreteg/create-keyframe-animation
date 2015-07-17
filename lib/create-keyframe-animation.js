var getStyles = require('./get-styles')
var prefix = require('./prefix')

function getLine (percentage, styles) {
  if (typeof percentage === 'number') {
    percentage += '%'
  } else if (typeof percentage === 'string' && percentage.indexOf('%') === -1) {
    percentage += '%'
  }
  return percentage + '{' + getStyles(styles) + '}'
}

module.exports = function (name, positions) {
  var buf = '@' + prefix + 'keyframes ' + name + '{'

  // we got an array of arrays
  if (Array.isArray(positions)) {
    buf += positions.map(function (pos, index) {
      var percentage

      if (index) {
        percentage = (index / (positions.length - 1)) * 100
      } else {
        percentage = 0
      }

      return getLine(percentage, pos)
    }).join('')
  } else {
    for (var key in positions) {
      buf += getLine(key, positions[key])
    }
  }

  buf += '}'

  return buf
}
