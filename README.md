# jQuery Entropizer

*Password strength meter jQuery plugin*

For the standalone Entropizer engine, click [here](https://github.com/jreesuk/entropizer)

## What is jQuery Entropizer?

jQuery Entropizer is a simple, lightweight jQuery plugin that uses the [Entropizer engine](https://github.com/jreesuk/entropizer) to
calculate password entropy. It's easy to set up and provides several hooks to customize the UI.

jQuery Entropizer supports [AMD](http://requirejs.org/) and [CommonJS](http://wiki.commonjs.org/wiki/CommonJS). It is available
as a [bower](http://bower.io/) component.

## Demos

Some basic demos can be found [here](http://jreesuk.github.io/jquery-entropizer/).

## Getting Started

This plugin requires both [jQuery](http://jquery.com/) (1.7.2+) and [Entropizer](https://github.com/jreesuk/entropizer).

Basic usage:

```html
<label for="pwd">Please enter a password</label>
<input type="password" id="pwd" name="pwd" />
<div id="meter"></div>
```

```js
// Creates a default Entropizer meter inside #meter and watches the first password field on the
// page by default
$('#meter').entropizer();
```

Options and examples:

```js
// Create an Entropizer meter using custom options
$('#meter').entropizer({

	// The input field to watch: any selector, DOM element or jQuery instance
	// Default: 'input[type=password]:first'
	target: '#pwd',
	
	// The event(s) upon which to update the meter UI
	// Default: 'keydown keyup'
	on: 'keydown',

	// Used to calculate the percentage of the bar to fill (see map function below)
	// Default: 100
	maximum: 80,

	// An array of ranges to use when classifying password strength. Used internally by default map
	// function and can be used publicly via $.entropizer.classify(value, buckets). Properties
	// 'min' and 'max' are used to calculate which bucket to use - upon finding a match, an object
	// containing all the other properties is returned, e.g. below, a value of 42 returns
	// { message: ':)' }
	// Default: 4 ranges with strength and color properties (see source for values)
	buckets: [
		{ max: 40, message: ':(' },
		{ min: 40, max: 60, message: ':)' },
		{ min: 60, message: ':D' }
	],

	// Either an Entropizer engine options object or an Entropizer instance
	// Default: a new Entropizer instance with default settings
	engine: {
		classes: ['lowercase', 'uppercase', 'numeric']
	},

	// A callback controlling UI creation - takes a jQuery instance representing the container
	// and returns an object containing UI components for access in update and destroy
	// Default: creates a track element (the bar background), a bar element and a text element
	create: function(container) {
		var bar = $('<div>').appendTo(container);
		return { foo: bar };
	},
	
	// A callback controlling UI cleanup - takes the UI object created by create
	// Default: removes the track, bar and text elements
	destroy: function(ui) {
		ui.foo.remove();
	},

	// A callback that maps the raw entropy value to an object passed to update. First argument is
	// the number of bits of entropy, second argument is an object containing all properties on
	// the options object apart from target, on, engine and the callbacks (i.e. by default, just
	// maximum and buckets)
	// Default: uses maximum and buckets above to return an object with entropy, percent, strength
	// and color properties
	map: function(entropy, mapOptions) {
		return $.extend({ entropy: entropy }, $.entropizer.classify(entropy, mapOptions.buckets));
	},

	// A callback controlling UI updates - takes the data returned by map and the ui object
	// Default: updates the width and background color of the bar, and displays the number of bits
	update: function(data, ui) {
		ui.foo.text(data.entropy.toFixed(0) + ' ' + data.message);
	}
});
```

If you need to remove an `entropizer` instance:

```js
$('#meter').entropizer('destroy');
```

This will unbind all Entropizer events from the target and invoke the `destroy` callback.

## Styling

The default UI creates elements for the track, bar and text - these use the CSS classes
`entropizer-track`, `entropizer-bar` and `entropizer-text` respectively. Default styles for these
elements can be found in the provided CSS stylesheet.

## Engine options

For a guide to Entropizer engine options, see the readme [here](https://github.com/jreesuk/entropizer).

## Browser compatibility

jQuery Entropizer supports IE6+, Firefox, Chrome and Opera.
