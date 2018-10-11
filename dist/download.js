'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var errors = require('./shared/errors');

/**
 * Get the update - this function is returned in the resolved promise of lookForUpdates
 * @param  {Object} updateInfo	- The info received from the server
 * @param  {Object} options     - Options to use when communicating with the server.
 * @return {Promise}			- Resolves with install function, rejects with error
 */
module.exports = function (updateInfo, options, progressCallback) {
	return new Promise(function (resolve, reject) {
		var urlJoin = require('url-join');
		var fetchFiles = require('./download/fetchFiles');
		var getCopyAndDownloadList = require('./download/getCopyAndDownloadList');
		var parseResponseToObject = require('./shared/parseResponseToObject');
		var request = require('./shared/request');
		var state = require('./shared/state');
		var ccsConfig = state.get('ccs');
		var instanceOptions = state.get('instanceOptions');
		var install = require('./install');

		if (state.get('isDownloading')) {
			reject(errors.create(errors.DOWNLOAD_IN_PROGRESS));
		}

		// make a local copy of updateInfo so it can be mutated
		var updateInfoClone = _extends({}, updateInfo);
		state.set('isDownloading', true);

		var contentUrl = updateInfoClone.content_url;
		var manifestUrl = urlJoin(contentUrl, 'chcp.manifest?_=' + Date.now());

		request.get(manifestUrl, { headers: options.headers, timeout: options.timeout }).then(parseResponseToObject).then(function (serverManifest) {
			updateInfoClone.manifest = serverManifest;
			return getCopyAndDownloadList(ccsConfig.manifest, serverManifest);
		}).then(function (fetchList) {
			return fetchFiles(ccsConfig, fetchList, updateInfoClone, options, instanceOptions, progressCallback);
		}).then(function () {
			ccsConfig.pendingInstallation = {};
			ccsConfig.pendingInstallation.updateInfo = updateInfoClone;
			ccsConfig.pendingInstallation.options = options;
			localStorage.ccs = JSON.stringify(ccsConfig);

			state.set('isDownloading', false);
			resolve(install.bind(null, updateInfoClone, options));
		}).catch(function (err) {
			ccsConfig.pendingInstallation = false;
			state.set('isDownloading', false);
			localStorage.ccs = JSON.stringify(ccsConfig);
			reject(errors.create(errors.DOWNLOAD_GENERAL, '', err));
		});
	});
};