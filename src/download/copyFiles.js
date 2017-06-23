const getFileSystem = require('./getFileSystem');
const getFolder = require('./getFolder');
const getFile = require('./getFile');
const Promise = require('bluebird');
const createFoldersInPath = require('./createFoldersInPath');
const urlJoin = require('url-join');

/**
 * Copies files between locations
 * @param  {String} 		fromRootFolder The folder to be copied from
 * @param  {Array[String]} 	files          Array of paths to files relative to fromRootFolder
 * @param  {String} 		toRootFolder   The root folder of the copy destination
 * @param  {String} 		toFolder       The folder to create and use as destination for files
 * @return {Promise}
 */
function copyFiles(fromRootFolder, files, toRootFolder, toFolder) {
	// return Promise.join(
	// 	getFileEntries(fromRootFolder, files),
	// 	getFolderEntry(toRootFolder, toFolder),
	// 	(fileEntries, toFolderEntry) => {
	// 		const copyPromises = [];
	// 		fileEntries.forEach(fileEntry => {
	// 			copyPromises.push(copyFile(fileEntry, toFolderEntry));
	// 		});
	// 		return Promise.all(copyPromises);
	// 	});
	return Promise.join(
		getFileSystem(fromRootFolder),
		getFolderEntry(toRootFolder, toFolder),
		(fromFolderEntry, toFolderEntry) => {
			const copyPromises = [];
			files.forEach(file => {
				copyPromises.push(copyFile(fromFolderEntry, file, toFolderEntry));
			});
			return Promise.all(copyPromises);
		});
}

function getFolderEntry(rootFolder, subFolder) {
	return getFileSystem(rootFolder)
		.then(fs => getFolder(fs, subFolder, { create: true }));
}

// function getFileEntries(fromRootFolder, files) {
// 	return getFileSystem(fromRootFolder)
// 		.then(fs => {
// 			const filePromises = files.map(file => getFile(fs, file, { create: false }));
// 			return Promise.all(filePromises);
// 		});
// }

function copyFile(fromFolderEntry, file, toFolderEntry) {
	const fullPath = urlJoin(toFolderEntry.fullPath, file);
	return Promise.join(
		getFile(fromFolderEntry, file, { create: false }),
		createFoldersInPath(fullPath, { endsInFile: true }),
		(fileEntry, destinationEntry) => {
			return new Promise((resolve, reject) => {
				fileEntry.copyTo(
					destinationEntry,
					'',
					() => resolve(),
					err => reject(new Error('cordova-code-swap: ' + JSON.stringify(err)))
				);
			});
		});
}

// function copyFile(fileEntry, toFolderEntry) {
// 	const fullPath = urlJoin(toFolderEntry.fullPath, fileEntry.fullPath);
// 	return createFoldersInPath(fullPath, { endsInFile: true })
// 		.then(destinationEntry => {
// 			return new Promise((resolve, reject) => {
// 				fileEntry.copyTo(
// 					destinationEntry,
// 					'',
// 					() => resolve(),
// 					err => reject(new Error('cordova-code-swap: ' + JSON.stringify(err)))
// 				);
// 			});
// 		});
// }

module.exports = copyFiles;
