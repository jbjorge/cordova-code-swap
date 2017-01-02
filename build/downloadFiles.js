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
function downloadFiles(contentUrl, filesToDownload, destinationFolderName, options) {
	var downloadPromises = [];
	filesToDownload.forEach(function (fileToDownload) {
		downloadPromises.push(downloadFile(contentUrl, fileToDownload, destinationFolderName, { headers: options.headers }));
	});
	return Promise.all(downloadPromises);
}

function downloadFile(contentUrl, fileToDownload, destinationFolderName, options) {
	return createFoldersInPath(urlJoin(destinationFolderName, fileToDownload), { endsInFile: true }).then(function () {
		return new Promise(function (resolve, reject) {
			var fileTransfer = new FileTransfer();
			var uri = urlJoin(contentUrl, fileToDownload);
			var destinationPath = cordova.file.dataDirectory + destinationFolderName + '/' + fileToDownload;
			var shouldTrustAllHosts = false;

			fileTransfer.download(uri, destinationPath, resolve, function (error) {
				return reject(new Error('cordova-code-swap: ' + JSON.stringify(error)));
			}, shouldTrustAllHosts, options);
		});
	});
}

module.exports = downloadFiles;