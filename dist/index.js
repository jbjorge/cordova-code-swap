'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var Promise = require('bluebird');
var _initialized = false;
var _ccs;
var _instanceOptions;
var isLookingForUpdates = false;
var isDownloading = false;
var isInstalling = false;

/**
 * PUBLIC
 * Initialize the CCS instance
 * @param {Object} instanceOptions - Options to use for the instance.
 * @return {Promise}
 */
function initialize() {
	var instanceOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	return new Promise(function (resolve) {
		var negotiateStartReloadService = require('./negotiateStartReloadService');
		var defaultOptions = require('./defaultOptions');

		// fetch ccs config from localStorage if not fetched before
		_ccs = _ccs || JSON.parse(localStorage.ccs || JSON.stringify({}));

		if (!_initialized) {
			_instanceOptions = _extends({}, defaultOptions.instance, instanceOptions);
			_initialized = true;
			negotiateStartReloadService(_instanceOptions.debug, lookForUpdates);
		}

		if (_ccs.entryPoint) {
			if (_instanceOptions.iframe) {
				resolve(_ccs.entryPoint);
			} else if (_ccs.entryPoint !== window.location.href) {
				window.location.href = _ccs.entryPoint;
			} else {
				resolve();
			}
		} else {
			resolve();
		}
	}).timeout(5000, 'cordova-code-swap: .initialize() failed to run.');
}

/**
 * PUBLIC
 * Looks for updates on the server
 * @param  {String} url    	- Url to the update server
 * @param  {Object} options - Options to use when communicating with the server.
 * @return {Promise}		- Resolves with download function, rejects with error.
 */
function lookForUpdates(url) {
	var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	return new Promise(function (resolve, reject) {
		var urlJoin = require('url-join');
		var request = require('./request');
		var parseResponseToObject = require('./parseResponseToObject');
		var compareWithCurrentVersion = require('./compareWithCurrentVersion');
		var getContentUrl = require('./getContentUrl');
		var defaultOptions = require('./defaultOptions');

		if (!_initialized) {
			reject(new Error('cordova-code-swap: .initialize() needs to be run before looking for updates. It should be the first thing to be run in the application.'));
		}

		if (isLookingForUpdates) {
			reject(new Error('cordova-code-swap: .lookForUpdates is already running.'));
		}

		options = _extends({}, defaultOptions.update, options);
		var updateDeclaration = urlJoin(url, 'chcp.json');
		isLookingForUpdates = true;

		request.get(updateDeclaration, { headers: options.headers }).then(parseResponseToObject).then(function (updateInfo) {
			// ensure release prop is a string
			updateInfo.release = updateInfo.release.toString();
			return updateInfo;
		}).then(function (updateInfo) {
			return compareWithCurrentVersion(_ccs, updateInfo);
		}).then(function (updateInfo) {
			updateInfo.content_url = getContentUrl(url, updateInfo);

			var downloadFunction = _download.bind(null, updateInfo, options);
			downloadFunction.updateInfo = updateInfo;
			isLookingForUpdates = false;
			resolve(downloadFunction);
		}).catch(function (err) {
			isLookingForUpdates = false;
			reject(err);
		});
	});
}

/**
 * Get the update - this function is returned in the resolved promise of lookForUpdates
 * @param  {Object} updateInfo	- The info received from the server
 * @param  {Object} options     - Options to use when communicating with the server.
 * @return {Promise}			- Resolves with install function, rejects with error
 */
function _download(updateInfo, options) {
	return new Promise(function (resolve, reject) {
		var urlJoin = require('url-join');
		var fetchFiles = require('./fetchFiles');
		var getCopyAndDownloadList = require('./getCopyAndDownloadList');
		var parseResponseToObject = require('./parseResponseToObject');
		var request = require('./request');

		if (isDownloading) {
			reject(new Error('cordova-code-swap: A download is already in progress.'));
		}

		// make a local copy of updateInfo so it can be mutated
		var updateInfoClone = _extends({}, updateInfo);
		isDownloading = true;

		var contentUrl = updateInfoClone.content_url;
		var manifestUrl = urlJoin(contentUrl, 'chcp.manifest');

		request.get(manifestUrl, { headers: options.headers }).then(parseResponseToObject).then(function (serverManifest) {
			updateInfoClone.manifest = serverManifest;
			return getCopyAndDownloadList(_ccs.manifest, serverManifest);
		}).then(function (fetchList) {
			return fetchFiles(_ccs, fetchList, updateInfoClone, options, _instanceOptions);
		}).then(function () {
			_ccs.pendingInstallation = {};
			_ccs.pendingInstallation.updateInfo = updateInfoClone;
			_ccs.pendingInstallation.options = options;
			localStorage.ccs = JSON.stringify(_ccs);

			isDownloading = false;
			resolve(_install.bind(null, updateInfoClone, options));
		}).catch(function (err) {
			_ccs.pendingInstallation = false;
			isDownloading = false;
			localStorage.ccs = JSON.stringify(_ccs);
			reject(err);
		});
	});
}

/**
 * Install the update - this function is returned in the resolved promise of _download
 * @param  {Object} updateInfo 	- The info received from the server
 * @param  {Object} options    	- Name of the entry point when redirecting to this update
 * @return {Promise}
 */
function _install(updateInfo, options) {
	return new Promise(function (resolve, reject) {
		var updateCCSConfig = require('./updateCCSConfig');
		var deleteBackups = require('./deleteBackups');

		if (isInstalling) {
			reject('cordova-code-swap: An installation is already in progress');
		} else {
			isInstalling = true;
		}

		// create new config with settings needed to load the newly installed version
		_ccs = updateCCSConfig(_ccs, updateInfo, options, _instanceOptions);

		// find obsolete backups
		var sortedBackups = _ccs.backups.sort(function (b1, b2) {
			return b1.timestamp || 0 < b2.timestamp || 0;
		});
		var backupsToDelete = sortedBackups.slice(_instanceOptions.backupCount, sortedBackups.length);

		// update the current the backup list
		_ccs.backups = sortedBackups.slice(0, _instanceOptions.backupCount);

		Promise.resolve().then(function () {
			return _instanceOptions.debug.preserveBreakpoints ? null : deleteBackups(backupsToDelete);
		}).then(function () {
			localStorage.ccs = JSON.stringify(_ccs);
		}).then(function () {
			isInstalling = false;
		}, function (err) {
			isInstalling = false;
			throw err;
		}).then(function () {
			if (_instanceOptions.debug.preserveBreakpoints && !_instanceOptions.iframe) {
				window.location.reload();
			} else {
				resolve(initialize());
			}
		}).catch(function (err) {
			return reject(err);
		});
	});
}

/**
 * PUBLIC
 * Install a previously downloaded update that has not been installed. See documentation.
 * @return {Promise}
 */
function install() {
	if (!_initialized) {
		return Promise.reject(new Error('cordova-code-swap: .initialize() needs to be run before installing. It should be the first thing to be run in the application.'));
	}
	if (_ccs.pendingInstallation) {
		return _install(_ccs.pendingInstallation.updateInfo, _ccs.pendingInstallation.options);
	} else {
		return Promise.reject(new Error('cordova-code-swap: Tried to install update, but no updates have been previously downloaded.'));
	}
}

module.exports = { initialize: initialize, lookForUpdates: lookForUpdates, install: install };