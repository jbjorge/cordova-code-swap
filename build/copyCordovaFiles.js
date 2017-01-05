'use strict';

var copyFiles = require('./copyFiles');
var copyFolder = require('./copyFolder');
var applicationDir = cordova.file.applicationDirectory;

function copyCordovaFiles(destinationRoot, destinationFolderName) {
	var srcFolder = applicationDir + 'www/';

	return copyFiles(srcFolder, ['cordova.js', 'cordova_plugins.js'], destinationRoot, destinationFolderName).then(function () {
		return copyFolder(srcFolder, 'cordova-js-src/', destinationRoot, destinationFolderName);
	}).then(function () {
		return copyFolder(srcFolder, 'plugins/', destinationRoot, destinationFolderName);
	});
}

module.exports = copyCordovaFiles;