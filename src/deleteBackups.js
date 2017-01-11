const getFileSystem = require('./getFileSystem');
const deleteFolder = require('./deleteFolder');
const getFolder = require('./getFolder');

function deleteBackups(backupList) {
	return getFileSystem(cordova.file.dataDirectory)
		.then(fs => getFolderEntries(fs, backupList))
		.then(deleteFolders);
}

function getFolderEntries(fs, backupList) {
	var getFolderPromises = backupList.map(backup => getFolder(fs, backup.storageFolder, { create: false }));
	var reflections = getFolderPromises.map(getFolderPromise => getFolderPromise.reflect());

	return Promise.all(reflections)
		.then(inspections => inspections.filter(inspection => inspection.isFulfilled()))
		.then(resolvedPromises => resolvedPromises.map(resolved => resolved._settledValueField));
}

function deleteFolders(folderEntries) {
	return Promise.all(folderEntries.map(folderEntry => deleteFolder(folderEntry)));
}

module.exports = deleteBackups;
