const Promise = require('bluebird');
const getFileSystem = require('./getFileSystem');

/**
 * Loops over all folders in a path and creates them
 * @param  {string} path    the path to be created
 * @param  {Object} options optional - set .endsInFile to true if path ends in filename
 * @return {Promise}
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
				const currentPath = folders.slice(0, i + 1);
				dirCreationPromises = dirCreationPromises.then(() => createDirectory(fs, currentPath));
			}
			return dirCreationPromises;
		});
}

/**
 * Creates a folder
 * @param  {Object} fs      An instance of the cordova file system
 * @param  {Array}  folders Array of folder names
 * @return {Promise}
 */
function createDirectory(fs, folders) {
	return new Promise((resolve, reject) => {
		fs.getDirectory(folders.join('/'),
			{ create: true },
			() => resolve(),
			err => {
				if (err.code != 12) {
					reject(new Error('cordova-code-swap: ' + JSON.stringify(err)));
				} else {
					resolve();
				}
			}
		);
	});
}

module.exports = createFoldersInPath;
