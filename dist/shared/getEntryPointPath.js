'use strict';

var sanitizeFolder = require('filenamify');

module.exports = function (entryPoint, release) {
	var dataDirectory = cordova.file.dataDirectory;
	if (!entryPoint || !release) {
		return undefined;
	}
	var downloadFolder = sanitizeFolder(release);
	var downloadFolderIndex = entryPoint.indexOf(downloadFolder);
	var relativePath = entryPoint.slice(downloadFolderIndex, entryPoint.length);
	return dataDirectory + relativePath;
};