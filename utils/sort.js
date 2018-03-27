function descending(array = [], property) {
	if (property) {
		return array.slice().sort((a, b) => {
			const bVal = (typeof b[property] !== 'undefined') ? b[property] : Math.max();
			const aVal = (typeof a[property] !== 'undefined') ? a[property] : Math.max();
			return bVal - aVal;
		});
	}
	return array.slice().sort((a, b) => b - a);
}

module.exports = { descending };
