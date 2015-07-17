# create-keyframe-animation

Generate CSS keyframe animations dynamically in the browser with JavaScript.

You describe them in JS and it generates and inserts a `<style>` in the document `<head>` with a CSS keyframe animation. 

This lets you dynamically calculate values based on positions and lets you actually run the animations performantly without having to deal with or run `requestAnimationFrame` loops.

** caveat ** this is experimental and I'm not entirely sure this is a good idea, nor am I sure I actually want to maintain this lib :) But I'm sharing this here because I thought it was interesting and sharing it for educational purposes. If someone wants to take this and run with it ping me on twitter: [@HenrikJoreteg](http://twitter.com/henrikjoreteg).

DEMO TIME! Here's a fun thing I built with this tool: http://dot.surge.sh

I'll probably write a post about this approach, I think it has some merits. Largely because `requestAnimationFrame` loops eat up battery power on mobile devices if left running and it's nice that once you've registered an animation, actually runnning it happens off of the main JS thread. Plus, as I said, you don't have to write CSS with known values ahead of time.

so...

Normally CSS animations are declared in a separate CSS style sheet, like so:

```css
@keyframes move {
  0% {
    transform: translate3d(0,0,0)
  }
  100% {
    transform:translate3d(1px,1px,0)
  }
}
```

This can be a bit tedious to write (even with preprocessors) and becomes difficult if you want to dynamically change those fixed pixel values when your app is running in the browser. 

What I wanted to be able to do was this:

```js
var animations = require('create-keyframe-animation')

// this creates the animation above
animations.registerAnimation({
  name: 'move',
  // the actual array of animation changes
  animation: [
	[0,0], 
	[1,1]
  ],
  // optional presets for when actually running the animation
  presets: {
    duration: 1000,
    easing: 'linear',
    delay: 500
  }
})

// then run it
animations.runAnimation(el, 'move', function () {
	// callback gets called when its done
})

// it also will return a promise if a `Promise` global exists letting you easily chain animations
animations.runAnimation(el, 'moveUp')
	.then(function () {
		return animations(el, 'wiggle')
	})
	.then(function () {
		return animations(el, 'jiggle')
	})
	.then(function () {
		return animations(el, 'shake')
	})
	.then(function () {
		console.log('done!')
	})
	.catch(function (err) {
		console.error(err)
	})

```

Or we can get fancy and animate other properties that are [cheap to animate](http://www.html5rocks.com/en/tutorials/speed/high-performance-animations/) like, scale and opacity.

```js
registerAnimation('moveit', [
	{
		translate: [0, 50],
		opacity: 0.5,
		scale: 2
	},
	{
		translate: [0, 50],
		opacity: 0.5,
		scale: 2
	},
	...,
	...
])
```

Or get extra fancy...

The following is an excerpt from the code in the demo:  http://dot.surge.sh/

It creates an animation of two portions, using the element's current translated position as a starting point.

It drop it vertically from its current position then bounces and spin it so it lands on the bottom left corner of the screen.

This is the code used to generate the animation for each of the 5 dots when you hit the "X" to bring the back to the stating position in this demo: http://dot.surge.sh/


```javascript
import getPosition from 'get-css-translated-position'
import animations from 'create-keyframe-animation'
import adaptiveQuadratic from 'adaptive-quadratic-curve'
import ww from 'window-watcher'


export default function (el, name) {
  const {x, y} = getPosition(el, {includePageOffset: true})
  const distanceToDrop = ww.height - y

  // calculate dynamic bounce in animation
  var fullWidth = ww.width + 50

  var start = [x, y]
  var c1 = [x, distanceToDrop]
  var middle = [x, ww.height - 50]
  var c2 = [fullWidth * 0.22, (distanceToDrop * 0.75)]
  var end = [20, ww.height - 70]

  var points = []
  adaptiveQuadratic(start, c1, middle, 50, points)
  adaptiveQuadratic(middle, c2, end, 50, points)

  var middle = Math.round(points.length / 2)

  points = points.map(function (point, i) {
    var rotate = 0
    if (i) {
      rotate = (-360 * (i / points.length))
    }
    if (i === (points.length - 1)) {
      rotate = -360
    }
    return {
      translate: point,
      rotate: rotate
    }
  })

  animations.registerAnimation({
    name: name,
    animation: points,
    presets: {
      duration: 1000,
      easing: 'linear',
      delay: 500
    }
  })
}
```

## install

```
npm install create-keyframe-animation
```

## basic API docs

### `.registerAnimation(opts)`

options and defaults below

#### opts.name string (required)

The name of the animation. This is what you use when you run it.

#### opts.animation (object or array)

If you give it an object, they key is the keyframe so all the following are valid and identical:

```js
animations.registerAnimation({
	name: 'move',
	animation: {
		start: [0, 0],
		end: [1, 1]
	}
}

animations.registerAnimation({
	name: 'move',
	animation: {
		0: [0, 0],
		100: [1, 1]
	}
}

animations.registerAnimation({
	name: 'move',
	animation: {
		'0%': [0, 0],
		'100%': [1, 1]
	}
}

animations.registerAnimation({
	name: 'move',
	// when you give it an array the keyframe percentages are calculated
	// linearly based on index
	animation: [[0, 0], [1, 1]]
}
```

The positional args are always assumed to be pixels and will be applied using `transform: translate3d()` for best performance.

You can also animate the other things that are [cheap to animate](http://www.html5rocks.com/en/tutorials/speed/high-performance-animations/). 

```js
animations.registerAnimation({
	name: 'moveFadeInGrow',
	animation: [
		{
			x: 0,
			y: 0,
			opacity: 0,
			scale: 0.5
		},
		{
			x: 1,
			y: 1,
			opacity: 0.8,
			scale: 2
		}
	]
}
```

Other options and their defaults

```js
{
  duration: 1000, // duration in milliseconds
  fillMode: 'both', // css animation fill mode property
  easing: 'ease', // default easing
  iterations: 1, // default number of iterations
  delay: 0, // delay in milliseconds
  direction: 'normal', // animation direction
  resetWhenDone: false, // if true will apply the final animation state as a `transform` property
  clearTransformsBeforeStart: false // whether or not to clear any existing transforms before animation starts
}
```

### `.runAnimation(element(s), name string or options object, [callback]) `

Run animation with the name specified on the nodes you pass in. 

Returns a promise if: `Promise` exists on the `window` object *and* you don't pass a callback.

#### element (actual dom node or nodes to apply animation to)

This can be a single element, an array of elements or the result of `querySelectorAll`, jQuery should work too, but I don't use it so I haven't tested. 

#### name or options object

If this is a string it's assumed to be the name of the animation to run.

If you set `presets` when you registered the animation, you can run them easily: 

```js
animations.runAnimation(document.querySelectorAll('.dots'), 'wigggle')
```

If you pass an object it has to contain the name:

```js
animations.runAnimation(document.querySelectorAll('.dots'), {
	name: 'wiggle',
	delay: 1500 // here we can override any of the preset options as described above
}, function () {
	console.log('done!')
})
```

#### callback

If you pass a callback it will get called when the `animationend` or the browser specific equivalent is called.


## credits

If you like this follow [@HenrikJoreteg](http://twitter.com/henrikjoreteg) on twitter.

## license

MIT

