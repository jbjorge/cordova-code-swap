'use strict';

var sanitizeFolder = require('filenamify');
var copyFiles = require('./copyFiles');

function copyExistingFiles(ccs, dataDir, filesToCopy, destinationFolderName) {
	if (!ccs.version) throw new Error('cordova-code-swap: No previous versions to copy files from.');

	var versionFolderName = sanitizeFolder(ccs.version);
	var srcFolderPath = dataDir + versionFolderName + '/';

	return copyFiles(srcFolderPath, filesToCopy, dataDir, destinationFolderName);
}

module.exports = copyExistingFiles;