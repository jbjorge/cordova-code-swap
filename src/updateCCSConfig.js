const sanitizeFolder = require('filenamify');

function updateCCSConfig(ccs, updateInfo, options) {
	let ccsCopy = Object.assign({}, ccs);

	// add current version to backups
	if (ccsCopy.backups && !options.debug) {
		ccsCopy.backups.push({
			release: ccsCopy.release,
			manifest: ccsCopy.manifest,
			timestamp: ccsCopy.timestamp,
			entryPoint: ccsCopy.entryPoint
		});
	} else {
		ccsCopy.backups = [];
	}
	ccsCopy.pendingInstallation = false;
	ccsCopy.release = options.debug ? 'ccsDebug' : updateInfo.release;
	ccsCopy.manifest = updateInfo.manifest;
	ccsCopy.timestamp = Date.now();
	ccsCopy.entryPoint = cordova.file.dataDirectory + sanitizeFolder(ccsCopy.release) + '/' + options.entryFile;

	return ccsCopy;
}

module.exports = updateCCSConfig;
