"use strict";

/**
 * Determines which files can be copied and which must be downloaded
 * by searching the current manifest for matches
 * @param  {Object} currentManifest		File manifest currently in use
 * @param  {Object} newManifest 		File manifest received from the server
 * @return {Object} {filesToCopy[String], filesToDownload[String]}
 */
function getCopyAndDownloadList(currentManifest, newManifest) {
	var filesToCopy = newManifest.filter(function (fileEntry) {
		return hashExists(currentManifest, fileEntry);
	}).map(function (fileEntry) {
		return fileEntry.file;
	});

	var filesToDownload = newManifest.filter(function (fileEntry) {
		return !hashExists(currentManifest, fileEntry);
	}).map(function (fileEntry) {
		return fileEntry.file;
	});

	return { filesToCopy: filesToCopy, filesToDownload: filesToDownload };
}

function hashExists() {
	var manifest = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
	var fileEntry = arguments[1];

	for (var i = 0; i < manifest.length; i++) {
		if (manifest[i].hash === fileEntry.hash) return true;
	}
	return false;
}

module.exports = getCopyAndDownloadList;