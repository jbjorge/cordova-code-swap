var Promise = require('bluebird');

function getFile(fs, path, options) {
	return new Promise((resolve, reject) => {
		fs.getFile(
			path,
			options,
			resolve,
			err => reject(new Error(JSON.stringify(err)))
		);
	});
}

module.exports = getFile;
