const findTests = require('./find-tests');
const path = require('path');

describe('Unit tests', () => {
	context('src/', () => {
		findTests({ rootPath: path.resolve(__dirname, '../src') });
	});
	context('utils/', () => {
		findTests({ rootPath: path.resolve(__dirname, '../utils') });
	});
});
