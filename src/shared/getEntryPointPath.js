const sanitizeFolder = require('filenamify');

module.exports = function(entryPoint, release) {
	const dataDirectory = cordova.file.dataDirectory;
	if (!entryPoint || !release) {
		return undefined;
	}
	const downloadFolder = sanitizeFolder(release);
	const downloadFolderIndex = entryPoint.indexOf(downloadFolder);
	const relativePath = entryPoint.slice(downloadFolderIndex, entryPoint.length);
	return dataDirectory + relativePath;
};
