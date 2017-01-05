const sanitizeFolder = require('filenamify');
const copyFiles = require('./copyFiles');

function copyExistingFiles(ccs, dataDir, filesToCopy, destinationFolderName) {
	if (!ccs.version)
		throw new Error('cordova-code-swap: No previous versions to copy files from.');

	const versionFolderName = sanitizeFolder(ccs.version);
	const srcFolderPath = dataDir + versionFolderName + '/';

	return copyFiles(srcFolderPath, filesToCopy, dataDir, destinationFolderName);
}

module.exports = copyExistingFiles;
