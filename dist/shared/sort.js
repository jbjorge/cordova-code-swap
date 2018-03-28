'use strict';

function descending() {
	var array = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
	var property = arguments[1];

	if (property) {
		return array.slice().sort(function (a, b) {
			var bVal = typeof b[property] !== 'undefined' ? b[property] : Math.max();
			var aVal = typeof a[property] !== 'undefined' ? a[property] : Math.max();
			return bVal - aVal;
		});
	}
	return array.slice().sort(function (a, b) {
		return b - a;
	});
}

module.exports = { descending: descending };