function downloadFiles(contentUrl, filesToDownload, destinationFolder, options) {
	var downloadPromises = [];
	filesToDownload.forEach(fileToDownload => {
		downloadPromises.push(downloadFile(contentUrl, fileToDownload, destinationFolder, options));
	});
	return Promise.all(downloadPromises);
}

function downloadFile(contentUrl, fileToDownload, destinationFolder, options) {
	return new Promise((resolve, reject) => {
		var fileTransfer = new FileTransfer();
		var uri = encodeURI(contentUrl + fileToDownload);
		var shouldTrustAllHosts = false;

		fileTransfer.download(
			uri,
			destinationFolder,
			function(entry) {
				console.log("download complete: " + entry.toURL());
				resolve(entry);
			},
			function(error) {
				console.log("download error source " + error.source);
				console.log("download error target " + error.target);
				console.log("download error code" + error.code);
				reject(error);
			},
			shouldTrustAllHosts,
			options
		);
	});
}

module.exports = downloadFiles;