/* jshint strict: false */

// Because Phantom sucks
Function.prototype.bind = Function.prototype.bind || function(thisp) {
	var fn = this;
	return function() {
		return fn.apply(thisp, arguments);
	};
};