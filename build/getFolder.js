'use strict';

var Promise = require('bluebird');

function getFolder(fs, path, options) {
	return new Promise(function (resolve, reject) {
		fs.getDirectory(path, options, resolve, function (err) {
			return reject(new Error('cordova-code-swap: ' + JSON.stringify(err)));
		});
	});
}

module.exports = getFolder;