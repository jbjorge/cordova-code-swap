/* eslint no-console: "off" */

const createManifest = require('./createManifest');
const watcher = require('glob-watcher');
const createCHCP = require('./createCHCP');
const createWebSocketServer = require('./createWebSocketServer');
const configureUrl = require('./configureUrl');
const chalk = require('chalk');

function createCCSFiles(inputGlob, outputFolder, options = {}) {
	if (options.dev) {
		const devConfig = Object.assign({}, options.config, { content_url: configureUrl(options.dev) });
		const inputGlobWithIgnores = inputGlob.concat(['!**/chcp.{json,manifest}', '!chcp.{json,manifest}']);
		return createWebSocketServer(devConfig.content_url, outputFolder)
			.then(socketServer => {
				watcher(
					inputGlobWithIgnores, { ignoreInitial: false, events: 'all' },
					() => createManifest(inputGlob, outputFolder, options.replace)
					.then(() => createCHCP(outputFolder, devConfig))
					.then(() => {
						if (options.autoUpdate) {
							console.log(chalk.gray('Telling app to look for updates and install.'));
							socketServer.emit('updateCCS');
						}
					})
					.then(() => {
						if (typeof options.onUpdate == 'function') {
							options.onUpdate(createUpdateEmitter(socketServer));
						}
					})
				);
				return createUpdateEmitter(socketServer);
			});
	}
	return createManifest(inputGlob, outputFolder, options.replace)
		.then(() => createCHCP(outputFolder, options.config));
}

function createUpdateEmitter(socketServer) {
	return function(){
		console.log(chalk.gray('Telling app to look for updates and install.'));
		socketServer.emit('updateCCS');
	};
}

module.exports = createCCSFiles;
