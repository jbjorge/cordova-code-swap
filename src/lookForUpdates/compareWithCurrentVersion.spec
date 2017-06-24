const sut = require('./compareWithCurrentVersion');
const assert = require('assert');

it('should throw if current version is newest', () => {
	const timestamp = Date.now();
	const ccs = { release: timestamp };
	const updateInfo = { release: timestamp };
	const expectedError = 'cordova-code-swap: Current installed version is the same as the version on the update server.';
	return sut(ccs, updateInfo)
		.then(() => {
			throw new Error('Test failed');
		})
		.catch(err => {
			assert(err instanceof Error);
			assert.equal(err.message, expectedError);
		});
});

it('should thow if the version on the server is already downloaded', () => {
	const ccs = {
		release: 1,
		pendingInstallation: {
			updateInfo: {
				release: 2
			}
		}
	};
	const updateInfo = { release: 2 };
	const expectedError = 'cordova-code-swap: Newest version is already downloaded, but not installed. Use .install() to install it.';
	return sut(ccs, updateInfo)
		.then(() => {
			throw new Error('Test failed');
		})
		.catch(err => {
			assert(err instanceof Error);
			assert.equal(err.message, expectedError);
		});
});

it('should return the updateInfo if version on server is different from currently installed version', () => {
	const ccs = { release: 1 };
	const updateInfo = { release: 2 };
	return sut(ccs, updateInfo)
		.then(actual => {
			assert.deepEqual(actual, updateInfo);
		});
});
