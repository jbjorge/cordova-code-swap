function configureUrl(url) {
	let formattedUrl = url;
	
	if (!url.match(/^http:\/\/|^https:\/\//)) {
		formattedUrl = 'http://' + formattedUrl;
	}
	if (!url.match(/^(?:http:\/\/|https:\/\/).+(\:\d*)(?!.*@)/)) {
		let hostnameMatches = formattedUrl.match(/\/\/(.*)\/|\/\/(.*)/);
		let hostname = hostnameMatches[1] || hostnameMatches[2];
		formattedUrl = formattedUrl.replace(hostname, hostname + ':9555');
	}

	return formattedUrl;
}

module.exports = configureUrl;