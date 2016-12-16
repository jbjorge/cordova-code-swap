var getFileSystem = require('./getFileSystem');
var getFolder = require("./getFolder");
var Promise = require('bluebird');

function copyFolder(fromRoot, fromFolderPath, toRoot, toFolderPath) {
	return Promise.join(
		getFileSystem(fromRoot),
		getFileSystem(toRoot),
		(fromFs, toFs) => {
			return Promise.join(
				getFolder(fromFs, fromFolderPath, { create: false }),
				getFolder(toFs, toFolderPath, { create: true }),
				(fromFolder, toFolder) => {
					return new Promise((resolve, reject) => {
						fromFolder.copyTo(
							toFolder,
							'',
							resolve,
							err => {
								if (err.code == 9) {
									resolve();
								}
								else {
									reject(new Error(JSON.stringify(err)));
								}
							}
						);
					});
				}
			);
		});
}

module.exports = copyFolder;
