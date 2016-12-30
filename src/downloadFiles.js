const createFoldersInPath = require('./createFoldersInPath');
const urlJoin = require('url-join');

/**
 * Downloads files
 * @param  {String} contentUrl				URL to root of where the download content is placed
 * @param  {Array[string]} filesToDownload	Array of paths to files to download relative to contentUrl
 * @param  {String} destinationFolderName	The name of the folder in which to place the downloaded files
 * @param  {Object} options					Can contain .headers to be sent with server requests when downloading
 * @return {Promise}
 */
function downloadFiles(contentUrl, filesToDownload, destinationFolderName, options) {
	const downloadPromises = [];
	filesToDownload.forEach(fileToDownload => {
		downloadPromises.push(downloadFile(contentUrl, fileToDownload, destinationFolderName, { headers: options.headers }));
	});
	return Promise.all(downloadPromises);
}

function downloadFile(contentUrl, fileToDownload, destinationFolderName, options) {
	return createFoldersInPath(urlJoin(destinationFolderName, fileToDownload), { endsInFile: true })
		.then(() => {
			return new Promise((resolve, reject) => {
				const fileTransfer = new FileTransfer();
				const uri = urlJoin(contentUrl, fileToDownload);
				const destinationPath = cordova.file.dataDirectory + destinationFolderName + '/' + fileToDownload;
				const shouldTrustAllHosts = false;

				fileTransfer.download(
					uri,
					destinationPath,
					resolve,
					error => reject(new Error('cordova-code-swap: ' + JSON.stringify(error))),
					shouldTrustAllHosts,
					options
				);
			});
		});

}

module.exports = downloadFiles;