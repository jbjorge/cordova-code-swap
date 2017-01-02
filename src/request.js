const Promise = require('bluebird');

function get(url, headers = {}) {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		
		for (let headerName in headers) {
			xhr.setRequestHeader(headerName, headers[headerName]);
		}

		xhr.onload = function() {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					resolve(xhr.responseText);
				} else {
					reject(xhr.statusText);
				}
			}
		};
		xhr.onerror = function() {
			reject(xhr.statusText);
		};
		xhr.send(null);
	});
}

module.exports = { get };
