const Promise = require('bluebird');
const errors = require('./errors');

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
			err => reject(errors.create(errors.GET_FILE_SYSTEM, 'Error when getting file system at path ' + folder + ' Error: ' + JSON.stringify(err)))
		);
	});
}

module.exports = getFileSystem;
