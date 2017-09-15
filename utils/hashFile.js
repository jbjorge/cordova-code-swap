const crypto = require('crypto');
const Promise = require('bluebird');
const fs = require('fs');

function hashFile(filePath) {
	return new Promise((resolve, reject) => {
		fs.readFile(filePath, { encoding: 'utf8' }, (err, file) => {
			if (err) {
				reject(err);
			}
			resolve(file);
		});
	})
		.then(file => crypto.createHash('md5').update(file).digest('hex'))
		.then(hash => ({
			file: filePath,
			hash: hash
		}));
}

module.exports = hashFile;
