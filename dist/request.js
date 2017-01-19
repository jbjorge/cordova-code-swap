'use strict';

var Promise = require('bluebird');

function get(url) {
	var headers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	return new Promise(function (resolve, reject) {
		var xhr = new XMLHttpRequest();
		var nonCachingUrl = url + '?_=' + new Date().getTime();
		xhr.open('GET', nonCachingUrl, true);

		for (var headerName in headers) {
			xhr.setRequestHeader(headerName, headers[headerName]);
		}

		xhr.onload = function () {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					resolve(xhr.responseText);
				} else {
					reject(new Error('cordova-code-swap: Failed when fetching ' + url + '. The server responded with "' + xhr.statusText + '".'));
				}
			}
		};
		xhr.onerror = function () {
			reject(new Error('cordova-code-swap: Failed when fetching ' + url + '. The server responded with "' + xhr.statusText + '".'));
		};
		xhr.send(null);
	});
}

module.exports = { get: get };