'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var request = require('./request');
var Promise = require('bluebird');
var fetchFiles = require('./fetchFiles');
var getCopyAndDownloadList = require('./getCopyAndDownloadList');
var compareWithCurrentVersion = require('./compareWithCurrentVersion');
var parseResponseToObject = require('./parseResponseToObject');
var urlJoin = require('url-join');
var updateCCSConfig = require('./updateCCSConfig');
var getContentUrl = require('./getContentUrl');
var _initialized = false;
var _ccs;
var _instanceOptions;
var defaultOptions = {
	entryFile: 'index.html',
	headers: {
		'User-Agent': 'Cordova-Code-Swap'
	},
	debug: false
};
var isLookingForUpdates = false;
var isDownloading = false;
var isInstalling = false;

/**
 * PUBLIC
 * Initialize the CCS instance
 * Switches to the last downloaded update if any
 * @return {Promise}
 */
function initialize() {
	var instanceOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	return new Promise(function (resolve) {
		// fetch ccs config from localStorage if not fetched before
		_ccs = _ccs || JSON.parse(localStorage.ccs || JSON.stringify({}));

		if (!_initialized) {
			_instanceOptions = _extends({}, { backupCount: 1 }, instanceOptions);
			_initialized = true;
		}

		if (_ccs.entryPoint && _ccs.entryPoint !== window.location.href) {
			window.location.href = _ccs.entryPoint;
		} else {
			resolve();
		}
	});
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

	if (!_initialized) {
		return Promise.reject(new Error('cordova-code-swap: .initialize() needs to be run before looking for updates. It should be the first thing to be run in the application.'));
	}

	if (isLookingForUpdates) {
		return Promise.reject(new Error('cordova-code-swap: .lookForUpdates is already running.'));
	}

	options = _extends({}, defaultOptions, options);
	var updateDeclaration = urlJoin(url, 'chcp.json');
	isLookingForUpdates = true;

	return request.get(updateDeclaration, { headers: options.headers }).then(parseResponseToObject).then(function (updateInfo) {
		return compareWithCurrentVersion(_ccs, updateInfo);
	}).then(function (updateInfo) {
		updateInfo.content_url = getContentUrl(url, updateInfo);
		var downloadFunction = _download.bind(null, updateInfo, options);
		downloadFunction.updateInfo = updateInfo;
		isLookingForUpdates = false;
		return downloadFunction;
	}).catch(function (err) {
		isLookingForUpdates = false;
		throw err;
	});
}

/**
 * Get the update - this function is returned in the resolved promise of lookForUpdates
 * @param  {Object} updateInfo	The info received from the server
 * @param  {Object} options     Options to use when communicating with the server. See https://www.npmjs.com/package/request
 * @return {Promise}			Resolves with install function, rejects with error
 */
function _download(updateInfo, options, progressCallback) {
	if (isDownloading) {
		throw new Error('cordova-code-swap: A download is already in progress.');
	}

	// make a local copy of updateInfo so it can be mutated
	var updateInfoClone = _extends({}, updateInfo);
	isDownloading = true;

	var contentUrl = updateInfoClone.content_url;
	var manifestUrl = urlJoin(contentUrl, 'chcp.manifest');
	return request.get(manifestUrl, { headers: options.headers }).then(parseResponseToObject).then(function (serverManifest) {
		updateInfoClone.manifest = serverManifest;
		return getCopyAndDownloadList(_ccs.manifest, serverManifest);
	}).then(function (fetchList) {
		return fetchFiles(_ccs, fetchList, updateInfoClone, options, progressCallback);
	}).then(function () {
		_ccs.pendingInstallation = {};
		_ccs.pendingInstallation.updateInfo = updateInfoClone;
		_ccs.pendingInstallation.options = options;
		localStorage.ccs = JSON.stringify(_ccs);

		isDownloading = false;
		return _install.bind(null, updateInfoClone, options);
	}).catch(function (err) {
		_ccs.pendingInstallation = false;
		isDownloading = false;
		localStorage.ccs = JSON.stringify(_ccs);
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
	if (isInstalling) {
		Promise.reject('cordova-code-swap: An installation is already in progress');
	}
	var deleteBackups = require('./deleteBackups');
	isInstalling = true;

	// create new config with settings needed to load the newly installed version
	_ccs = updateCCSConfig(_ccs, updateInfo, options);

	// find obsolete backups
	var sortedBackups = _ccs.backups.sort(function (b1, b2) {
		return b1.timestamp || 0 < b2.timestamp || 0;
	});
	var backupsToDelete = sortedBackups.slice(_instanceOptions.backupCount, sortedBackups.length);

	// update the current the backup list
	_ccs.backups = sortedBackups.slice(0, _instanceOptions.backupCount);

	return Promise.resolve().then(function () {
		return options.debug ? null : deleteBackups(backupsToDelete);
	}).then(function () {
		localStorage.ccs = JSON.stringify(_ccs);
	}).then(function () {
		isInstalling = false;
	}, function (err) {
		isInstalling = false;throw err;
	}).then(function () {
		return options.debug ? new Promise(function () {
			return window.location.reload();
		}) : initialize();
	});
}

/**
 * PUBLIC
 * Install a previously downloaded update that has not been installed. See documentation.
 * @return {Promise}
 */
function install() {
	if (!_initialized) {
		return Promise.reject(new Error('cordova-code-swap: .initialize() needs to be run before looking for updates. It should be the first thing to be run in the application.'));
	}
	if (_ccs.pendingInstallation) {
		return _install(_ccs.pendingInstallation.updateInfo, _ccs.pendingInstallation.options);
	} else {
		return Promise.reject(new Error('cordova-code-swap: Tried to install update, but no updates have been previously downloaded.'));
	}
}

module.exports = { initialize: initialize, lookForUpdates: lookForUpdates, install: install };