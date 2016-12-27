var getFileSystem = require('./getFileSystem');
var getFolder = require('./getFolder');
var getFile = require('./getFile');
var Promise = require('bluebird');

function copyFiles(fromRootFolder, files, toRootFolder, toFolder) {
	return Promise.join(
		getFileEntries(fromRootFolder, files),
		getToFolderEntry(toRootFolder, toFolder),
		(fileEntries, toFolderEntry) => {
			var copyPromises = [];
			fileEntries.forEach(fileEntry => {
				copyPromises.push(copyFile(fileEntry, toFolderEntry));
			});
			return Promise.all(copyPromises);
		});
}

function getToFolderEntry(toRootFolder, toFolder) {
	return getFileSystem(toRootFolder)
		.then(fs => getFolder(fs, toFolder, { create: true }));
}

function getFileEntries(fromRootFolder, files) {
	return getFileSystem(fromRootFolder)
		.then(fs => {
			var filePromises = files.map(file => getFile(fs, file, { create: false }));
			return Promise.all(filePromises);
		});
}

function copyFile(fileEntry, toFolderEntry) {
	return new Promise((resolve, reject) => {
		fileEntry.copyTo(
			toFolderEntry,
			'',
			() => resolve(),
			err => reject(new Error('cordova-code-swap: ' + JSON.stringify(err)))
		);
	});
}

module.exports = copyFiles;
