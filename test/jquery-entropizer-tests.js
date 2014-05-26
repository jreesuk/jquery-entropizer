/* global describe, it, expect, beforeEach, afterEach */

define(['jquery', 'jquery-entropizer'], function($) {
	'use strict';

	describe('jQuery entropizer', function() {

		// Create password input and container for meter
		beforeEach(function() {
			$('<input>').attr({ id: 'pwd', type: 'password' }).appendTo('body');
			$('<div>').attr({ id: 'meter' }).appendTo('body');
		});

		afterEach(function() {
			$('#pwd').remove();
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

		it('displays an initial state for empty input using target selector', function() {
			$('#meter').entropizer({
				target: '#pwd'
			});
			expect($('#meter')[0].innerHTML).toEqual('0');
		});

		it('displays an initial state for non-empty input using target selector', function() {
			$('#pwd').val('abc');
			$('#meter').entropizer({
				target: '#pwd'
			});
			expect($('#meter')[0].innerHTML).toEqual('14');
		});

		it('watches an input using target selector', function() {
			$('#meter').entropizer({
				target: '#pwd'
			});
			
			// Need to give it a nudge
			$('#pwd').val('asdf').trigger('keyup');
			expect($('#meter')[0].innerHTML).toEqual('19');
		});

	});
});
