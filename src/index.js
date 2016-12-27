var request = require('request-promise');
var Promise = require('bluebird');
var fetchFiles = require('./fetchFiles');
var getCopyAndDownloadList = require('./getCopyAndDownloadList');
var compareWithCurrentVersion = require('./compareWithCurrentVersion');
var parseResponseToObject = require('./parseResponseToObject');
var initialized = false;
var ccs = JSON.parse(localStorage.ccs || JSON.stringify({}));
var defaultOptions = {
	entryFile: 'index.html',
	headers: {
		'User-Agent': 'Cordova-Code-Swap'
	}
};

function initialize() {
	if (ccs.entryPoint && ccs.entryPoint !== window.location.href) {
		window.location.href = ccs.entryPoint;
	}
	initialized = true;
	return Promise.resolve();
}

function lookForUpdates(url, options) {
	options = Object.assign({}, defaultOptions, options);
	if (!initialized) {
		return Promise.reject(new Error('cordova-code-swap: .initialize() needs to be run before looking for updates. It should be the first thing to be run in the application.'));
	}

	return request.get(url, { headers: options.headers })
		.then(parseResponseToObject)
		.then(updateInfo => compareWithCurrentVersion(ccs, updateInfo))
		.then(updateInfo => {
			var downloadFunction = _download.bind(null, updateInfo, options);
			downloadFunction.updateInfo = updateInfo;
			return downloadFunction;
		});
}

function _download(updateInfo, options, progressCallback) {
	var contentUrl = updateInfo.content_url;
	var manifestUrl = contentUrl + 'chcp.manifest';
	return request.get(manifestUrl, { headers: options.headers })
		.then(parseResponseToObject)
		.then(manifest => getCopyAndDownloadList(ccs, manifest))
		.then(fetchList => fetchFiles(ccs, fetchList, updateInfo, options, progressCallback))
		.then(() => {
			ccs.pendingInstallation = {};
			ccs.pendingInstallation.updateInfo = updateInfo;
			ccs.pendingInstallation.options = options;
			localStorage.ccs = JSON.stringify(ccs);
		})
		.then(() => {
			return _install.bind(null, updateInfo, options);
		})
		.catch(err => {
			ccs.pendingInstallation = false;
			localStorage.ccs = JSON.stringify(ccs);
			throw err;
		});
}

function _install(updateInfo, options) {
	ccs.pendingInstallation = false;
	ccs.version = updateInfo.release;
	ccs.entryPoint = cordova.file.dataDirectory + ccs.version + '/' + options.entryFile;
	localStorage.ccs = JSON.stringify(ccs);
	window.location.href = ccs.entryPoint;
	return Promise.resolve();
}

function install() {
	if (ccs.pendingInstallation) {
		return _install(ccs.pendingInstallation.updateInfo, ccs.pendingInstallation.options);
	} else {
		return Promise.reject(new Error('cordova-code-swap: Tried to install update, but no updates have been previously downloaded.'));
	}
}

module.exports = { initialize, lookForUpdates, install };
