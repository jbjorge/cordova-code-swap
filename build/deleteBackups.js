'use strict';

var getFileSystem = require('./getFileSystem');
var deleteFolder = require('./deleteFolder');
var getFolder = require('./getFolder');

function deleteBackups(backupList) {
	return getFileSystem(cordova.file.dataDirectory).then(function (fs) {
		return getFolderEntries(fs, backupList);
	}).then(deleteFolders);
}

function getFolderEntries(fs, backupList) {
	var getFolderPromises = backupList.map(function (backup) {
		return getFolder(fs, backup.storageFolder, { create: false });
	});
	var reflections = getFolderPromises.map(function (getFolderPromise) {
		return getFolderPromise.reflect();
	});

	return Promise.all(reflections).then(function (inspections) {
		return inspections.filter(function (inspection) {
			return inspection.isFulfilled();
		});
	}).then(function (resolvedPromises) {
		return resolvedPromises.map(function (resolved) {
			return resolved._settledValueField;
		});
	});
}

function deleteFolders(folderEntries) {
	return Promise.all(folderEntries.map(function (folderEntry) {
		return deleteFolder(folderEntry);
	}));
}

module.exports = deleteBackups;