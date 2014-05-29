(function() {
	'use strict';

	// Actual plugin definition
	function factory($, Entropizer) {

		var defaults = {
			target: 'input[type=password]:first',
			on: 'keydown keyup',
			maximum: 100,
			buckets: [
				{ max: 45, strength: 'poor', color: '#d00' },
				{ min: 45, max: 60, strength: 'ok', color: '#f80' },
				{ min: 60, max: 75, strength: 'good', color: '#8c0' },
				{ min: 75, strength: 'excellent', color: '#0c8' }
			],
			create: function(container) {
				var track = $('<div>').addClass('entropizer-track').appendTo(container),
					bar = $('<div>').addClass('entropizer-bar').appendTo(track),
					text = $('<div>').addClass('entropizer-text').appendTo(track);
				return {
					track: track,
					bar: bar,
					text: text
				};
			},
			destroy: function(ui) {
				ui.track.remove();
			},
			map: function(entropy, mapOptions) {
				var selectedBucket = $.entropizer.classify(entropy, mapOptions.buckets);
				var percent = Math.min(1, entropy / mapOptions.maximum) * 100;
				return $.extend({ entropy: entropy, percent: percent }, selectedBucket);
			},
			update: function(data, ui) {
				ui.bar.css({
					'background-color': data.color,
					'width': data.percent + '%'
				});
				ui.text.html(data.strength + ' (' + data.entropy.toFixed(0) + ' bits)');
			},
			engine: null
		};

		function Meter(container, options) {			
			this.options = $.extend({}, defaults, options);
			this.mapOptions = this.createMapOptions(this.options);
			this.entropizer = this.createEngine(this.options.engine);
			this.ui = this.options.create(container);
			this.target = $(this.options.target);
			this.target.on(this.namespaceEvents(this.options.on), $.proxy(this._update, this));
			this._update();
		}

		Meter.prototype.createMapOptions = function(options) {
			var clone = $.extend({}, options);
			$.each(['target', 'on', 'create', 'destroy', 'map', 'render', 'engine'], function(index, name) {
				delete clone[name];
			});
			return clone;
		};

		Meter.prototype.createEngine = function(engineOptions) {
			if (engineOptions && engineOptions.constructor === Entropizer) {
				return engineOptions;
			}
			return new Entropizer(engineOptions);
		};
		
		Meter.prototype.namespaceEvents = function(events) {
			var namespaced = [];
			$.each(events.split(' '), function(index, event) {
				namespaced.push(event + '.entropizer');
			});
			return namespaced.join(' ');
		};

		Meter.prototype._destroy = function() {
			this.target.off('.entropizer');
			this.options.destroy(this.ui);
		};

		Meter.prototype._update = function() {
			var password = this.target.val(),
				entropy = this.entropizer.evaluate(password),
				data = this.options.map(entropy, this.mapOptions);
			this.options.update(data, this.ui);
		};

		$.entropizer = {
			classify: function(value, buckets) {
				var selectedBucket,
					clone;
				$.each(buckets, function(index, bucket) {
					if ((!bucket.min || value >= bucket.min) && (!bucket.max || value < bucket.max)) {
						selectedBucket = bucket;
						return false;
					}
				});
				if (!selectedBucket) {
					return null;
				}
				// Clone the bucket without min, max
				clone = $.extend({}, selectedBucket);
				delete clone.min;
				delete clone.max;
				return clone;
			}
		};
		
		$.fn.entropizer = function(options) {
			var key = 'entropizer';
			if (options === 'destroy') {
				this.data(key)._destroy();
				this.removeData(key);
			}
			else {
				return this.data(key, new Meter(this, options));
			}
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
