var Promise = require('bluebird');

function getFileSystem(folder) {
	return new Promise(function(resolve, reject) {
		window.resolveLocalFileSystemURL(folder, resolve, reject);
	});
}

module.exports = getFileSystem;