const getFileSystem = require('../shared/getFileSystem');
const getFolder = require('../shared/getFolder');
const Promise = require('bluebird');
const errors = require('../shared/errors');

/**
 * Copy folder to folder
 * @param  {String} fromRoot       Root from-folder to resolve
 * @param  {String} fromFolderPath Path to source folder relative to fromRoot
 * @param  {String} toRoot         Root to-folder to resolve
 * @param  {String} toFolderPath   Path to destination folder relative to toRoot
 * @return {Promise}
 */
function copyFolder(fromRoot, fromFolderPath, toRoot, toFolderPath) {
	return Promise.join(
		getFolderEntry(fromRoot, fromFolderPath),
		getFolderEntry(toRoot, toFolderPath, { create: true }),
		copy
	);
}

function getFolderEntry(rootFolder, subFolder, options = { create: false }) {
	return getFileSystem(rootFolder)
		.then(fs => getFolder(fs, subFolder, options));
}

function copy(fromFolder, toFolder) {
	return new Promise((resolve, reject) => {
		fromFolder.copyTo(
			toFolder,
			'',
			resolve,
			err => {
				if (err.code == 9) {
					resolve();
				} else {
					reject(errors.create(errors.FOLDER_COPY, JSON.stringify(err)));
				}
			}
		);
	});
}

module.exports = copyFolder;
