'use strict';

var getFileSystem = require('./getFileSystem');
var getFolder = require('./getFolder');
var getFile = require('./getFile');
var Promise = require('bluebird');

function copyFiles(fromRoot, files, toRoot, toFolder) {
	return Promise.join(getFileSystem(fromRoot), getFileSystem(toRoot), function (fromFs, toFs) {
		return getFolder(toFs, toFolder, { create: true }).then(function (toFolderEntry) {
			var filePromises = files.map(function (file) {
				return getFile(fromFs, file, { create: false });
			});
			return Promise.all(filePromises).then(function (fileEntries) {
				var copyPromises = [];
				fileEntries.forEach(function (fileEntry) {
					copyPromises.push(new Promise(function (resolve, reject) {
						fileEntry.copyTo(toFolderEntry, '', function () {
							return resolve();
						}, function (err) {
							return reject(new Error('cordova-code-swap: ' + JSON.stringify(err)));
						});
					}));
				});
				return Promise.all(copyPromises);
			});
		});
	});
}

module.exports = copyFiles;