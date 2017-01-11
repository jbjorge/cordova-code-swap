'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var sanitizeFolder = require('filenamify');

function updateCCSConfig(ccs, updateInfo, options) {
	var ccsCopy = _extends({}, ccs);

	// add current version to backups
	if (ccsCopy.backups) {
		ccsCopy.backups.push({
			version: ccsCopy.version,
			manifest: ccsCopy.manifest,
			timestamp: ccsCopy.timestamp,
			entryPoint: ccsCopy.entryPoint,
			storageFolder: sanitizeFolder(ccsCopy.version)
		});
	} else {
		ccsCopy.backups = [];
	}
	ccsCopy.pendingInstallation = false;
	ccsCopy.version = updateInfo.release;
	ccsCopy.manifest = updateInfo.manifest;
	ccsCopy.timestamp = Date.now();
	ccsCopy.entryPoint = cordova.file.dataDirectory + sanitizeFolder(ccsCopy.version) + '/' + options.entryFile;

	return ccsCopy;
}

module.exports = updateCCSConfig;