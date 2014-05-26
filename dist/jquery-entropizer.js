/*!
 * jquery-entropizer - 0.0.1
 * Built: 2014-05-26 01:27
 * https://github.com/jreesuk/jquery-entropizer
 * 
 * Copyright (c) 2014 Jonathan Rees
 * Licensed under the MIT License
 */
(function() {
	'use strict';

	// Actual plugin definition
	function factory($, Entropizer) {

		function Meter($this, options) {
			this.options = options;
			this.$this = $this;
			$(options.target).on('keydown keyup', this.update.bind(this));
			this.update();
		}

		Meter.prototype.update = function() {
			var password = $(this.options.target).val();
			var entropy = new Entropizer().evaluate(password);
			this.$this.html(entropy.toFixed(0));
		};

		$.fn.entropizer = function(options) {
			if (options && options.target) {
				this.data('entropizer', new Meter(this, options));
			}
			return this;
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
