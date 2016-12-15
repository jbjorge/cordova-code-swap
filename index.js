var request = require('superagent-bluebird-promise');
var Promise = require('bluebird');
var fetchFiles = require('./src/fetchFiles');
var getCopyAndDownloadList = require('./src/getCopyAndDownloadList');
var compareWithCurrentVersion = require('./src/compareWithCurrentVersion');
var getTextFromRequest = require('./src/getTextFromRequest');
var ccs = localStorage.cordovaCodeSwap || {};
var initialized = false;

// test-data - remove before deploy
var exampleData = require('./example-data');
ccs.manifest = exampleData.manifest;

function initialize() {
	if (ccs.entryPoint && ccs.entryPoint !== window.location.href) {
		window.location.href = ccs.entryPoint;
	}
	initialized = true;
	return Promise.resolve();
}

function lookForUpdates(url, options) {
	options = options || {};
	if (!initialized) {
		return Promise.reject('Cordova-code-swap: .initialize() needs to be run before looking for updates. It should be the first thing to be run in the application.');
	}

	return request.get(url, options)
		.then(getTextFromRequest)
		.then(versionInfo => compareWithCurrentVersion(ccs, versionInfo))
		.then(versionInfo => download.bind(null, versionInfo, options));
}

function download(versionInfo, options) {
	var contentUrl = versionInfo.content_url;
	var manifestUrl = contentUrl + 'chcp.manifest';
	return request.get(manifestUrl)
		.then(getTextFromRequest)
		.then(manifest => getCopyAndDownloadList(ccs, manifest))
		.then(fetchList => fetchFiles(ccs, fetchList, versionInfo, options))
		.then(() => install.bind(null, versionInfo, options));
}

function install(versionInfo, options) {
	ccs.version = versionInfo.release;
	ccs.entryPoint = cordova.file.dataDirectory + ccs.version + options.entryPoint || '/index.html';
	localStorage.ccs = ccs;
	window.location.href = ccs.entryPoint;
}

module.exports = { initialize, lookForUpdates };
