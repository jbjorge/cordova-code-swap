const copyFiles = require('./copyFiles');
const copyFolder = require('./copyFolder');
const applicationDir = cordova.file.applicationDirectory;

function copyCordovaFiles(destinationRoot, destinationFolderName) {
	const srcFolder = applicationDir + 'www/';

	return copyFiles(srcFolder, ['cordova.js', 'cordova_plugins.js'], destinationRoot, destinationFolderName)
		.then(() => copyFolder(srcFolder, 'cordova-js-src/', destinationRoot, destinationFolderName))
		.then(() => copyFolder(srcFolder, 'plugins/', destinationRoot, destinationFolderName));
}

module.exports = copyCordovaFiles;