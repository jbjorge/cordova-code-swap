/**
 * Get the update - this function is returned in the resolved promise of lookForUpdates
 * @param  {Object} updateInfo	- The info received from the server
 * @param  {Object} options     - Options to use when communicating with the server.
 * @return {Promise}			- Resolves with install function, rejects with error
 */
module.exports = function(updateInfo, options, progressCallback) {
	return new Promise((resolve, reject) => {
		const urlJoin = require('url-join');
		const fetchFiles = require('./download/fetchFiles');
		const getCopyAndDownloadList = require('./download/getCopyAndDownloadList');
		const parseResponseToObject = require('./shared/parseResponseToObject');
		const request = require('./shared/request');
		const state = require('./shared/state');
		const ccsConfig = state.get('ccs');
		const instanceOptions = state.get('instanceOptions');
		const install = require('./install');

		if (state.get('isDownloading')) {
			reject(new Error('cordova-code-swap: A download is already in progress.'));
		}

		// make a local copy of updateInfo so it can be mutated
		let updateInfoClone = Object.assign({}, updateInfo);
		state.set('isDownloading', true);

		var contentUrl = updateInfoClone.content_url;
		var manifestUrl = urlJoin(contentUrl, 'chcp.manifest?_=' + Date.now());

		request.get(manifestUrl, { headers: options.headers, timeout: options.timeout })
			.then(parseResponseToObject)
			.then(serverManifest => {
				updateInfoClone.manifest = serverManifest;
				return getCopyAndDownloadList(ccsConfig.manifest, serverManifest);
			})
			.then(fetchList => fetchFiles(ccsConfig, fetchList, updateInfoClone, options, instanceOptions, progressCallback))
			.then(() => {
				ccsConfig.pendingInstallation = {};
				ccsConfig.pendingInstallation.updateInfo = updateInfoClone;
				ccsConfig.pendingInstallation.options = options;
				localStorage.ccs = JSON.stringify(ccsConfig);

				state.set('isDownloading', false);
				resolve(install.bind(null, updateInfoClone, options));
			})
			.catch(err => {
				ccsConfig.pendingInstallation = false;
				state.set('isDownloading', false);
				localStorage.ccs = JSON.stringify(ccsConfig);
				reject(err);
			});
	});
};
