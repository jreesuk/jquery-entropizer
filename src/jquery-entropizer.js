(function() {
	'use strict';

	// Actual plugin definition
	function factory($, Entropizer) {

		var defaults = {
			target: 'input[type=password]:first',
			on: 'keydown keyup'
		};

		function Meter(container, options) {
			this.options = $.extend({}, defaults, options);
			this.render = this.options.render || this._render;
			this.map = this.options.map || this._map;
			this.container = container;
			this.entropizer = new Entropizer();
			this.target = $(this.options.target);
			this.target.on(this.options.on, this.update.bind(this));
			this.update();
		}

		Meter.prototype.update = function() {
			var password, entropy, data;
			password = this.target.val();
			entropy = this.entropizer.evaluate(password);
			data = this.map.call(this, entropy);
			this.render.call(this, data);
		};

		// Default map
		Meter.prototype._map = function(entropy) {
			return {
				entropy: entropy
			};
		};

		// Default rendering
		Meter.prototype._render = function(data) {
			this.container.html(data.entropy.toFixed(0));
		};

		$.fn.entropizer = function(options) {
			return this.data('entropizer', new Meter(this, options));
		};
	}

	// Module definition
	(function(factory) {

		// AMD module
		if (typeof define === 'function' && define.amd) {
			define(['jquery', 'entropizer'], factory);
		}
		// CommonJS - don't need to export anything as it's a plugin
		else if (typeof module === 'object' && typeof module.exports === 'object') {
			factory(require('jquery'), require('entropizer'));
		}
		// Use globals if no module framework
		else {
			factory(jQuery, Entropizer);
		}
	})(factory);

})();
