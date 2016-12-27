var getFileSystem = require('./getFileSystem');
var getFolder = require('./getFolder');
var Promise = require('bluebird');

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
					reject(new Error('cordova-code-swap: ' + JSON.stringify(err)));
				}
			}
		);
	});
}

module.exports = copyFolder;
