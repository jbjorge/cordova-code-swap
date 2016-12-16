var request = require('superagent-bluebird-promise');
var Promise = require('bluebird');
var fetchFiles = require('./fetchFiles');
var getCopyAndDownloadList = require('./getCopyAndDownloadList');
var compareWithCurrentVersion = require('./compareWithCurrentVersion');
var getTextFromRequest = require('./getTextFromRequest');
var initialized = false;
var	ccs = JSON.parse(localStorage.ccs || JSON.stringify({}));

// test-data - remove before deploy
var exampleData = require('../example-data');
ccs.manifest = exampleData.manifest;

function initialize() {
	console.log(ccs.entryPoint, window.location.href);
	if (ccs.entryPoint && ccs.entryPoint !== window.location.href) {
		window.location.href = ccs.entryPoint;
	}
	initialized = true;
	return Promise.resolve();
}

function lookForUpdates(url, options) {
	options = options || {};
	options.entryPoint = options.entryPoint || 'index.html';
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
	ccs.entryPoint = cordova.file.dataDirectory + ccs.version + '/' + options.entryPoint;
	localStorage.ccs = JSON.stringify(ccs);
	window.location.href = ccs.entryPoint;
}

module.exports = { initialize, lookForUpdates };
