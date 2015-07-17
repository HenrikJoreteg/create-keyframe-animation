var test = require('tape')
var getAnimation = require('../').getAnimationCSS
var getStyles = require('../lib/get-styles')

test('basics', function (t) {
  t.equal(getAnimation('move', [[0, 0], [1, 1]]), '@keyframes move{0%{transform:translate3d(0px,0px,0px)}100%{transform:translate3d(1px,1px,0px)}}')

  var animation = [
    {
      translate: [3, 5],
      rotate: 90,
      opacity: 0.5,
      scale: 2
    },
    {
      translate: [1, 1]
    },
    {
      translate: {
        x: 1,
        y: 1
      },
      rotate: 180,
      opacity: 0.7,
      scale: 1
    }
  ]
  t.equal(getAnimation('move', animation), '@keyframes move{0%{opacity:0.5;transform:translate3d(3px,5px,0px)rotate(90deg)scale(2)}50%{transform:translate3d(1px,1px,0px)}100%{opacity:0.7;transform:translate3d(1px,1px,0px)rotate(180deg)scale(1)}}')

  animation = {
    '0%': {
      translate: [0, 0],
      opacity: 1
    },
    '50%': {
      translate: [1, 1, 1],
      opacity: 1
    },
    '100%': {
      translate: [2, 2]
    }
  }

  t.equal(getAnimation('move', animation), '@keyframes move{0%{opacity:1;transform:translate3d(0px,0px,0px)}50%{opacity:1;transform:translate3d(1px,1px,1px)}100%{transform:translate3d(2px,2px,0px)}}')

  t.end()
})

test('getStyles', function (t) {
  t.deepEqual(getStyles({
    translate: {
      x: 20,
      y: 50
    }
  }), 'transform:translate3d(20px,50px,0px)')
  t.end()
})
