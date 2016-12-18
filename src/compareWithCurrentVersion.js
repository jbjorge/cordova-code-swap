function compareWithCurrentVersion(ccs, versionInfo) {
	if (versionInfo.release === ccs.version)
		throw new Error('cordova-code-swap: ' + 'No new updates found');
	return versionInfo;
}

module.exports = compareWithCurrentVersion;