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
			err => reject(new Error('cordova-code-swap: ' + JSON.stringify(err)))
		);
	});
}

module.exports = getFile;
