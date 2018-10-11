'use strict';

var Promise = require('bluebird');
var errors = require('../shared/errors');

function deleteFolder(folderEntry) {
	return new Promise(function (resolve, reject) {
		folderEntry.removeRecursively(resolve, function (err) {
			return reject(errors.create(errors.DELETE_FOLDER, err.message, err));
		});
	});
}

module.exports = deleteFolder;