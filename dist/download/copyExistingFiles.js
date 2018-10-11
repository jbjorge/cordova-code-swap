'use strict';

var copyFiles = require('./copyFiles');
var errors = require('../shared/errors');
var Promise = require('bluebird');

function copyExistingFiles(dataDir, versionFolderName, filesToCopy, destinationFolderName) {
	if (!versionFolderName) return Promise.reject(errors.create(errors.NO_PREVIOUS_VERSION));

	var srcFolderPath = dataDir + versionFolderName + '/';
	return copyFiles(srcFolderPath, filesToCopy, dataDir, destinationFolderName);
}

module.exports = copyExistingFiles;