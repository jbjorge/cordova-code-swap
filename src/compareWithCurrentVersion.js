/**
 * Compares the current version with the version received from the server
 * @param  {Object} ccs         The ccs info stored in localstorage
 * @param  {Object} updateInfo  The info received from the server
 * @return {updateInfo}         Returns the updateInfo if it differs from the current version
 */
function compareWithCurrentVersion(ccs, updateInfo) {
	if (updateInfo.release === ccs.version)
		throw new Error('cordova-code-swap: ' + 'No new updates found');
	return updateInfo;
}

module.exports = compareWithCurrentVersion;