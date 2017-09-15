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
function downloadFiles(contentUrl, filesToDownload, destinationFolderName, options, progressCallback) {
	progressCallback = progressCallback || function() {};
	const onFileDoneCallback = onFileDone(filesToDownload.length, progressCallback);
	const downloadPromises = filesToDownload.map(fileToDownload => {
		return downloadFile(contentUrl, fileToDownload, destinationFolderName, { headers: options.headers }, onFileDoneCallback);
	});
	return Promise.all(downloadPromises);
}

function downloadFile(contentUrl, fileToDownload, destinationFolderName, options, doneCallback) {
	return createFoldersInPath(urlJoin(destinationFolderName, fileToDownload), { endsInFile: true })
		.then(() => {
			return new Promise((resolve, reject) => {
				const fileTransfer = new FileTransfer();
				const uri = encodeURI(urlJoin(contentUrl, fileToDownload));
				const destinationPath = cordova.file.dataDirectory + destinationFolderName + '/' + fileToDownload;
				const shouldTrustAllHosts = false;

				fileTransfer.download(
					uri,
					destinationPath,
					(args) => {
						doneCallback(fileToDownload);
						resolve(args);
					},
					error => reject(new Error('cordova-code-swap: ' + JSON.stringify(error))),
					shouldTrustAllHosts,
					options
				);
			});
		});

}

function onFileDone(totalFilesCount, progressCallback) {
	let fileDownloadedCount = 0;
	return filename => {
		fileDownloadedCount++;
		const percentageAsInt = fileDownloadedCount / totalFilesCount * 100;
		progressCallback(percentageAsInt, filename);
	};
}

module.exports = downloadFiles;
