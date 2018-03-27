const sut = require('./sort');
const assert = require('assert');

context('descending', () => {
	it('should sort descending', () => {
		const unsorted = [2, 1, 5, 653, 23.911, -433, 1];
		const expected = [653, 23.911, 5, 2, 1, 1, -433];
		const actual = sut.descending(unsorted);
		assert.deepEqual(actual, expected);
	});

	context('with objects and props', () => {
		it('should sort descending', () => {
			const unsorted = [
				{ timestamp: 1234 },
				{ timestamp: 2345 },
				{ timestamp: 3456 },
				{ timestamp: 2341 }
			];
			const expected = [
				{ timestamp: 3456 },
				{ timestamp: 2345 },
				{ timestamp: 2341 },
				{ timestamp: 1234 }
			];
			const actual = sut.descending(unsorted, 'timestamp');
			assert.deepEqual(actual, expected);
		});

		it('should sort descending, undefined values coming last', () => {
			const unsorted = [
				{ timestamp: 1234 },
				{ assertIdentifier: 'assertIdentifier' },
				{ timestamp: 3456 },
				{ timestamp: 2341 }
			];
			const expected = [
				{ timestamp: 3456 },
				{ timestamp: 2341 },
				{ timestamp: 1234 },
				{ assertIdentifier: 'assertIdentifier' }
			];
			const actual = sut.descending(unsorted, 'timestamp');
			assert.deepEqual(actual, expected);
		});
	});
});
