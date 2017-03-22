"use strict";

function parseResponseToObject(response) {
	var parsed = JSON.parse(response);
	parsed.release = parsed.release.toString();
	return parsed;
}

module.exports = parseResponseToObject;