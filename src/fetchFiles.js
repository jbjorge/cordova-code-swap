var copyFiles = require('./copyFiles');
var downloadFiles = require('./downloadFiles');

function fetchFiles(ccs, {filesToCopy, filesToDownload}, versionInfo, options) {
	var contentUrl = versionInfo.content_url;
	var newFolderName = versionInfo.release;
	var newFolderPath = cordova.file.dataDirectory + newFolderName;
	var srcFolderName = ccs.version;
	return copyFiles(srcFolderName, filesToCopy, newFolderPath)
		.catch(() => downloadFiles(contentUrl, filesToCopy, newFolderPath, options))
		.then(() => downloadFiles(contentUrl, filesToDownload, newFolderPath, options));
}

module.exports = fetchFiles;