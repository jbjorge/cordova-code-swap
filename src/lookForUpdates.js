/**
 * PUBLIC
 * Looks for updates on the server
 * @param  {String} url    	- Url to the update server
 * @param  {Object} options - Options to use when communicating with the server.
 * @return {Promise}		- Resolves with download function, rejects with error.
 */
module.exports = function(url, options = {}) {
	return new Promise((resolve, reject) => {
		const state = require('./state');
		const urlJoin = require('url-join');
		const request = require('./request');
		const parseResponseToObject = require('./parseResponseToObject');
		const compareWithCurrentVersion = require('./compareWithCurrentVersion');
		const getContentUrl = require('./getContentUrl');
		const defaultOptions = require('./defaultOptions');
		const download = require('./download');

		if (!state.get('initialized')) {
			reject(new Error('cordova-code-swap: .initialize() needs to be run before looking for updates. It should be the first thing to be run in the application.'));
		}

		if (state.get('isLookingForUpdates')) {
			reject(new Error('cordova-code-swap: .lookForUpdates is already running.'));
		}

		options = Object.assign({}, defaultOptions.update, options);
		const updateDeclaration = urlJoin(url, 'chcp.json');
		state.set('isLookingForUpdates', true);

		request.get(updateDeclaration, { headers: options.headers })
			.then(parseResponseToObject)
			.then(updateInfo => {
				// ensure release prop is a string
				updateInfo.release = updateInfo.release.toString();
				return updateInfo;
			})
			.then(updateInfo => compareWithCurrentVersion(state.get('ccs'), updateInfo))
			.then(updateInfo => {
				updateInfo.content_url = getContentUrl(url, updateInfo);

				var downloadFunction = download.bind(null, updateInfo, options);
				downloadFunction.updateInfo = updateInfo;
				state.set('isLookingForUpdates', false);
				resolve(downloadFunction);
			})
			.catch(err => {
				state.set('isLookingForUpdates', false);
				reject(err);
			});
	});
};
