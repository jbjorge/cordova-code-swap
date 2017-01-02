'use strict';

var Promise = require('bluebird');
var getFileSystem = require('./getFileSystem');

/**
 * Loops over all folders in a path and creates them
 * @param  {string} path    the path to be created
 * @param  {Object} options optional - set .endsInFile to true if path ends in filename
 * @return {Promise}
 */
function createFoldersInPath(path) {
	var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	var folders = path.split('/');
	return getFileSystem(cordova.file.dataDirectory).then(function (fs) {
		var dirCreationPromises = Promise.resolve();

		var _loop = function _loop(i) {
			if (i == folders.length - 1 && options.endsInFile) {
				return 'continue';
			}
			var currentPath = folders.slice(0, i + 1);
			dirCreationPromises = dirCreationPromises.then(function () {
				return createDirectory(fs, currentPath);
			});
		};

		for (var i = 0; i < folders.length; i++) {
			var _ret = _loop(i);

			if (_ret === 'continue') continue;
		}
		return dirCreationPromises;
	});
}

/**
 * Creates a folder
 * @param  {Object} fs      An instance of the cordova file system
 * @param  {Array}  folders Array of folder names
 * @return {Promise}
 */
function createDirectory(fs, folders) {
	return new Promise(function (resolve, reject) {
		fs.getDirectory(folders.join('/'), { create: true }, function () {
			return resolve();
		}, function (err) {
			if (err.code != 12) {
				reject(new Error('cordova-code-swap: ' + JSON.stringify(err)));
			} else {
				resolve();
			}
		});
	});
}

module.exports = createFoldersInPath;