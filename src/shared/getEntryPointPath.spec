const sut = require('./getEntryPointPath');
const assert = require('assert');

before(() => {
	global.cordova = {
		file: {
			dataDirectory: 'file://path1/'
		}
	};
});

after(() => {
	delete global.cordova;
});

it('should return nothing if entrypoint is undefined', () => {
	const expected = undefined;
	const actual = sut();

	assert.equal(actual, expected);
});

it('should return nothing if release is undefined', () => {
	const expected = undefined;
	const actual = sut('entryPoint');

	assert.equal(actual, expected);
});

it('should return path to entryPoint with current cordova.file.dataDirectory prepended', () => {
	const absolutePath = 'file://path2/ccsFilesDirectory/index.html';
	const release = 'ccsFilesDirectory';
	const expected = cordova.file.dataDirectory + 'ccsFilesDirectory/index.html';
	const actual = sut(absolutePath, release);

	assert.equal(actual, expected);

	const relativePath = 'ccsFilesDirectory2/index.html';
	const release2 = 'ccsFilesDirectory2';
	const expected2 = cordova.file.dataDirectory + 'ccsFilesDirectory2/index.html';
	const actual2 = sut(relativePath, release2);

	assert.equal(actual2, expected2);
});
