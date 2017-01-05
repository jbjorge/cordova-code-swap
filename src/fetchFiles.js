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
function fetchFiles(ccs, { filesToCopy, filesToDownload }, versionInfo, options) {
	const contentUrl = versionInfo.content_url;
	const destinationFolderName = sanitizeFolder(versionInfo.release);
	const dataDir = cordova.file.dataDirectory;

	return createFoldersInPath(destinationFolderName)
		.then(() => copyExistingFiles(ccs, dataDir, filesToCopy, destinationFolderName))
		.catch(() => downloadFiles(contentUrl, filesToCopy, destinationFolderName, options))
		.then(() => downloadFiles(contentUrl, filesToDownload, destinationFolderName, options))
		.then(() => copyCordovaFiles(dataDir, destinationFolderName));
}

module.exports = fetchFiles;
