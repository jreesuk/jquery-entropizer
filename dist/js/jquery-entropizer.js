/*!
 * jquery-entropizer - 0.0.1
 * Built: 2014-05-27 23:08
 * https://github.com/jreesuk/jquery-entropizer
 * 
 * Copyright (c) 2014 Jonathan Rees
 * Licensed under the MIT License
 */
(function() {
	'use strict';

	// Actual plugin definition
	function factory($, Entropizer) {

		function Meter(container, options) {
			var defaults = {
				target: 'input[type=password]:first',
				on: 'keydown keyup',
				maximum: 100,
				create: this._create,
				destroy: this._destroy,
				map: this._map,
				render: this._render,
				engine: null
			};
			this.options = $.extend({}, defaults, options);
			this.entropizer = new Entropizer(this.options.engine);
			this.ui = this.options.create.call(this, container);
			this.target = $(this.options.target);
			this.target.on(this.namespaceEvents(this.options.on), $.proxy(this.update, this));
			this.update();
		}

		Meter.prototype.namespaceEvents = function(events) {
			var namespaced = [];
			$.each(events.split(' '), function(index, event) {
				namespaced.push(event + '.entropizer');
			});
			return namespaced.join(' ');
		};

		Meter.prototype.destroy = function() {
			this.target.off(this.namespaceEvents(this.options.on));
			this.options.destroy.call(this, this.ui);
		};

		Meter.prototype.update = function() {
			var password = this.target.val(),
				entropy = this.entropizer.evaluate(password),
				data = this.options.map.call(this, entropy);
			this.options.render.call(this, data, this.ui);
		};

		// Default UI creation
		Meter.prototype._create = function(container) {
			var track = $('<div>').addClass('entropizer-track').appendTo(container),
				bar = $('<div>').addClass('entropizer-bar').appendTo(track),
				text = $('<div>').addClass('entropizer-text').appendTo(track);
			return {
				track: track,
				bar: bar,
				text: text
			};
		};

		// Default UI destroy
		Meter.prototype._destroy = function(ui) {
			ui.track.remove();
		};

		// Default map
		Meter.prototype._map = function(entropy) {
			var buckets = [
				{ max: 45, strength: 'poor', color: '#d00' },
				{ min: 45, max: 60, strength: 'ok', color: '#f80' },
				{ min: 60, max: 75, strength: 'good', color: '#8c0' },
				{ min: 75, strength: 'excellent', color: '#0c5' }
			],
			selectedBucket;
			$.each(buckets, function(index, bucket) {
				if ((!bucket.min || entropy >= bucket.min) && (!bucket.max || entropy < bucket.max)) {
					selectedBucket = bucket;
					return false;
				}
			});
			return {
				entropy: entropy,
				strength: selectedBucket.strength,
				color: selectedBucket.color,
				percent: Math.min(1, entropy / this.options.maximum) * 100
			};
		};

		// Default rendering
		Meter.prototype._render = function(data, ui) {
			ui.bar.css({
				'background-color': data.color,
				'width': data.percent + '%'
			});
			ui.text.html(data.strength + ' (' + data.entropy.toFixed(0) + ' bits)');
		};

		$.fn.entropizer = function(options) {
			var key = 'entropizer';
			if (options === 'destroy') {
				this.data(key).destroy();
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
