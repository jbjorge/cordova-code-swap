'use strict';

var urlJoin = require('url-join');

function getContentUrl(serverUrl, updateInfo) {
	if (updateInfo.content_url.match(/^http:\/\/|^https:\/\//).length > 0) return updateInfo.content_url;
	return urlJoin(serverUrl, updateInfo.content_url);
}

module.exports = getContentUrl;