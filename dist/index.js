'use strict';

var Promise = require('bluebird');
var initialize = require('./initialize');
var lookForUpdates = require('./lookForUpdates');

/**
 * PUBLIC
 * Install a previously downloaded update that has not been installed. See documentation.
 * @return {Promise}
 */
function install() {
	var state = require('./shared/state');
	var _install = require('./install');
	var ccsConfig = state.get('ccs');
	if (!state.get('initialized')) {
		return Promise.reject(new Error('cordova-code-swap: .initialize() needs to be run before installing. It should be the first thing to be run in the application.'));
	}
	if (ccsConfig.pendingInstallation) {
		return _install(ccsConfig.pendingInstallation.updateInfo, ccsConfig.pendingInstallation.options);
	} else {
		return Promise.reject(new Error('cordova-code-swap: Tried to install update, but no updates have been previously downloaded.'));
	}
}

module.exports = { initialize: initialize, lookForUpdates: lookForUpdates, install: install };