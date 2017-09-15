const Promise = require('bluebird');
const getFileSystem = require('../shared/getFileSystem');
const getFolder = require('../shared/getFolder');

/**
 * Loops over all folders in a path and creates them
 * @param  {string} path    the path to be created
 * @param  {Object} options optional - set .endsInFile to true if path ends in filename
 * @return {Promise}		resolves with the final cordova folder
 */
function createFoldersInPath(path, options = {}) {
	const folders = path.split('/');
	return getFileSystem(cordova.file.dataDirectory)
		.then(fs => {
			let dirCreationPromises = Promise.resolve();
			for (let i = 0; i < folders.length; i++) {
				if (i == folders.length-1 && options.endsInFile) {
					continue;
				}
				const currentPath = folders.slice(0, i + 1).join('/');
				dirCreationPromises = dirCreationPromises
					// tries to create the folder
					.then(() => getFolder(fs, currentPath, { create: true }))
					// tries to get the folder instead if creating failed because it already exists
					.catch(() => getFolder(fs, currentPath, { create: false }));
			}
			return dirCreationPromises;
		});
}

module.exports = createFoldersInPath;
