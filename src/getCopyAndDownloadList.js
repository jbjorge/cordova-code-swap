function getCopyAndDownloadList(ccs, manifest) {
	var filesToCopy = manifest.filter(fileEntry => hashExists(ccs, fileEntry));
	var filesToDownload = manifest.filter(fileEntry => !hashExists(ccs, fileEntry));
	return { filesToCopy, filesToDownload };
}

function hashExists(ccs, fileEntry) {
	for (var i = 0; i < ccs.manifest.length; i++) {
		if (ccs.manifest[i].hash === fileEntry.hash)
			return true;
	}
	return false;
}

module.exports = getCopyAndDownloadList;