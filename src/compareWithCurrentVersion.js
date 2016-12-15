function compareWithCurrentVersion(ccs, versionInfo) {
	if (versionInfo.release === ccs.version)
		throw { code: 1, message: 'No new updates found' };
	return versionInfo;
}

module.exports = compareWithCurrentVersion;