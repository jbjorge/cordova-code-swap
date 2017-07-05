const downloadFiles = require('./downloadFiles');
const createFoldersInPath = require('./createFoldersInPath');
const sanitizeFolder = require('filenamify');
const copyExistingFiles = require('./copyExistingFiles');
const copyCordovaFiles = require('./copyCordovaFiles');

/**
 * Fetches the update files. Tries to copy from current version first if hashes match, reverts to downloading if that fails.
 * @param  {Object} ccs                     The ccs info stored in localstorage
 * @param  {Array[String]} filesToCopy 		Files to be copied
 * @param  {Array[String]} filesToDownload 	Files to be downloaded
 * @param  {Object} versionInfo             The info received from the server
 * @param  {Object} options                 See calling function
 * @return {Promise}
 */
function fetchFiles(ccs, { filesToCopy, filesToDownload }, versionInfo, options, instanceOptions) {
	const contentUrl = versionInfo.content_url;
	const dataDir = cordova.file.dataDirectory;
	const destinationFolderName = instanceOptions.debug.preserveBreakpoints ? 'ccsDebug' : sanitizeFolder(versionInfo.release || '');
	const versionFolderName = sanitizeFolder(ccs.release || '');

	return createFoldersInPath(destinationFolderName)
		.then(() => {
			// abort copying/downloading existing files if in debug mode and trying to copy from 'ccsDebug' to 'ccsDebug'
			if (versionFolderName == destinationFolderName) {
				return;
			}
			return copyExistingFiles(dataDir, versionFolderName, filesToCopy, destinationFolderName)
				.catch(() => downloadFiles(contentUrl, filesToCopy, destinationFolderName, options))
				.then(() => copyCordovaFiles(dataDir, destinationFolderName));
		})
		.then(() => downloadFiles(contentUrl, filesToDownload, destinationFolderName, options));
}

module.exports = fetchFiles;
