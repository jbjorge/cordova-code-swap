const assert = require('assert');
const mock = require('mock-require');
mock('./lookForUpdates', () => {
	return 'looking for updates';
});
mock('./initialize', () => {
	return 'initializing';
});
const sut = require('./index');

context('public functions', () => {
	it('should expose lookForUpdates', () => {
		const expected = 'looking for updates';
		const actual = sut.lookForUpdates();
		assert.equal(actual, expected);
	});

	it('should expose initialize', () => {
		const expected = 'initializing';
		const actual = sut.initialize();
		assert.equal(actual, expected);
	});

	it('should expose install', () => {
		assert(typeof sut.install == 'function');
	})
});

context('install', () => {
	it('should throw an error if initialize has not been run first', () => {
		mock('./shared/state', {
			get: prop => {
				if (prop == 'ccs') {
					return {};
				} else {
					return false;
				}
			}
		});
		const expectedErrorMessage = 'cordova-code-swap: .initialize() needs to be run before installing. It should be the first thing to be run in the application.';
		return sut.install()
			.catch(err => {
				assert(err instanceof Error);
				assert.equal(err.message, expectedErrorMessage);
			});
	});

	it('should install if an install is already downloaded and pending', () => {
		const pendingInstallation = {
			updateInfo: {},
			options: {}
		};
		mock('./shared/state', {
			get: prop => {
				if (prop == 'ccs') {
					return {
						pendingInstallation
					};
				} else {
					return true;
				}
			}
		});
		mock('./install', function(updateInfo, options) {
			assert.equal(updateInfo, pendingInstallation.updateInfo);
			assert.equal(options, pendingInstallation.options);
		})
		return sut.install();
	});

	it('should throw an error if trying to install with no updates downloaded/pending', () => {
		mock('./shared/state', {
			get: prop => {
				if (prop == 'ccs') {
					return {};
				} else {
					return true;
				}
			}
		});
		return sut.install()
			.then(() => {
				throw new Error('Test failed.');
			})
			.catch(err => {
				assert(err instanceof Error);
				assert.equal(err.message, 'cordova-code-swap: Tried to install update, but no updates have been previously downloaded.');
			});
	});
});
