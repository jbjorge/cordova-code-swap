'use strict';

var createFoldersInPath = require('./createFoldersInPath');
var urlJoin = require('url-join');

/**
 * Downloads files
 * @param  {String} contentUrl				URL to root of where the download content is placed
 * @param  {Array[string]} filesToDownload	Array of paths to files to download relative to contentUrl
 * @param  {String} destinationFolderName	The name of the folder in which to place the downloaded files
 * @param  {Object} options					Can contain .headers to be sent with server requests when downloading
 * @return {Promise}
 */
function downloadFiles(contentUrl, filesToDownload, destinationFolderName, options, progressCallback) {
	progressCallback = progressCallback || function () {};
	var onFileDoneCallback = onFileDone(filesToDownload.length, progressCallback);
	var downloadPromises = filesToDownload.map(function (fileToDownload) {
		return downloadFile(contentUrl, fileToDownload, destinationFolderName, { headers: options.headers }, onFileDoneCallback);
	});
	return Promise.all(downloadPromises);
}

function downloadFile(contentUrl, fileToDownload, destinationFolderName, options, doneCallback) {
	return createFoldersInPath(urlJoin(destinationFolderName, fileToDownload), { endsInFile: true }).then(function () {
		return new Promise(function (resolve, reject) {
			var fileTransfer = new FileTransfer();
			var uri = encodeURI(urlJoin(contentUrl, fileToDownload));
			var destinationPath = cordova.file.dataDirectory + destinationFolderName + '/' + fileToDownload;
			var shouldTrustAllHosts = false;

			fileTransfer.download(uri, destinationPath, function (args) {
				doneCallback(fileToDownload);
				resolve(args);
			}, function (error) {
				return reject(new Error('cordova-code-swap: ' + JSON.stringify(error)));
			}, shouldTrustAllHosts, options);
		});
	});
}

function onFileDone(totalFilesCount, progressCallback) {
	var fileDownloadedCount = 0;
	return function (filename) {
		fileDownloadedCount++;
		var percentageAsInt = fileDownloadedCount / totalFilesCount * 100;
		progressCallback(percentageAsInt, filename);
	};
}

module.exports = downloadFiles;