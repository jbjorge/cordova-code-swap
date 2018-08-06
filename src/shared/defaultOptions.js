exports.update = {
	entryFile: 'index.html',
	headers: {
		'x-request-from': 'cordova-code-swap',
		'If-Modified-Since': 'Thu, 01 Jan 1970 00:00:01 GMT'
	},
	timeout: 30000
};

exports.instance = {
	backupCount: 1,
	iframe: false,
	debug: {
		reloadServer: '',
		onIframeUpdate: function(){},
		preserveBreakpoints: false
	}
};
