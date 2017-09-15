exports.update = {
	entryFile: 'index.html',
	headers: {
		'x-request-from': 'cordova-code-swap'
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
