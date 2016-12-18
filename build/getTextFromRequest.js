"use strict";

function getTextFromRequest(request) {
	return JSON.parse(request.text);
}

module.exports = getTextFromRequest;