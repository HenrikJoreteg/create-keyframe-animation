/*global getComputedStyle */
var defaults = require('lodash.defaults')
var prefixedEvent = require('prefixed-event')
var loadStyles = require('load-styles')
var createAnimation = require('./lib/create-keyframe-animation')
var animationProperty = require('./lib/animation-property')
var promisify = require('native-promisify-if-present')
var addUnit = require('./lib/add-unit')

// make portions of this server testable
if (typeof window !== 'undefined') {
  var transformProperty = require('transform-property')
}

// our storage for registered animations
var registeredAnimations = {}

var mainDefaults = {
  duration: 1000,
  fillMode: 'both',
  easing: 'ease',
  iterations: 1,
  delay: 0,
  direction: 'normal',
  resetWhenDone: false,
  clearTransformsBeforeStart: false
}

exports.hasAnimation = function (name) {
  return registeredAnimations.hasOwnProperty(name)
}

function setAnimationProp (els, val, opts) {
  var clearTransforms = (opts && opts.clearTransforms === true)
  // we got a collection, potentially
  for (var i = 0, l = els.length; i < l; i++) {
    // we do both because... chrome does both
    if (clearTransforms) {
      clearTransformProp(els[i])
    }
    els[i].style[animationProperty] = val
  }
}

function clearTransformProp (el) {
  el.style.transform = ''
  el.style[transformProperty] = ''
}

function clearAnimationProp (el) {
  el.style[animationProperty] = ''
  el.style.animation = ''
}

function setAnimationAsTransform (els, opts) {
  var clearAnimations = (opts && opts.clearAnimations === true)
  // we got a collection, potentially
  for (var i = 0, l = els.length; i < l; i++) {
    els[i].style[transformProperty] = getComputedStyle(els[i])[transformProperty]
    if (clearAnimations) clearAnimationProp(els[i])
  }
}

exports.runAnimation = promisify(function (els, opts, cb) {
  cb || (cb = function () {})
  if (typeof opts === 'string') {
    opts = {
      name: opts
    }
  }

  if (!els.length) {
    els = [els]
  }

  if (!opts.name) {
    return cb(Error('must supply animation name'))
  }

  var found = registeredAnimations[opts.name]

  if (!found) {
    return cb(Error('no animation named "' + opts.name + '" exists'))
  }

  opts = defaults(opts, found.presets, mainDefaults)

  var animationEnd = function () {
    prefixedEvent.remove(els[0], 'AnimationEnd', animationEnd)
    if (opts.resetWhenDone) {
      setAnimationAsTransform(els, {clearAnimations: true})
    }
    return cb(null, els)
  }

  prefixedEvent.add(els[0], 'AnimationEnd', animationEnd)

  var styles = [
    opts.name,
    addUnit(opts.duration, 'ms'),
    opts.easing,
    opts.iterations,
    addUnit(opts.delay, 'ms'),
    opts.direction,
    opts.fillMode
  ]

  setAnimationProp(els, styles.join(' '), {clearTransforms: opts.clearTransformsBeforeStart})
})

exports.unregisterAnimation = function (name) {
  if (exports.hasAnimation(name)) {
    var styleEl = registeredAnimations[name].el
    styleEl.parentNode.removeChild(styleEl)
    delete registeredAnimations[name]
  }
}

exports.getAnimationCSS = createAnimation

exports.registerAnimation = function (opts) {
  exports.unregisterAnimation(opts.name)
  var el = loadStyles(exports.getAnimationCSS(opts.name, opts.animation))
  el.setAttribute('data-name', opts.name)

  registeredAnimations[opts.name] = {
    el: el,
    presets: opts.presets || {}
  }
}
