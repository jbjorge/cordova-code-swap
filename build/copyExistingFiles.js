'use strict';

var copyFiles = require('./copyFiles');
var Promise = require('bluebird');

function copyExistingFiles(dataDir, versionFolderName, filesToCopy, destinationFolderName) {
	if (!versionFolderName) return Promise.reject(new Error('cordova-code-swap: No previous versions to copy files from.'));

	var srcFolderPath = dataDir + versionFolderName + '/';
	return copyFiles(srcFolderPath, filesToCopy, dataDir, destinationFolderName);
}

module.exports = copyExistingFiles;