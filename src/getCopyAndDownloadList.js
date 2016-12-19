function getCopyAndDownloadList(ccs, manifest) {
	var filesToCopy = manifest.filter(fileEntry => hashExists(ccs, fileEntry)).map(fileEntry => fileEntry.file);
	var filesToDownload = manifest.filter(fileEntry => !hashExists(ccs, fileEntry)).map(fileEntry => fileEntry.file);
	return { filesToCopy, filesToDownload };
}

function hashExists(ccs, fileEntry) {
	if (!ccs || !ccs.manifest || !ccs.manifest.length) {
		return false;
	}

	for (var i = 0; i < ccs.manifest.length; i++) {
		if (ccs.manifest[i].hash === fileEntry.hash)
			return true;
	}
	return false;
}

module.exports = getCopyAndDownloadList;