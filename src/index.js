const request = require('./request');
const Promise = require('bluebird');
const fetchFiles = require('./fetchFiles');
const getCopyAndDownloadList = require('./getCopyAndDownloadList');
const compareWithCurrentVersion = require('./compareWithCurrentVersion');
const parseResponseToObject = require('./parseResponseToObject');
const urlJoin = require('url-join');
const updateCCSConfig = require('./updateCCSConfig');
const getContentUrl = require('./getContentUrl');
const defaultOptions = require('./defaultOptions');
const negotiateStartReloadService = require('./negotiateStartReloadService');
var initialized = false;
var ccs = JSON.parse(localStorage.ccs || JSON.stringify({}));
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
function initialize(instanceOptions = {}) {
	return new Promise((resolve) => {
		if (!initialized) {
			_instanceOptions = Object.assign({}, defaultOptions.instance, instanceOptions);
			initialized = true;
			negotiateStartReloadService(_instanceOptions.debug, lookForUpdates);
		}

		if (ccs.entryPoint) {
			if (_instanceOptions.iframe) {
				resolve(ccs.entryPoint);
			} else if (ccs.entryPoint !== window.location.href) {
				window.location.href = ccs.entryPoint;
			} else {
				resolve();
			}
		} else {
			resolve();
		}
	});
}

/**
 * PUBLIC
 * Looks for updates on the server
 * @param  {String} url    	- Url to the update server
 * @param  {Object} options - Options to use when communicating with the server.
 * @return {Promise}		- Resolves with download function, rejects with error.
 */
function lookForUpdates(url, options = {}) {
	if (!initialized) {
		return Promise.reject(new Error('cordova-code-swap: .initialize() needs to be run before looking for updates. It should be the first thing to be run in the application.'));
	}

	if (isLookingForUpdates) {
		return Promise.reject(new Error('cordova-code-swap: .lookForUpdates is already running.'));
	}

	options = Object.assign({}, defaultOptions.update, options);
	const updateDeclaration = urlJoin(url, 'chcp.json');
	isLookingForUpdates = true;

	return request.get(updateDeclaration, { headers: options.headers })
		.then(parseResponseToObject)
		.then(updateInfo => compareWithCurrentVersion(ccs, updateInfo))
		.then(updateInfo => {
			updateInfo.content_url = getContentUrl(url, updateInfo);
			var downloadFunction = _download.bind(null, updateInfo, options);
			downloadFunction.updateInfo = updateInfo;
			isLookingForUpdates = false;
			return downloadFunction;
		})
		.catch(err => {
			isLookingForUpdates = false;
			throw err;
		});
}

/**
 * Get the update - this function is returned in the resolved promise of lookForUpdates
 * @param  {Object} updateInfo	- The info received from the server
 * @param  {Object} options     - Options to use when communicating with the server.
 * @return {Promise}			- Resolves with install function, rejects with error
 */
function _download(updateInfo, options) {
	if (isDownloading) {
		throw new Error('cordova-code-swap: A download is already in progress.');
	}

	// make a local copy of updateInfo so it can be mutated
	let updateInfoClone = Object.assign({}, updateInfo);
	isDownloading = true;

	var contentUrl = updateInfoClone.content_url;
	var manifestUrl = urlJoin(contentUrl, 'chcp.manifest');
	return request.get(manifestUrl, { headers: options.headers })
		.then(parseResponseToObject)
		.then(serverManifest => {
			updateInfoClone.manifest = serverManifest;
			return getCopyAndDownloadList(ccs.manifest, serverManifest);
		})
		.then(fetchList => fetchFiles(ccs, fetchList, updateInfoClone, options, _instanceOptions))
		.then(() => {
			ccs.pendingInstallation = {};
			ccs.pendingInstallation.updateInfo = updateInfoClone;
			ccs.pendingInstallation.options = options;
			localStorage.ccs = JSON.stringify(ccs);

			isDownloading = false;
			return _install.bind(null, updateInfoClone, options);
		})
		.catch(err => {
			ccs.pendingInstallation = false;
			isDownloading = false;
			localStorage.ccs = JSON.stringify(ccs);
			throw err;
		});
}

/**
 * Install the update - this function is returned in the resolved promise of _download
 * @param  {Object} updateInfo 	- The info received from the server
 * @param  {Object} options    	- Name of the entry point when redirecting to this update
 * @return {Promise}
 */
function _install(updateInfo, options) {
	if (isInstalling) {
		Promise.reject('cordova-code-swap: An installation is already in progress');
	}
	const deleteBackups = require('./deleteBackups');
	isInstalling = true;

	// create new config with settings needed to load the newly installed version
	ccs = updateCCSConfig(ccs, updateInfo, options, _instanceOptions);

	// find obsolete backups
	let sortedBackups = ccs.backups.sort((b1, b2) => b1.timestamp || 0 < b2.timestamp || 0);
	let backupsToDelete = sortedBackups.slice(_instanceOptions.backupCount, sortedBackups.length);

	// update the current the backup list
	ccs.backups = sortedBackups.slice(0, _instanceOptions.backupCount);

	return Promise.resolve()
		.then(() => _instanceOptions.debug.preserveBreakpoints ? null : deleteBackups(backupsToDelete))
		.then(() => { localStorage.ccs = JSON.stringify(ccs); })
		.then(
			() => { isInstalling = false; },
			err => { isInstalling = false; throw err; }
		)
		.then(() => (_instanceOptions.debug.preserveBreakpoints && !_instanceOptions.iframe) ? new Promise(() => window.location.reload()) : initialize());
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

module.exports = { initialize, lookForUpdates, install };
