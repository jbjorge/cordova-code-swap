/**
 * Determines which files can be copied and which must be downloaded
 * by searching the current manifest for matches
 * @param  {Object} currentManifest		File manifest currently in use
 * @param  {Object} newManifest 		File manifest received from the server
 * @return {Object} {filesToCopy[String], filesToDownload[String]}
 */
function getCopyAndDownloadList(currentManifest, newManifest) {
	var filesToCopy = newManifest
		.filter(fileEntry => hashExists(currentManifest, fileEntry))
		.map(fileEntry => fileEntry.file);

	var filesToDownload = newManifest
		.filter(fileEntry => !hashExists(currentManifest, fileEntry))
		.map(fileEntry => fileEntry.file);

	return { filesToCopy, filesToDownload };
}

function hashExists(manifest = [], fileEntry) {
	for (var i = 0; i < manifest.length; i++) {
		if (manifest[i].hash === fileEntry.hash)
			return true;
	}
	return false;
}

module.exports = getCopyAndDownloadList;
