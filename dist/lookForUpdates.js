'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var errors = require('./shared/errors');

/**
 * PUBLIC
 * Looks for updates on the server
 * @param  {String} url    	- Url to the update server
 * @param  {Object} options - Options to use when communicating with the server.
 * @return {Promise}		- Resolves with download function, rejects with error.
 */
module.exports = function (url) {
	var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	return new Promise(function (resolve, reject) {
		var state = require('./shared/state');
		var urlJoin = require('url-join');
		var request = require('./shared/request');
		var parseResponseToObject = require('./shared/parseResponseToObject');
		var compareWithCurrentVersion = require('./lookForUpdates/compareWithCurrentVersion');
		var getContentUrl = require('./lookForUpdates/getContentUrl');
		var defaultOptions = require('./shared/defaultOptions');
		var download = require('./download');

		if (!url) {
			reject(errors.create(errors.NO_URL));
		}

		if (!state.get('initialized')) {
			reject(errors.create(errors.NOT_INITIALIZED));
		}

		if (state.get('isLookingForUpdates')) {
			reject(errors.create(errors.LOOKFORUPDATES_IN_PROGRESS));
		}

		options = _extends({}, defaultOptions.update, options);
		var updateDeclaration = urlJoin(url, 'chcp.json?_=' + Date.now());
		state.set('isLookingForUpdates', true);

		request.get(updateDeclaration, { headers: options.headers, timeout: options.timeout }).then(parseResponseToObject).then(function (updateInfo) {
			// ensure release prop is a string
			updateInfo.release = updateInfo.release.toString();
			return updateInfo;
		}).then(function (updateInfo) {
			return compareWithCurrentVersion(state.get('ccs'), updateInfo);
		}).then(function (updateInfo) {
			updateInfo.content_url = getContentUrl(url, updateInfo);

			var downloadFunction = download.bind(null, updateInfo, options);
			downloadFunction.updateInfo = updateInfo;
			state.set('isLookingForUpdates', false);
			resolve(downloadFunction);
		}).catch(function (err) {
			state.set('isLookingForUpdates', false);
			reject(errors.create(errors.LOOKFORUPDATES_GENERAL, '', err));
		});
	});
};