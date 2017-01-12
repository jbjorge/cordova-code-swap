const request = require('./request');
const Promise = require('bluebird');
const fetchFiles = require('./fetchFiles');
const getCopyAndDownloadList = require('./getCopyAndDownloadList');
const compareWithCurrentVersion = require('./compareWithCurrentVersion');
const parseResponseToObject = require('./parseResponseToObject');
const urlJoin = require('url-join');
const updateCCSConfig = require('./updateCCSConfig');
const getContentUrl = require('./getContentUrl');
var initialized = false;
var ccs = JSON.parse(localStorage.ccs || JSON.stringify({}));
var _instanceOptions;
const defaultOptions = {
	entryFile: 'index.html',
	headers: {
		'User-Agent': 'Cordova-Code-Swap'
	},
	debug: false
};

/**
 * PUBLIC
 * Initialize the CCS instance
 * Switches to the last downloaded update if any
 * @return {Promise}
 */
function initialize(instanceOptions = {}) {
	if (!initialized) {
		_instanceOptions = Object.assign({}, { backupCount: 1, iframe: false }, instanceOptions);
		initialized = true;
	}

	if (ccs.entryPoint) {
		if (_instanceOptions.iframe) {
			return Promise.resolve(ccs.entryPoint);
		}
		else if (ccs.entryPoint !== window.location.href){
			window.location.href = ccs.entryPoint;
		}
	}
	return Promise.resolve();
}

/**
 * PUBLIC
 * Looks for updates on the server
 * @param  {String} url     Url to the update server
 * @param  {Object} options Options to use when communicating with the server. See https://www.npmjs.com/package/request
 * @return {Promise}		Resolves with download function, rejects with error.
 */
function lookForUpdates(url, options = {}) {
	if (!initialized) {
		return Promise.reject(new Error('cordova-code-swap: .initialize() needs to be run before looking for updates. It should be the first thing to be run in the application.'));
	}

	options = Object.assign({}, defaultOptions, options);
	const updateDeclaration = urlJoin(url, 'chcp.json');

	return request.get(updateDeclaration, { headers: options.headers })
		.then(parseResponseToObject)
		.then(updateInfo => compareWithCurrentVersion(ccs, updateInfo))
		.then(updateInfo => {
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
function _download(updateInfo, options) {
	// make a local copy of updateInfo so it can be mutated
	let updateInfoClone = Object.assign({}, updateInfo);

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
		})
		.then(() => {
			return _install.bind(null, updateInfoClone, options);
		})
		.catch(err => {
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
	const deleteBackups = require('./deleteBackups');

	// create new config with settings needed to load the newly installed version
	ccs = updateCCSConfig(ccs, updateInfo, options);

	// find obsolete backups
	let sortedBackups = ccs.backups.sort((b1, b2) => b1.timestamp || 0 < b2.timestamp || 0);
	let backupsToDelete = sortedBackups.slice(_instanceOptions.backupCount, sortedBackups.length);
	
	// update the current the backup list
	ccs.backups = sortedBackups.slice(0, _instanceOptions.backupCount);

	return Promise.resolve()
		.then(() => options.debug ? null : deleteBackups(backupsToDelete))
		.then(() => { localStorage.ccs = JSON.stringify(ccs); })
		.then(() => options.debug ? window.location.reload() : initialize());
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
