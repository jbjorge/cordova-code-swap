const proxyquire = require('proxyquire');
const sut = proxyquire('../src/shared/state', {
	'./getConfig': () => {}
});
const assert = require('assert');
const testState1 = true;
const testState2 = { test: 'data' };

describe('state', function() {
	it('should be able to set state', () => {
		sut.set('initialized', testState1);
		sut.set('ccs', testState2);
	});

	it('should throw an error when setting an undeclared state', () => {
		const crashingFunc = () => sut.set('lolface', testState1);
		assert.throws(crashingFunc, Error);
	});

	it('should be able to get state', () => {
		const actual = sut.get('initialized');
		const actual2 = sut.get('ccs');
		assert.equal(actual, testState1);
		assert.equal(actual2, testState2);
	});
});
