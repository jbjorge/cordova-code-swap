const downloadFiles = require('./downloadFiles');
const copyFolder = require('./copyFolder');
const createFoldersInPath = require('./createFoldersInPath');
const copyFiles = require('./copyFiles');
const urlJoin = require('url-join');
const sanitizeFolder = require('filenamify');

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
	const srcFolderName = ccs.version;
	const destinationFolderName = sanitizeFolder(versionInfo.release);
	const dataDir = cordova.file.dataDirectory;
	const applicationDir = cordova.file.applicationDirectory;

	return createFoldersInPath(destinationFolderName)
		.then(() => copyFiles(dataDir, filesToCopy.map(file => urlJoin(srcFolderName, file)), dataDir, destinationFolderName))
		.catch(() => downloadFiles(contentUrl, filesToCopy, destinationFolderName, options))
		.then(() => downloadFiles(contentUrl, filesToDownload, destinationFolderName, options))
		.then(() => copyFiles(applicationDir, ['www/cordova.js', 'www/cordova_plugins.js'], dataDir, destinationFolderName))
		.then(() => copyFolder(applicationDir, 'www/cordova-js-src/', dataDir, destinationFolderName))
		.then(() => copyFolder(applicationDir, 'www/plugins/', dataDir, destinationFolderName));
}

module.exports = fetchFiles;
