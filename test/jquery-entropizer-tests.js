/* global jasmine, describe, it, expect, beforeEach, afterEach */

define(['jquery', 'jquery-entropizer'], function($) {
	'use strict';

	describe('jQuery entropizer', function() {

		// Create password input and container for meter
		beforeEach(function() {
			$('<input>').attr({ id: 'username', type: 'text' }).appendTo('body');
			$('<input>').attr({ id: 'pwd', type: 'password' }).appendTo('body');
			$('<input>').attr({ id: 'confirm', type: 'password' }).appendTo('body');
			$('<div>').attr({ id: 'meter' }).appendTo('body');
		});

		afterEach(function() {
			$('#username').remove();
			$('#pwd').remove();
			$('#confirm').remove();
			$('#meter').remove();
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

		it('watches an input on keyup by default', function() {
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

		it('watches an input on keydown by default', function() {
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

		it('can configure event to watch', function() {
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

		describe('mapping', function() {

			var testCases = [
				{ password: 'asdf', expected: { strength: 'poor', color: '#d00' } },			// < 45 bits
				{ password: 'Asdf123!', expected: { strength: 'ok', color: '#f90' } },			// 45-60 bits
				{ password: 'Asdf123_~!', expected: { strength: 'good', color: '#8c0' } },		// 60-75 bits
				{ password: 'Asdf123!"£$%^', expected: { strength: 'great', color: '#0c5' } }	// > 75 bits
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

		});
		
	});
});
