const errors = require('./shared/errors');

/**
 * PUBLIC
 * Looks for updates on the server
 * @param  {String} url    	- Url to the update server
 * @param  {Object} options - Options to use when communicating with the server.
 * @return {Promise}		- Resolves with download function, rejects with error.
 */
module.exports = function(url, options = {}) {
	return new Promise((resolve, reject) => {
		const state = require('./shared/state');
		const urlJoin = require('url-join');
		const request = require('./shared/request');
		const parseResponseToObject = require('./shared/parseResponseToObject');
		const compareWithCurrentVersion = require('./lookForUpdates/compareWithCurrentVersion');
		const getContentUrl = require('./lookForUpdates/getContentUrl');
		const defaultOptions = require('./shared/defaultOptions');
		const download = require('./download');

		if (!url) {
			reject(errors.create(errors.NO_URL));
		}

		if (!state.get('initialized')) {
			reject(errors.create(errors.NOT_INITIALIZED));
		}

		if (state.get('isLookingForUpdates')) {
			reject(errors.create(errors.LOOKFORUPDATES_IN_PROGRESS));
		}

		options = Object.assign({}, defaultOptions.update, options);
		const updateDeclaration = urlJoin(url, 'chcp.json?_=' + Date.now());
		state.set('isLookingForUpdates', true);

		request.get(updateDeclaration, { headers: options.headers, timeout: options.timeout })
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
				reject(errors.create(errors.LOOKFORUPDATES_GENERAL, null, err));
			});
	});
};
