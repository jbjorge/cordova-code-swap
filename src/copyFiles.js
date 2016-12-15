var getFileSystem = require('./getFileSystem');
var Promise = require('bluebird');

function copyFiles(srcFolder, filesToCopy, destinationFolder) {
	var fsPromise = getFileSystem(cordova.file.dataDirectory);
	var copyPromises = [];
	filesToCopy.forEach(fileToCopy => {
		copyPromises.push(copyFile(fsPromise, srcFolder, fileToCopy, destinationFolder));
	});
	return Promise.all(copyPromises);
}

function copyFile(fsPromise, srcFolder, fileToCopy, destinationFolder) {
	var filePromise = fsPromise.then(fs => getFile(fs, srcFolder, fileToCopy));
	var folderPromise = fsPromise.then(fs => getFolder(fs, destinationFolder));

	return Promise.join(filePromise, folderPromise,
		function(fileEntry, folderEntry){
			fileEntry.copyTo(folderEntry);
		});
}

function getFile(fs, srcFolder, fileToCopy) {
	return new Promise((resolve, reject) => {
		fs.getFile(srcFolder + fileToCopy, { create: false }, resolve, reject);
	});
}

function getFolder(fs, directoryPath) {
	return new Promise((resolve, reject) => {
		fs.getDirectory(directoryPath, { create: false }, resolve, reject);
	});
}

module.exports = copyFiles;