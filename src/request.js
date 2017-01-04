const Promise = require('bluebird');

function get(url, headers = {}) {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		const nonCachingUrl = url + '?_=' + new Date().getTime();
		xhr.open('GET', nonCachingUrl, true);
		
		for (let headerName in headers) {
			xhr.setRequestHeader(headerName, headers[headerName]);
		}

		xhr.onload = function() {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					resolve(xhr.responseText);
				} else {
					reject(new Error(`cordova-code-swap: Failed when fetching ${url}. The server responded with "${xhr.statusText}".`));
				}
			}
		};
		xhr.onerror = function() {
			reject(new Error(`cordova-code-swap: Failed when fetching ${url}. The server responded with "${xhr.statusText}".`));
		};
		xhr.send(null);
	});
}

module.exports = { get };
