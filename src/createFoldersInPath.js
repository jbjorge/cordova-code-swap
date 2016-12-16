var Promise = require('bluebird');
var getFileSystem = require('./getFileSystem');

function createFoldersInPath(path, options = {}) {
	var folders = path.split('/');
	return getFileSystem(cordova.file.dataDirectory)
		.then(fs => {
			var dirCreationPromises = Promise.resolve();
			for (var i = 0; i < folders.length; i++) {
				if (i == folders.length-1 && options.endsInFile) {
					continue;
				}
				var currentPath = folders.slice(0, i + 1);
				dirCreationPromises = dirCreationPromises.then(() => createDirectory(fs, currentPath));
			}
			return dirCreationPromises;
		});
}

function createDirectory(fs, folders) {
	return new Promise((resolve, reject) => {
		fs.getDirectory(folders.join('/'),
			{ create: true },
			() => resolve(),
			err => {
				if (err.code != 12) {
					reject(new Error(JSON.stringify(err)));
				} else {
					resolve();
				}
			}
		);
	});
}

module.exports = createFoldersInPath;
