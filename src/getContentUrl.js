const urlJoin = require('url-join');

function getContentUrl(serverUrl, updateInfo) {
	if (updateInfo.content_url.match(/^http:\/\/|^https:\/\//))
		return updateInfo.content_url;
	return urlJoin(serverUrl, updateInfo.content_url);
}

module.exports = getContentUrl;