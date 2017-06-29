'use strict';

exports.update = {
	entryFile: 'index.html',
	headers: {
		'User-Agent': 'Cordova-Code-Swap'
	}
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