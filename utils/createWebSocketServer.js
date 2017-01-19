/* eslint no-console: "off" */

const Promise = require('bluebird');
const path = require('path');
const chalk = require('chalk');
const url = require('url');

function createWebSocketServer(contentUrl, outputFolder) {
	const express = require('express');
	const app = express();
	const http = require('http').Server(app);
	const io = require('socket.io')(http);
	const port = url.parse(contentUrl).port;
	const assetsFolder = path.resolve(outputFolder);

	app.use(express.static(assetsFolder));

	io.on('connection', socket => {
		console.log(chalk.green('A user connected'));

		socket.on('disconnect', () => {
			console.log(chalk.yellow('A user disconnected'));
		});
	});

	return new Promise((resolve, reject) => {
		http.listen(port, err => {
			if (err) {
				return reject(err);
			}

			console.log(chalk.gray('Reload server is running on port', port));
			console.log(chalk.gray('Serving files from', assetsFolder));
			resolve(io);
		});
	});
}

module.exports = createWebSocketServer;
