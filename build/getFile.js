'use strict';

var Promise = require('bluebird');

function getFile(fs, path, options) {
	return new Promise(function (resolve, reject) {
		fs.getFile(path, options, resolve, function (err) {
			return reject(new Error('cordova-code-swap: ' + JSON.stringify(err)));
		});
	});
}

module.exports = getFile;