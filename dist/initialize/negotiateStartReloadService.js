'use strict';

/* eslint no-console: "off" */

var socketIO = require('socket.io-client');

function negotiateStartReloadService(debugConfig, lookForUpdates) {
	if (!debugConfig.reloadServer) return;

	var serverUrl = debugConfig.reloadServer;
	var onIframeUpdate = debugConfig.onIframeUpdate;

	var socket = socketIO(serverUrl);
	socket.on('updateCCS', function () {
		console.log('cordova-code-swap: looking for updates on ' + serverUrl);
		lookForUpdates(serverUrl).then(function (download) {
			console.log('cordova-code-swap: found update', download.updateInfo);
			return download();
		}).then(function (install) {
			console.log('cordova-code-swap: finished downloading, installing...');
			return install();
		}).then(function (url) {
			return onIframeUpdate(url);
		}).catch(function (err) {
			return console.log(err);
		});
	});
}

module.exports = negotiateStartReloadService;