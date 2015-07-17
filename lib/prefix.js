var prefix = ''

// figure out if we need -webkit- prefix or not
if (typeof document !== 'undefined') {
  var el = document.documentElement || document.createElement('div')
  prefix = (el.style.animation != null) ? '' : '-webkit-'
}

module.exports = prefix
