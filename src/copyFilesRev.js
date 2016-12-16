var getFileSystem = require('./getFileSystem');
var getFolder = require('./getFolder');
var getFile = require('./getFile');
var Promise = require('bluebird');

function copyFiles(fromRoot, files, toRoot, toFolder) {
	return Promise.join(
		getFileSystem(fromRoot),
		getFileSystem(toRoot),
		(fromFs, toFs) => {
			return getFolder(toFs, toFolder, { create: true })
				.then(toFolderEntry => {
					var filePromises = files.map(file => getFile(fromFs, file, { create: false }));
					return Promise.all(filePromises)
						.then(fileEntries => {
							var copyPromises = [];
							fileEntries.forEach(fileEntry => {
								copyPromises.push(new Promise((resolve, reject) => {
									fileEntry.copyTo(
										toFolderEntry,
										'',
										() => resolve(),
										err => reject(new Error(JSON.stringify(err)))
									);
								}));
							});
							return Promise.all(copyPromises);
						});
				});
		});
}

module.exports = copyFiles;