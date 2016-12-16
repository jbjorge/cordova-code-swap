var Promise = require('bluebird');

function getFolder(fs, path, options) {
	return new Promise((resolve, reject) => {
		fs.getDirectory(
			path,
			options,
			resolve,
			err => reject(new Error(JSON.stringify(err)))
		);
	});
}

module.exports = getFolder;