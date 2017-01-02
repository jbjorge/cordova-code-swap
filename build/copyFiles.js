'use strict';

var getFileSystem = require('./getFileSystem');
var getFolder = require('./getFolder');
var getFile = require('./getFile');
var Promise = require('bluebird');

/**
 * Copies files between locations
 * @param  {String} 		fromRootFolder The folder to be copied from
 * @param  {Array[String]} 	files          Array of paths to files relative to fromRootFolder
 * @param  {String} 		toRootFolder   The root folder of the copy destination
 * @param  {String} 		toFolder       The folder to create and use as destination for files
 * @return {Promise}
 */
function copyFiles(fromRootFolder, files, toRootFolder, toFolder) {
	return Promise.join(getFileEntries(fromRootFolder, files), getToFolderEntry(toRootFolder, toFolder), function (fileEntries, toFolderEntry) {
		var copyPromises = [];
		fileEntries.forEach(function (fileEntry) {
			copyPromises.push(copyFile(fileEntry, toFolderEntry));
		});
		return Promise.all(copyPromises);
	});
}

function getToFolderEntry(toRootFolder, toFolder) {
	return getFileSystem(toRootFolder).then(function (fs) {
		return getFolder(fs, toFolder, { create: true });
	});
}

function getFileEntries(fromRootFolder, files) {
	return getFileSystem(fromRootFolder).then(function (fs) {
		var filePromises = files.map(function (file) {
			return getFile(fs, file, { create: false });
		});
		return Promise.all(filePromises);
	});
}

function copyFile(fileEntry, toFolderEntry) {
	return new Promise(function (resolve, reject) {
		fileEntry.copyTo(toFolderEntry, '', function () {
			return resolve();
		}, function (err) {
			return reject(new Error('cordova-code-swap: ' + JSON.stringify(err)));
		});
	});
}

module.exports = copyFiles;