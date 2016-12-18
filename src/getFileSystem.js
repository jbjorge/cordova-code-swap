var Promise = require('bluebird');

function getFileSystem(folder) {
	return new Promise(function(resolve, reject) {
		window.resolveLocalFileSystemURL(
			folder,
			resolve,
			err => reject(new Error('cordova-code-swap: ' + JSON.stringify(err))));
	});
}

module.exports = getFileSystem;