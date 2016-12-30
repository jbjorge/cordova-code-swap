const Promise = require('bluebird');

/**
 * Gets instance of the cordova file system
 * @param  {String} folder Path to the file system to instantiate
 * @return {Promise}
 */
function getFileSystem(folder) {
	return new Promise(function(resolve, reject) {
		window.resolveLocalFileSystemURL(
			folder,
			resolve,
			err => reject(new Error('cordova-code-swap: ' + JSON.stringify(err))));
	});
}

module.exports = getFileSystem;