'use strict';

var Promise = require('bluebird');
var getFileSystem = require('./getFileSystem');

function createFoldersInPath(path) {
	var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	var folders = path.split('/');
	return getFileSystem(cordova.file.dataDirectory).then(function (fs) {
		var dirCreationPromises = Promise.resolve();
		for (var i = 0; i < folders.length; i++) {
			if (i == folders.length - 1 && options.endsInFile) {
				continue;
			}
			var currentPath = folders.slice(0, i + 1);
			dirCreationPromises = dirCreationPromises.then(function () {
				return createDirectory(fs, currentPath);
			});
		}
		return dirCreationPromises;
	});
}

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