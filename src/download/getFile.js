const errors = require('../shared/errors');
const Promise = require('bluebird');

/**
 * Gets file from the file system
 * @param  {Object} fs      Instance of the cordova file system
 * @param  {String} path    Path to the file to be fetched
 * @param  {Object} options Options for the cordova File API
 * @return {FileEntry}      Instance of the cordova file entry
 */
function getFile(fs, path, options) {
	return new Promise((resolve, reject) => {
		fs.getFile(
			path,
			options,
			resolve,
			err => reject(errors.create(errors.GET_FILE, 'Error when getting file at path ' + path + ' Error: ' + JSON.stringify(err)))
		);
	});
}

module.exports = getFile;
