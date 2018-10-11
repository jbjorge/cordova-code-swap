const Promise = require('bluebird');
const errors = require('./errors');

/**
 * Get folder from the cordova file system
 * @param  {Object} fs      Instance of the cordova file system
 * @param  {String} path    Path to the folder to be fetched by cordova
 * @param  {Object} options Options for the cordova File API
 * @return {Promise}
 */
function getFolder(fs, path, options) {
	return new Promise((resolve, reject) => {
		fs.getDirectory(
			path,
			options,
			resolve,
			err => reject(errors.create(errors.GET_FOLDER, 'Error when getting folder at path ' + path + ' Error: ' + JSON.stringify(err)))
		);
	});
}

module.exports = getFolder;
