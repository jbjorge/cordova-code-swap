'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var request = require('./request');
var Promise = require('bluebird');
var fetchFiles = require('./fetchFiles');
var getCopyAndDownloadList = require('./getCopyAndDownloadList');
var compareWithCurrentVersion = require('./compareWithCurrentVersion');
var parseResponseToObject = require('./parseResponseToObject');
var urlJoin = require('url-join');
var sanitizeFolder = require('filenamify');
var getContentUrl = require('./getContentUrl');
var initialized = false;
var ccs = JSON.parse(localStorage.ccs || JSON.stringify({}));
var defaultOptions = {
	entryFile: 'index.html',
	headers: {
		'User-Agent': 'Cordova-Code-Swap'
	}
};

/**
 * PUBLIC
 * Initialize the CCS instance
 * Switches to the last downloaded update if any
 * @return {Promise}
 */
function initialize() {
	if (ccs.entryPoint && ccs.entryPoint !== window.location.href) {
		window.location.href = ccs.entryPoint;
	}
	initialized = true;
	return Promise.resolve();
}

/**
 * PUBLIC
 * Looks for updates on the server
 * @param  {String} url     Url to the update server
 * @param  {Object} options Options to use when communicating with the server. See https://www.npmjs.com/package/request
 * @return {Promise}		Resolves with download function, rejects with error.
 */
function lookForUpdates(url) {
	var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	if (!initialized) {
		return Promise.reject(new Error('cordova-code-swap: .initialize() needs to be run before looking for updates. It should be the first thing to be run in the application.'));
	}

	options = _extends({}, defaultOptions, options);
	var updateDeclaration = urlJoin(url, 'chcp.json');

	return request.get(updateDeclaration, { headers: options.headers }).then(parseResponseToObject).then(function (updateInfo) {
		return compareWithCurrentVersion(ccs, updateInfo);
	}).then(function (updateInfo) {
		updateInfo.content_url = getContentUrl(url, updateInfo);
		var downloadFunction = _download.bind(null, updateInfo, options);
		downloadFunction.updateInfo = updateInfo;
		return downloadFunction;
	});
}

/**
 * Get the update - this function is returned in the resolved promise of lookForUpdates
 * @param  {Object} updateInfo	The info received from the server
 * @param  {Object} options     Options to use when communicating with the server. See https://www.npmjs.com/package/request
 * @return {Promise}			Resolves with install function, rejects with error
 */
function _download(updateInfo, options, progressCallback) {
	var contentUrl = updateInfo.content_url;
	var manifestUrl = urlJoin(contentUrl, 'chcp.manifest');
	return request.get(manifestUrl, { headers: options.headers }).then(parseResponseToObject).then(function (manifest) {
		return getCopyAndDownloadList(ccs, manifest);
	}).then(function (fetchList) {
		return fetchFiles(ccs, fetchList, updateInfo, options, progressCallback);
	}).then(function () {
		ccs.pendingInstallation = {};
		ccs.pendingInstallation.updateInfo = updateInfo;
		ccs.pendingInstallation.options = options;
		localStorage.ccs = JSON.stringify(ccs);
	}).then(function () {
		return _install.bind(null, updateInfo, options);
	}).catch(function (err) {
		ccs.pendingInstallation = false;
		localStorage.ccs = JSON.stringify(ccs);
		throw err;
	});
}

/**
 * Install the update - this function is returned in the resolved promise of _download
 * @param  {Object} updateInfo The info received from the server
 * @param  {Object} options    Name of the entry point when redirecting to this update
 * @return {Promise}
 */
function _install(updateInfo, options) {
	ccs.pendingInstallation = false;
	ccs.version = updateInfo.release;
	ccs.entryPoint = cordova.file.dataDirectory + sanitizeFolder(ccs.version) + '/' + options.entryFile;
	localStorage.ccs = JSON.stringify(ccs);
	window.location.href = ccs.entryPoint;
	return Promise.resolve();
}

/**
 * PUBLIC
 * Install a previously downloaded update that has not been installed. See documentation.
 * @return {Promise}
 */
function install() {
	if (ccs.pendingInstallation) {
		return _install(ccs.pendingInstallation.updateInfo, ccs.pendingInstallation.options);
	} else {
		return Promise.reject(new Error('cordova-code-swap: Tried to install update, but no updates have been previously downloaded.'));
	}
}

module.exports = { initialize: initialize, lookForUpdates: lookForUpdates, install: install };