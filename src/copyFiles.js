const getFileSystem = require('./getFileSystem');
const getFolder = require('./getFolder');
const getFile = require('./getFile');
const Promise = require('bluebird');

/**
 * Copies files between locations
 * @param  {String} 		fromRootFolder The folder to be copied from
 * @param  {Array[String]} 	files          Array of paths to files relative to fromRootFolder
 * @param  {String} 		toRootFolder   The root folder of the copy destination
 * @param  {String} 		toFolder       The folder to create and use as destination for files
 * @return {Promise}
 */
function copyFiles(fromRootFolder, files, toRootFolder, toFolder) {
	return Promise.join(
		getFileEntries(fromRootFolder, files),
		getToFolderEntry(toRootFolder, toFolder),
		(fileEntries, toFolderEntry) => {
			const copyPromises = [];
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
			const filePromises = files.map(file => getFile(fs, file, { create: false }));
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
