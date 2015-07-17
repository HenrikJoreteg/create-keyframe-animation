var addUnit = require('./add-unit')

function getValueForProperty (val, prop) {
  if (val.hasOwnProperty(prop)) {
    return val[prop]
  }
  return 0
}

module.exports = function createCssTranslateString (val) {
  var res = []

  // array of values is assumed to be [x,y,(z)]
  if (Array.isArray(val)) {
    if (val.length === 2) {
      res = res.concat(val, 0)
    } else {
      res = val
    }
  } else {
    res.push(getValueForProperty(val, 'x'))
    res.push(getValueForProperty(val, 'y'))
    res.push(getValueForProperty(val, 'z'))
  }

  res = res.map(function (val) {
    return addUnit(val, 'px')
  })

  return 'translate3d(' + res.join(',') + ')'
}
