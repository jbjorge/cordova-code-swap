const getFileSystem = require('../shared/getFileSystem');
const getFolder = require('../shared/getFolder');
const getFile = require('./getFile');
const Promise = require('bluebird');
const createFoldersInPath = require('./createFoldersInPath');
const urlJoin = require('url-join');
const errors = require('../shared/errors');

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
					err => reject(errors.create(errors.FILE_COPY, JSON.stringify(err)))
				);
			});
		});
}

module.exports = copyFiles;
