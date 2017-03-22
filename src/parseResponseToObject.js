function parseResponseToObject(response) {
	const parsed = JSON.parse(response);
	parsed.release = parsed.release.toString();
	return parsed;
}

module.exports = parseResponseToObject;