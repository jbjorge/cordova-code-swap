var createFoldersInPath = require('./createFoldersInPath');

function downloadFiles(contentUrl, filesToDownload, destinationFolderName, options) {
	var downloadPromises = [];
	filesToDownload.forEach(fileToDownload => {
		downloadPromises.push(downloadFile(contentUrl, fileToDownload, destinationFolderName, options));
	});
	return Promise.all(downloadPromises);
}

function downloadFile(contentUrl, fileToDownload, destinationFolderName, options) {
	return createFoldersInPath(destinationFolderName + '/' + fileToDownload, { endsInFile: true })
		.then(() => {
			return new Promise((resolve, reject) => {
				var fileTransfer = new FileTransfer();
				var uri = encodeURI(contentUrl + fileToDownload);
				var destinationPath = encodeURI(cordova.file.dataDirectory + destinationFolderName + '/' + fileToDownload);
				var shouldTrustAllHosts = false;

				fileTransfer.download(
					uri,
					destinationPath,
					function(entry) {
						console.log("download complete: " + entry.toURL());
						resolve(entry);
					},
					function(error) {
						debugger;
						console.log("download error source " + error.source);
						console.log("download error target " + error.target);
						console.log("download error code" + error.code);
						reject(error);
					},
					shouldTrustAllHosts,
					options
				);
			});
		});

}

module.exports = downloadFiles;