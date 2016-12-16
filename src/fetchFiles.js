var downloadFiles = require('./downloadFiles');
var copyFolder = require('./copyFolder');
var createFoldersInPath = require('./createFoldersInPath');
var copyFiles = require('./copyFilesRev');

function fetchFiles(ccs, { filesToCopy, filesToDownload }, versionInfo, options) {
	var contentUrl = versionInfo.content_url;
	var srcFolderName = ccs.version;
	var destinationFolderName = versionInfo.release;
	var dataDir = cordova.file.dataDirectory;
	var applicationDir = cordova.file.applicationDirectory;

	return createFoldersInPath(destinationFolderName)
		.then(() => copyFiles(dataDir, filesToCopy.map(file => srcFolderName + '/' + file), dataDir, destinationFolderName))
		.catch(() => downloadFiles(contentUrl, filesToCopy, destinationFolderName, options))
		.then(() => downloadFiles(contentUrl, filesToDownload, destinationFolderName, options))
		// .then(() => downloadFiles(applicationDir + 'www/', ['cordova.js', 'cordova_plugins.js'], destinationFolderName, options))
		.then(() => copyFiles(applicationDir, ['www/cordova.js', 'www/cordova_plugins.js'], dataDir, destinationFolderName))
		.then(() => copyFolder(applicationDir, 'www/cordova-js-src/', dataDir, destinationFolderName))
		.then(() => copyFolder(applicationDir, 'www/plugins/', dataDir, destinationFolderName));
}

module.exports = fetchFiles;
