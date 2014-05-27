/* global requirejs */

var tests = [];
for (var file in window.__karma__.files) {
	if (/tests\.js$/.test(file)) {
		tests.push(file);
	}
}

requirejs.config({
	// Karma serves files from '/base'
	baseUrl: '/base/src/js',

	paths: {
		jquery: '../../lib/jquery',
		entropizer: '../../lib/entropizer',
		'jquery-entropizer': 'jquery-entropizer'
	},

	shim: {},

	// ask Require.js to load these files (all our tests)
	deps: tests,

	// start test run, once Require.js is done
	callback: window.__karma__.start
});