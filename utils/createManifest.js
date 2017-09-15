const globby = require('globby');
const hashFile = require('./hashFile');
const Promise = require('bluebird');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

function createManifest(inputGlob, outputFolder, replace) {
	return globby(inputGlob, { nodir: true })
		.then(paths => Promise.all(paths.map(hashFile)))
		.then(manifest => negotiateReplacePaths(manifest, replace))
		.then(manifest => createFolders(outputFolder).then(() => manifest))
		.then(manifest => writeManifestToFile(manifest, outputFolder));
}

function negotiateReplacePaths(manifest, replace) {
	if (!replace) {
		return manifest;
	}
	const searchString = replace[0];
	const replaceString = replace[1];

	let modifiedManifest = [];
	manifest.forEach(fileObject => {
		let currentPath = fileObject.file;
		let newPath = currentPath.replace(searchString, replaceString);
		modifiedManifest.push({
			file: newPath,
			hash: fileObject.hash
		});
	});
	return modifiedManifest;
}

function createFolders(outputFolder) {
	return new Promise((resolve, reject) => {
		mkdirp(outputFolder, err => {
			if (err) {
				reject(err);
			}
			resolve();
		});
	});
}

function writeManifestToFile(manifest, outputFolder) {
	return new Promise((resolve, reject) => {
		fs.writeFile(
			path.join(outputFolder, 'chcp.manifest'),
			JSON.stringify(manifest),
			err => {
				if (err) {
					reject(err);
				}
				resolve();
			}
		);
	});
}

module.exports = createManifest;
