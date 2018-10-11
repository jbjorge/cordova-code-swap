const Promise = require('bluebird');
const errors = require('../shared/errors');

function deleteFolder(folderEntry) {
	return new Promise((resolve, reject) => {
		folderEntry.removeRecursively(
			resolve,
			err => reject(errors.create(errors.DELETE_FOLDER, err.message, err))
		);
	});
}

module.exports = deleteFolder;
