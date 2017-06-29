'use strict';

var Promise = require('bluebird');
var getFileSystem = require('../shared/getFileSystem');
var getFolder = require('../shared/getFolder');

/**
 * Loops over all folders in a path and creates them
 * @param  {string} path    the path to be created
 * @param  {Object} options optional - set .endsInFile to true if path ends in filename
 * @return {Promise}		resolves with the final cordova folder
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
			var currentPath = folders.slice(0, i + 1).join('/');
			dirCreationPromises = dirCreationPromises
			// tries to create the folder
			.then(function () {
				return getFolder(fs, currentPath, { create: true });
			})
			// tries to get the folder instead if creating failed because it already exists
			.catch(function () {
				return getFolder(fs, currentPath, { create: false });
			});
		};

		for (var i = 0; i < folders.length; i++) {
			var _ret = _loop(i);

			if (_ret === 'continue') continue;
		}
		return dirCreationPromises;
	});
}

module.exports = createFoldersInPath;