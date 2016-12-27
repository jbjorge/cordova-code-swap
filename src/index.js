var request = require('request-promise');
var Promise = require('bluebird');
var fetchFiles = require('./fetchFiles');
var getCopyAndDownloadList = require('./getCopyAndDownloadList');
var compareWithCurrentVersion = require('./compareWithCurrentVersion');
var getTextFromRequest = require('./getTextFromRequest');
var initialized = false;
var	ccs = JSON.parse(localStorage.ccs || JSON.stringify({}));
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
		.then(getTextFromRequest)
		.then(updateInfo => compareWithCurrentVersion(ccs, updateInfo))
		.then(updateInfo => {
			var downloadFunction = download.bind(null, updateInfo, options);
			return downloadFunction;
		});
}

function download(updateInfo, options, progressCallback) {
	var contentUrl = updateInfo.content_url;
	var manifestUrl = contentUrl + 'chcp.manifest';
	return request.get(manifestUrl, { headers: options.headers })
		.then(getTextFromRequest)
		.then(manifest => getCopyAndDownloadList(ccs, manifest))
		.then(fetchList => fetchFiles(ccs, fetchList, updateInfo, options, progressCallback))
		.then(() => install.bind(null, updateInfo, options));
}

function install(updateInfo, options) {
	ccs.version = updateInfo.release;
	ccs.entryPoint = cordova.file.dataDirectory + ccs.version + '/' + options.entryFile;
	localStorage.ccs = JSON.stringify(ccs);
	window.location.href = ccs.entryPoint;
}

module.exports = { initialize, lookForUpdates };
