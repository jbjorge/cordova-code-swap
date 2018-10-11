const Promise = require('bluebird');
const errors = require('./errors');

function get(url, options = {}) {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		const nonCachingUrl = url + '?_=' + new Date().getTime();
		xhr.open('GET', nonCachingUrl, true);
		xhr.timeout = options.timeout;

		for (let headerName in options.headers) {
			xhr.setRequestHeader(headerName, options.headers[headerName]);
		}

		xhr.onload = function() {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					resolve(xhr.responseText);
				} else {
					reject(errors.create(errors.FILE_DOWNLOAD, `Failed when fetching ${url}. The server responded with "${xhr.statusText}".`));
				}
			}
		};
		xhr.onerror = function() {
			reject(errors.create(errors.FILE_DOWNLOAD, `Failed when fetching ${url}. The server responded with "${xhr.statusText}".`));
		};
		xhr.ontimeout = function() {
			reject(errors.create(errors.FILE_DOWNLOAD_TIMEOUT, `Failed when fetching ${url}. Got no response within the timeout of ${options.timeout/1000} seconds`));
		};
		xhr.send(null);
	});
}

module.exports = { get };
