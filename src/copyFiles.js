var getFileSystem = require('./getFileSystem');
var Promise = require('bluebird');

function copyFiles(fsPath, srcFolder, filesToCopy, destinationFolder) {
	if (typeof srcFolder == 'undefined') {
		return Promise.reject(new Error('No source folder to copy existing files from.'));
	}
	if (!fsPath) {
		return Promise.reject(new Error('No file system path to mount the filesystem on.'));
	}

	var fsPromise = getFileSystem(fsPath);
	var copyPromises = [];
	filesToCopy.forEach(fileToCopy => {
		copyPromises.push(copyFile(fsPromise, srcFolder, fileToCopy, destinationFolder));
	});

	return Promise.all(copyPromises);
}

function copyFile(fsPromise, srcFolder, fileToCopy, destinationFolder) {
	var filePromise = fsPromise.then(fs => getFile(fs, srcFolder, fileToCopy));
	var folderPromise = fsPromise.then(fs => getFolder(fs, destinationFolder));

	return new Promise((resolve, reject) => {
		Promise.join(filePromise, folderPromise,
			function(fileEntry, folderEntry) {
				fileEntry.copyTo(
					folderEntry,
					() => {
						console.log('got called');
						resolve();
					},
					err => {
						console.log('got called but err', err);
						reject(new Error(JSON.stringify(err)));
					});
			})
		.catch(err => {
			console.log('eeeeerr', err);
			reject(new Error(JSON.stringify(err)));
		});
	});
}

function getFile(fs, srcFolder, fileToCopy) {
	return new Promise((resolve, reject) => {
		fs.getFile(
			srcFolder + '/' + fileToCopy, { create: false },
			() => resolve(),
			err => reject(new Error(JSON.stringify(err)))
		);
	});
}

function getFolder(fs, directoryPath) {
	return new Promise((resolve, reject) => {
		fs.getDirectory(
			directoryPath, { create: false },
			() => resolve(),
			err => reject(new Error(JSON.stringify(err)))
		);
	});
}

module.exports = copyFiles;
