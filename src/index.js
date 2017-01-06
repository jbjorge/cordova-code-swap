const request = require('./request');
const Promise = require('bluebird');
const fetchFiles = require('./fetchFiles');
const getCopyAndDownloadList = require('./getCopyAndDownloadList');
const compareWithCurrentVersion = require('./compareWithCurrentVersion');
const parseResponseToObject = require('./parseResponseToObject');
const urlJoin = require('url-join');
const sanitizeFolder = require('filenamify');
const getContentUrl = require('./getContentUrl');
var initialized = false;
const ccs = JSON.parse(localStorage.ccs || JSON.stringify({}));
const defaultOptions = {
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
function _download(updateInfo, options, progressCallback) {
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
		.then(fetchList => fetchFiles(ccs, fetchList, updateInfoClone, options, progressCallback))
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
	ccs.pendingInstallation = false;
	ccs.version = updateInfo.release;
	ccs.manifest = updateInfo.manifest;
	ccs.entryPoint = cordova.file.dataDirectory + sanitizeFolder(ccs.version) + '/' + options.entryFile;
	localStorage.ccs = JSON.stringify(ccs);
	return initialize();
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
