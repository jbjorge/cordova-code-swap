'use strict';

var getFileSystem = require('../shared/getFileSystem');
var getFolder = require('../shared/getFolder');
var getFile = require('./getFile');
var Promise = require('bluebird');
var createFoldersInPath = require('./createFoldersInPath');
var urlJoin = require('url-join');
var errors = require('../shared/errors');

/**
 * Copies files between locations
 * @param  {String} 		fromRootFolder The folder to be copied from
 * @param  {Array[String]} 	files          Array of paths to files relative to fromRootFolder
 * @param  {String} 		toRootFolder   The root folder of the copy destination
 * @param  {String} 		toFolder       The folder to create and use as destination for files
 * @return {Promise}
 */
function copyFiles(fromRootFolder, files, toRootFolder, toFolder) {
	return Promise.join(getFileSystem(fromRootFolder), getFolderEntry(toRootFolder, toFolder), function (fromFolderEntry, toFolderEntry) {
		var copyPromises = [];
		files.forEach(function (file) {
			copyPromises.push(copyFile(fromFolderEntry, file, toFolderEntry));
		});
		return Promise.all(copyPromises);
	});
}

function getFolderEntry(rootFolder, subFolder) {
	return getFileSystem(rootFolder).then(function (fs) {
		return getFolder(fs, subFolder, { create: true });
	});
}

function copyFile(fromFolderEntry, file, toFolderEntry) {
	var fullPath = urlJoin(toFolderEntry.fullPath, file);
	return Promise.join(getFile(fromFolderEntry, file, { create: false }), createFoldersInPath(fullPath, { endsInFile: true }), function (fileEntry, destinationEntry) {
		return new Promise(function (resolve, reject) {
			fileEntry.copyTo(destinationEntry, '', function () {
				return resolve();
			}, function (err) {
				return reject(errors.create(errors.FILE_COPY, JSON.stringify(err)));
			});
		});
	});
}

module.exports = copyFiles;