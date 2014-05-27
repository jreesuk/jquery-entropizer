/* global jasmine, describe, it, expect, beforeEach, afterEach */

define(['jquery', 'jquery-entropizer'], function($) {
	'use strict';

	describe('jQuery entropizer', function() {

		// Create password input and container for meter
		beforeEach(function() {
			$('<input>').attr({ id: 'username', type: 'text' }).appendTo('body');
			$('<input>').attr({ id: 'pwd', type: 'password' }).appendTo('body');
			$('<input>').attr({ id: 'confirm', type: 'password' }).appendTo('body');
			$('<div>').attr({ id: 'meter' }).addClass('meter-test').appendTo('body');
			$('<div>').attr({ id: 'meter2' }).addClass('meter-test').appendTo('body');
		});

		afterEach(function() {
			$('#username').remove();
			$('#pwd').remove();
			$('#confirm').remove();
			$('#meter').remove();
			$('#meter2').remove();
		});

		it('exists', function() {
			expect($.fn.entropizer).toBeDefined();
		});

		it('is a function', function() {
			expect(typeof $.fn.entropizer).toEqual('function');
		});

		it('returns a jQuery object', function() {
			expect($().entropizer().constructor).toBe($);
		});

		it('returns a jQuery object containing the original element', function() {
			expect($('#meter').entropizer()[0]).toBe($('#meter')[0]);
		});

		it('returns a jQuery object containing all the original elements', function() {
			var meters = $('.meter-test');
			var entropizer = meters.entropizer();
			expect(entropizer.length).toEqual(2);
			expect(entropizer[0]).toBe(meters[0]);
			expect(entropizer[1]).toBe(meters[1]);
		});

		describe('destroy', function() {

			it('tears down UI', function() {
				var meter = $('#meter');
				meter.entropizer();
				expect(meter.children().length).toBeGreaterThan(0);

				meter.entropizer('destroy');
				expect(meter.children().length).toEqual(0);
			});

			it('unbinds event handlers', function() {
				var meter = $('#meter'),
					events;

				meter.entropizer({
					target: '#pwd',
					on: 'test'
				});
				
				// Note: $._data not part of public API, subject to change
				events = $._data($('#pwd')[0], 'events');
				expect(events.test.length).toEqual(1);

				meter.entropizer('destroy');
				expect(events.test).not.toBeDefined();
			});

			it('only unbinds its own event handlers', function() {
				var meter = $('#meter'),
					handler = jasmine.createSpy(),
					handler2 = jasmine.createSpy();

				$('#pwd').on('test', handler).on('blah', handler2);

				meter.entropizer({
					target: '#pwd',
					on: 'test blah'
				});

				$('#pwd').trigger('test').trigger('blah');
				expect(handler.calls.count()).toEqual(1);
				expect(handler2.calls.count()).toEqual(1);

				meter.entropizer('destroy');

				$('#pwd').trigger('test').trigger('blah');
				expect(handler.calls.count()).toEqual(2);
				expect(handler2.calls.count()).toEqual(2);
			});

		});

		it('uses first password field as default target', function() {
			var render = jasmine.createSpy();

			$('#meter').entropizer({
				render: render
			});

			expect(render.calls.count()).toEqual(1);

			$('#username').val('zxcv').trigger('keyup');
			expect(render.calls.count()).toEqual(1);

			$('#pwd').val('abcd').trigger('keyup');
			expect(render.calls.count()).toEqual(2);

			$('#confirm').val('abcd').trigger('keyup');
			expect(render.calls.count()).toEqual(2);
		});

		describe('initial state', function() {

			it('calculates initial entropy for empty input', function() {
				var render = jasmine.createSpy(),
					data;

				$('#meter').entropizer({
					target: '#pwd',
					render: render
				});

				data = render.calls.mostRecent().args[0];
				expect(data.entropy).toEqual(0);
			});

			it('calculates initial entropy for non-empty input', function() {
				var render = jasmine.createSpy(),
					data;

				$('#pwd').val('abc');

				$('#meter').entropizer({
					target: '#pwd',
					render: render
				});

				data = render.calls.mostRecent().args[0];
				expect(data.entropy).toBeCloseTo(14.101, 3);
			});

		});

		describe('event subscription', function() {

			it('subscribes to keyup by default', function() {
				var render = jasmine.createSpy(),
					data;

				$('#meter').entropizer({
					target: '#pwd',
					render: render
				});

				$('#pwd').val('asdf').trigger('keyup');

				data = render.calls.mostRecent().args[0];
				expect(data.entropy).toBeCloseTo(18.802, 3);
			});

			it('subscribes to keydown by default', function() {
				var render = jasmine.createSpy(),
					data;

				$('#meter').entropizer({
					target: '#pwd',
					render: render
				});

				$('#pwd').val('asdf').trigger('keydown');

				data = render.calls.mostRecent().args[0];
				expect(data.entropy).toBeCloseTo(18.802, 3);
			});

			it('can configure event to subscribe to', function() {
				var render = jasmine.createSpy(),
					calls;

				$('#meter').entropizer({
					target: '#pwd',
					render: render,
					on: 'test'
				});

				$('#pwd').val('asdf');
				calls = render.calls.count();
				$('#pwd').trigger('test');

				expect(render.calls.count()).toEqual(calls + 1);
			});

		});

		describe('mapping', function() {

			var testCases = [
				{ password: 'asdf', expected: { strength: 'poor', color: '#d00' } },				// < 45 bits
				{ password: 'Asdf123!', expected: { strength: 'ok', color: '#f80' } },				// 45-60 bits
				{ password: 'Asdf123_~!', expected: { strength: 'good', color: '#8c0' } },			// 60-75 bits
				{ password: 'Asdf123!"£$%^', expected: { strength: 'excellent', color: '#0c5' } }	// > 75 bits
			];

			for (var i = 0; i < testCases.length; i++) {
				runTest(testCases[i].password, testCases[i].expected);
			}

			function runTest(password, expected) {
				it('maps entropy using default buckets (' + expected.strength + ', ' + expected.color + ')', function() {
					var render = jasmine.createSpy(),
						data;

					$('#meter').entropizer({
						target: '#pwd',
						render: render
					});

					$('#pwd').val(password).trigger('keyup');

					data = render.calls.mostRecent().args[0];
					expect(data.strength).toEqual(expected.strength);
					expect(data.color).toEqual(expected.color);
				});
			}

			it('maps to percent using default maximum of 100', function() {
				var render = jasmine.createSpy(),
					data;

				$('#meter').entropizer({
					target: '#pwd',
					render: render
				});

				$('#pwd').val('abcd').trigger('keyup');

				data = render.calls.mostRecent().args[0];
				expect(data.percent).toBeCloseTo(18.802, 3);
			});

			it('maps to percent using specified maximum', function() {
				var render = jasmine.createSpy(),
					data;

				$('#meter').entropizer({
					target: '#pwd',
					render: render,
					maximum: 80
				});

				$('#pwd').val('abcd').trigger('keyup');

				data = render.calls.mostRecent().args[0];
				expect(data.percent).toBeCloseTo(23.502, 3);
			});

			it('can configure custom map', function() {
				var render = jasmine.createSpy(),
					data;

				$('#meter').entropizer({
					target: '#pwd',
					render: render,
					map: function(entropy) {
						return {
							asdf: entropy.toFixed(0) + ' bits'
						};
					}
				});

				$('#pwd').val('asdf').trigger('keyup');

				data = render.calls.mostRecent().args[0];
				expect(data).toEqual({
					asdf: '19 bits'
				});
			});

		});

		describe('ui', function() {

			afterEach(function() {
				$('#whizzer').remove();
			});

			it('can configure ui creation and access during rendering', function() {
				function create(container) {
					return {
						whizzer: $('<div>').attr('id', 'whizzer').appendTo(container)
					};
				}

				function render(data, ui) {
					ui.whizzer.html('whizz! ' + data.entropy + ' bits');
				}

				$('#meter').entropizer({
					create: create,
					render: render
				});

				expect($('#whizzer').html()).toEqual('whizz! 0 bits');
			});

		});

		describe('engine', function() {

			it('can configure entropizer engine', function() {
				var render = jasmine.createSpy(),
					data;

				$('#meter').entropizer({
					target: '#pwd',
					render: render,
					engine: {
						classes: ['lowercase', 'numeric']
					}
				});

				$('#pwd').val('ASDF').trigger('keyup');

				data = render.calls.mostRecent().args[0];
				expect(data.entropy).toEqual(0);
			});

		});

	});
});
