/* eslint no-console: "off" */

const socketIO = require('socket.io-client');

function negotiateStartReloadService(debugConfig, lookForUpdates) {
	if (!debugConfig.reloadServer)
		return;

	let serverUrl = debugConfig.reloadServer;
	let onIframeUpdate = debugConfig.onIframeUpdate;

	var socket = socketIO(serverUrl);
	socket.on('updateCCS', () => {
		console.log('cordova-code-swap: looking for updates on ' + serverUrl);
		lookForUpdates(serverUrl)
			.then(download => {
				console.log('cordova-code-swap: found update', download.updateInfo);
				return download();
			})
			.then(install => {
				console.log('cordova-code-swap: finished downloading, installing...');
				return install();
			})
			.then(url => onIframeUpdate(url))
			.catch(err => console.log(err));
	});
}

module.exports = negotiateStartReloadService;
