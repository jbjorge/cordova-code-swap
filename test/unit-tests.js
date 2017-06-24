const findTests = require('./find-tests');
const path = require('path');

describe('Unit tests', () => {
	context('src/', () => {
		findTests({ rootPath: path.resolve(__dirname, '../src') });
	})
});
