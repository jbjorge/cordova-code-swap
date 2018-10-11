const sanitizeFolder = require('filenamify');
const packageJson = require('../../package.json');

function updateCCSConfig(ccs, updateInfo, options, instanceOptions) {
	let ccsCopy = Object.assign({}, ccs);

	// add current version to backups
	if (ccsCopy.backups && !instanceOptions.debug.preserveBreakpoints) {
		ccsCopy.backups.push({
			release: ccsCopy.release,
			manifest: ccsCopy.manifest,
			timestamp: ccsCopy.timestamp,
			entryPoint: ccsCopy.entryPoint,
			ccsVersion: ccsCopy.ccsVersion
		});
	} else {
		ccsCopy.backups = [];
	}
	ccsCopy.pendingInstallation = false;
	ccsCopy.release = instanceOptions.debug.preserveBreakpoints ? 'ccsDebug' : updateInfo.release;
	ccsCopy.manifest = updateInfo.manifest;
	ccsCopy.timestamp = Date.now();
	ccsCopy.entryPoint = sanitizeFolder(ccsCopy.release) + '/' + options.entryFile;
	ccsCopy.ccsVersion = packageJson.version;

	return ccsCopy;
}

module.exports = updateCCSConfig;
