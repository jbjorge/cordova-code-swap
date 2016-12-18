'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var request = require('superagent-bluebird-promise');
var Promise = require('bluebird');
var fetchFiles = require('./fetchFiles');
var getCopyAndDownloadList = require('./getCopyAndDownloadList');
var compareWithCurrentVersion = require('./compareWithCurrentVersion');
var getTextFromRequest = require('./getTextFromRequest');
var initialized = false;
var ccs = JSON.parse(localStorage.ccs || JSON.stringify({}));
var defaultOptions = {
	entryFile: 'index.html'
};

function initialize() {
	if (ccs.entryPoint && ccs.entryPoint !== window.location.href) {
		window.location.href = ccs.entryPoint;
	}
	initialized = true;
	return Promise.resolve();
}

function lookForUpdates(url, options) {
	options = _extends({}, defaultOptions, options);
	if (!initialized) {
		return Promise.reject(new Error('cordova-code-swap: .initialize() needs to be run before looking for updates. It should be the first thing to be run in the application.'));
	}

	return request.get(url, options).then(getTextFromRequest).then(function (versionInfo) {
		return compareWithCurrentVersion(ccs, versionInfo);
	}).then(function (versionInfo) {
		return download.bind(null, versionInfo, options);
	});
}

function download(versionInfo, options) {
	var contentUrl = versionInfo.content_url;
	var manifestUrl = contentUrl + 'chcp.manifest';
	return request.get(manifestUrl).then(getTextFromRequest).then(function (manifest) {
		return getCopyAndDownloadList(ccs, manifest);
	}).then(function (fetchList) {
		return fetchFiles(ccs, fetchList, versionInfo, options);
	}).then(function () {
		return install.bind(null, versionInfo, options);
	});
}

function install(versionInfo, options) {
	ccs.version = versionInfo.release;
	ccs.entryPoint = cordova.file.dataDirectory + ccs.version + '/' + options.entryFile;
	localStorage.ccs = JSON.stringify(ccs);
	window.location.href = ccs.entryPoint;
}

module.exports = { initialize: initialize, lookForUpdates: lookForUpdates };