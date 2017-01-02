'use strict';

var Promise = require('bluebird');

/**
 * Get folder from the cordova file system
 * @param  {Object} fs      Instance of the cordova file system
 * @param  {String} path    Path to the folder to be fetched by cordova
 * @param  {Object} options Options for the cordova File API
 * @return {Promise}
 */
function getFolder(fs, path, options) {
	return new Promise(function (resolve, reject) {
		fs.getDirectory(path, options, resolve, function (err) {
			return reject(new Error('cordova-code-swap: ' + JSON.stringify(err)));
		});
	});
}

module.exports = getFolder;