const Promise = require('bluebird');

/**
 * Compares the current version with the version received from the server
 * @param  {Object} ccs         The ccs info stored in localstorage
 * @param  {Object} updateInfo  The info received from the server
 * @return {Promise}         	Returns promise that resolves updateInfo if it differs from the current version
 */
function compareWithCurrentVersion(ccs, updateInfo) {
	return Promise.resolve()
		.then(() => throwIfCurrentVersionIsNewest(ccs, updateInfo))
		.then(() => throwIfPendingInstallVersionIsSame(ccs, updateInfo))
		.then(() => updateInfo);
}

function throwIfCurrentVersionIsNewest(ccs, updateInfo) {
	if (updateInfo.release === ccs.version) {
		throw new Error('cordova-code-swap: Current installed version is the same as the version on the update server.');
	}
}

function throwIfPendingInstallVersionIsSame(ccs, updateInfo) {
	if (ccs.pendingInstallation && ccs.pendingInstallation.updateInfo && ccs.pendingInstallation.updateInfo.release === updateInfo.release) {
		throw new Error('cordova-code-swap: Newest version is already downloaded, but not installed. Use .install() to install it.');
	}
}

module.exports = compareWithCurrentVersion;
