(function() {
	'use strict';

	// Actual plugin definition
	function factory($) {
		$.fn.entropizer = function() {
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
