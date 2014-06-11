/* global jasmine, describe, it, expect, beforeEach, afterEach */

define(['jquery', 'entropizer', 'jquery-entropizer'], function($, Entropizer) {
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
			var update = jasmine.createSpy();

			$('#meter').entropizer({
				update: update
			});

			expect(update.calls.count()).toEqual(1);

			$('#username').val('zxcv').trigger('keyup');
			expect(update.calls.count()).toEqual(1);

			$('#pwd').val('abcd').trigger('keyup');
			expect(update.calls.count()).toEqual(2);

			$('#confirm').val('abcd').trigger('keyup');
			expect(update.calls.count()).toEqual(2);
		});

		describe('initial state', function() {

			it('calculates initial entropy for empty input', function() {
				var update = jasmine.createSpy(),
					data;

				$('#meter').entropizer({
					target: '#pwd',
					update: update
				});

				data = update.calls.mostRecent().args[0];
				expect(data.entropy).toEqual(0);
			});

			it('calculates initial entropy for non-empty input', function() {
				var update = jasmine.createSpy(),
					data;

				$('#pwd').val('abc');

				$('#meter').entropizer({
					target: '#pwd',
					update: update
				});

				data = update.calls.mostRecent().args[0];
				expect(data.entropy).toBeCloseTo(14.101, 3);
			});

		});

		describe('event subscription', function() {

			it('subscribes to keyup by default', function() {
				var update = jasmine.createSpy(),
					data;

				$('#meter').entropizer({
					target: '#pwd',
					update: update
				});

				$('#pwd').val('asdf').trigger('keyup');

				data = update.calls.mostRecent().args[0];
				expect(data.entropy).toBeCloseTo(18.802, 3);
			});

			it('subscribes to keydown by default', function() {
				var update = jasmine.createSpy(),
					data;

				$('#meter').entropizer({
					target: '#pwd',
					update: update
				});

				$('#pwd').val('asdf').trigger('keydown');

				data = update.calls.mostRecent().args[0];
				expect(data.entropy).toBeCloseTo(18.802, 3);
			});

			it('can configure event to subscribe to', function() {
				var update = jasmine.createSpy(),
					calls;

				$('#meter').entropizer({
					target: '#pwd',
					update: update,
					on: 'test'
				});

				$('#pwd').val('asdf');
				calls = update.calls.count();
				$('#pwd').trigger('test');

				expect(update.calls.count()).toEqual(calls + 1);
			});

		});

		describe('mapping', function() {

			describe('default buckets', function() {

				var testCases = [
					{ password: 'asdf', expected: { strength: 'poor', color: '#e13' } },				// < 45 bits
					{ password: 'Asdf123!', expected: { strength: 'ok', color: '#f80' } },				// 45-60 bits
					{ password: 'Asdf123_~!', expected: { strength: 'good', color: '#8c0' } },			// 60-75 bits
					{ password: 'Asdf123!"£$%^', expected: { strength: 'excellent', color: '#0c8' } }	// > 75 bits
				];

				for (var i = 0; i < testCases.length; i++) {
					runTest(testCases[i].password, testCases[i].expected);
				}

				function runTest(password, expected) {
					it('maps entropy using default buckets (' + expected.strength + ', ' + expected.color + ')', function() {
						var update = jasmine.createSpy(),
							data;

						$('#meter').entropizer({
							target: '#pwd',
							update: update
						});

						$('#pwd').val(password).trigger('keyup');

						data = update.calls.mostRecent().args[0];
						expect(data.strength).toEqual(expected.strength);
						expect(data.color).toEqual(expected.color);
					});
				}
			});
			
			describe('custom buckets', function() {

				var testCases = [
					{ password: 'as', expected: { manPoints: 0, rating: 'rubbish', color: 'hotpink' } },			// 9 bits
					{ password: 'Asd', expected: { manPoints: 2, rating: 'meh', color: 'yellow' } },				// 17 bits
					{ password: 'Asdf!', expected: { manPoints: 10, rating: 'acceptable', color: 'turquoise' } },	// 29 bits
					{ password: 'Asdf!+', expected: { manPoints: 9000, rating: 'awesome', color: 'aquamarine' } }	// 39 bits
				];

				for (var i = 0; i < testCases.length; i++) {
					runTest(testCases[i].password, testCases[i].expected);
				}

				function runTest(password, expected) {
					it('maps entropy using custom buckets (' + expected.rating + ', ' + expected.color + ')', function() {
						var update = jasmine.createSpy(),
							data;

						$('#meter').entropizer({
							target: '#pwd',
							buckets: [
								{ max: 10, manPoints: 0, rating: 'rubbish', color: 'hotpink' },
								{ min: 10, max: 20, manPoints: 2, rating: 'meh', color: 'yellow' },
								{ min: 20, max: 30, manPoints: 10, rating: 'acceptable', color: 'turquoise' },
								{ min: 30, manPoints: 9000, rating: 'awesome', color: 'aquamarine' }
							],
							update: update
						});

						$('#pwd').val(password).trigger('keyup');

						data = update.calls.mostRecent().args[0];
						expect(data.manPoints).toEqual(expected.manPoints);
						expect(data.rating).toEqual(expected.rating);
						expect(data.color).toEqual(expected.color);
					});
				}
			});
			
			it('maps to percent using default maximum of 100', function() {
				var update = jasmine.createSpy(),
					data;

				$('#meter').entropizer({
					target: '#pwd',
					update: update
				});

				$('#pwd').val('abcd').trigger('keyup');

				data = update.calls.mostRecent().args[0];
				expect(data.percent).toBeCloseTo(18.802, 3);
			});

			it('maps to percent using specified maximum', function() {
				var update = jasmine.createSpy(),
					data;

				$('#meter').entropizer({
					target: '#pwd',
					update: update,
					maximum: 80
				});

				$('#pwd').val('abcd').trigger('keyup');

				data = update.calls.mostRecent().args[0];
				expect(data.percent).toBeCloseTo(23.502, 3);
			});

			it('can configure custom map and custom map options', function() {
				var update = jasmine.createSpy(),
					data;

				$('#meter').entropizer({
					target: '#pwd',
					update: update,
					foo: ' bits',
					bar: 'baz',
					map: function(entropy, options) {
						return {
							asdf: entropy.toFixed(0) + options.foo,
							baz: options.bar
						};
					}
				});

				$('#pwd').val('asdf').trigger('keyup');

				data = update.calls.mostRecent().args[0];
				expect(data).toEqual({
					asdf: '19 bits',
					baz: 'baz'
				});
			});

		});

		describe('classification', function() {

			var testBuckets = [
				{ max: 10, foo: { a: 1, b: 2 }, bar: 'A' },
				{ min: 20, max: 30, foo: 'b', bar: 'B' },
				{ min: 30, max: 50, baz: 'c' },
				{ min: 50 }
			];

			it('classifies a value using buckets', function() {

				function runTest(testCase) {
					var value = $.entropizer.classify(testCase.input, testBuckets);
					expect(value).toEqual(testCase.expected);
				}
				
				var testCases = [
					{ input: 5, expected: { foo: { a: 1, b: 2 }, bar: 'A' } },
					{ input: 10, expected: null },
					{ input: 15, expected: null },
					{ input: 20, expected: { foo: 'b', bar: 'B' } },
					{ input: 22, expected: { foo: 'b', bar: 'B' } },
					{ input: 30, expected: { baz: 'c' } },
					{ input: 50, expected: {} },
					{ input: 80, expected: {} }
				];
				
				for (var i = 0; i < testCases.length; i++) {
					runTest(testCases[i]);
				}
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

				function update(data, ui) {
					ui.whizzer.html('whizz! ' + data.entropy + ' bits');
				}

				$('#meter').entropizer({
					create: create,
					update: update
				});

				expect($('#whizzer').html()).toEqual('whizz! 0 bits');
			});

		});

		describe('engine', function() {

			it('can configure entropizer engine using options', function() {
				var update = jasmine.createSpy(),
					data;

				$('#meter').entropizer({
					target: '#pwd',
					update: update,
					engine: {
						classes: ['lowercase', 'numeric']
					}
				});

				$('#pwd').val('ASDF').trigger('keyup');

				data = update.calls.mostRecent().args[0];
				expect(data.entropy).toEqual(0);
			});

			it('can configure entropizer engine using an Entropizer instance', function() {
				var update = jasmine.createSpy(),
					data;

				$('#meter').entropizer({
					target: '#pwd',
					update: update,
					engine: new Entropizer({
						classes: ['uppercase', 'numeric']
					})
				});

				$('#pwd').val('Foo1').trigger('keyup');

				data = update.calls.mostRecent().args[0];
				expect(data.entropy).toBeCloseTo(20.680, 3);
			});

		});

	});
});
