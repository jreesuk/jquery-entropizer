/* global describe, it, expect */

define(['jquery', 'jquery-entropizer'], function($) {
	'use strict';

	describe('jQuery entropizer', function() {

		it('exists', function() {
			expect($.fn.entropizer).toBeDefined();
		});

		it('is a function', function() {
			expect(typeof $.fn.entropizer).toEqual('function');
		});

		it('returns a jQuery object', function() {
			expect($().entropizer().constructor).toBe($);
		});

	});
});
