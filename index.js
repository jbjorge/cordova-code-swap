var request = require('superagent-bluebird-promise');
var Promise = require('bluebird');

var ccs = localStorage.cordovaCodeSwap || {};
var exampleData = require('./example-data');
ccs.manifest = exampleData.manifest;

function initialize() {
	if (ccs.entryPoint) {
		window.location.href = ccs.entryPoint;
	}
}

function lookForUpdates(url, options) {
	options = options || {};

	return request.get(url, options)
		.then(getTextFromRequest)
		.then(compareWithCurrentVersion)
		.then(versionInfo => {
			return download.bind(null, versionInfo, options);
		});
}

function download(versionInfo, options) {
	var contentUrl = versionInfo.content_url;
	var manifestUrl = contentUrl + 'chcp.manifest';
	return request.get(manifestUrl)
		.then(getTextFromRequest)
		.then(getCopyAndDownloadList)
		.then(fetchList => getFiles(fetchList, versionInfo, options))
		.then(() => install.bind(null, versionInfo, options));
}

function install(versionInfo, options) {
	ccs.entryPoint = versionInfo.release + options.entryPoint || '/index.html';
	localStorage.ccs = ccs;
	window.location.reload();
}

function getFiles({filesToCopy, filesToDownload}, versionInfo, options) {
	var contentUrl = versionInfo.content_url;
	var folderName = versionInfo.release;
	return copyFiles(filesToCopy, folderName)
		.catch(() => downloadFiles(contentUrl, filesToCopy, folderName, options))
		.then(() => downloadFiles(contentUrl, filesToDownload, folderName, options));
}

function copyFiles(filesToCopy, folderName) {
	var copyPromises = [];
	filesToCopy.forEach(fileToCopy => {
		copyPromises.push(copyFile(fileToCopy, folderName));
	});
	return Promise.all(copyPromises);
}

function downloadFiles(contentUrl, filesToDownload, folderName, options) {
	var downloadPromises = [];
	filesToDownload.forEach(fileToDownload => {
		downloadPromises.push(downloadFile(contentUrl, fileToDownload, folderName, options));
	});
	return Promise.all(downloadPromises);
}

function copyFile(fileToCopy, folderName) {
	return Promise.resolve();
}

function downloadFile(contentUrl, fileToDownload, folderName, options) {
	return Promise.resolve();
	// return new Promise((resolve, reject) => {
	// 	var fileTransfer = new FileTransfer();
	// 	var uri = encodeURI(contentUrl, fileToDownload);

	// 	fileTransfer.download(
	// 		uri,
	// 		folderName,
	// 		function(entry) {
	// 			console.log("download complete: " + entry.toURL());
	// 			resolve(entry);
	// 		},
	// 		function(error) {
	// 			console.log("download error source " + error.source);
	// 			console.log("download error target " + error.target);
	// 			console.log("download error code" + error.code);
	// 			reject(error);
	// 		},
	// 		false,
	// 		options
	// 	);
	// });
}

function getCopyAndDownloadList(manifest) {
	var filesToCopy = manifest.filter(hashExists);
	var filesToDownload = manifest.filter(fileEntry => !hashExists(fileEntry));
	return { filesToCopy, filesToDownload };
}

function hashExists(fileEntry) {
	for (var i = 0; i < ccs.manifest.length; i++) {
		if (ccs.manifest[i].hash === fileEntry.hash)
			return true;
	}
	return false;
}

function compareWithCurrentVersion(versionInfo) {
	if (versionInfo.release === ccs.version)
		throw { code: 1, message: 'No new updates found' };
	return versionInfo;
}

function getTextFromRequest(request) {
	return JSON.parse(request.text);
}

module.exports = { initialize, lookForUpdates };
