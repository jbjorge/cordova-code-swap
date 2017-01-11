const Promise = require('bluebird');

function deleteFolder(folderEntry) {
	return new Promise((resolve, reject) => {
		folderEntry.removeRecursively(resolve, reject);
	});
}

module.exports = deleteFolder;