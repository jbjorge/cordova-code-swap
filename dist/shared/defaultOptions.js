'use strict';

exports.update = {
	entryFile: 'index.html',
	headers: {
		'User-Agent': 'Cordova-Code-Swap'
	},
	timeout: 30000
};

exports.instance = {
	backupCount: 1,
	iframe: false,
	debug: {
		reloadServer: '',
		onIframeUpdate: function onIframeUpdate() {},
		preserveBreakpoints: false
	}
};