'use strict';

var getFileSystem = require('./getFileSystem');
var getFolder = require("./getFolder");
var Promise = require('bluebird');

function copyFolder(fromRoot, fromFolderPath, toRoot, toFolderPath) {
	return Promise.join(getFileSystem(fromRoot), getFileSystem(toRoot), function (fromFs, toFs) {
		return Promise.join(getFolder(fromFs, fromFolderPath, { create: false }), getFolder(toFs, toFolderPath, { create: true }), function (fromFolder, toFolder) {
			return new Promise(function (resolve, reject) {
				fromFolder.copyTo(toFolder, '', resolve, function (err) {
					if (err.code == 9) {
						resolve();
					} else {
						reject(new Error('cordova-code-swap: ' + JSON.stringify(err)));
					}
				});
			});
		});
	});
}

module.exports = copyFolder;