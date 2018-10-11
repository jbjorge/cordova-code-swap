const copyFiles = require('./copyFiles');
const errors = require('../shared/errors');
const Promise = require('bluebird');

function copyExistingFiles(dataDir, versionFolderName, filesToCopy, destinationFolderName) {
	if (!versionFolderName)
		return Promise.reject(errors.create(errors.NO_PREVIOUS_VERSION));

	const srcFolderPath = dataDir + versionFolderName + '/';
	return copyFiles(srcFolderPath, filesToCopy, dataDir, destinationFolderName);
}

module.exports = copyExistingFiles;
