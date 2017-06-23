const Promise = require('bluebird');
const initialize = require('./initialize');
const lookForUpdates = require('./lookForUpdates');

/**
 * PUBLIC
 * Install a previously downloaded update that has not been installed. See documentation.
 * @return {Promise}
 */
function install() {
	const state = require('./shared/state');
	const _install = require('./install');
	const ccsConfig = state.get('ccs');
	if (!state.get('initialized')) {
		return Promise.reject(new Error('cordova-code-swap: .initialize() needs to be run before installing. It should be the first thing to be run in the application.'));
	}
	if (ccsConfig.pendingInstallation) {
		return _install(ccsConfig.pendingInstallation.updateInfo, ccsConfig.pendingInstallation.options);
	} else {
		return Promise.reject(new Error('cordova-code-swap: Tried to install update, but no updates have been previously downloaded.'));
	}
}

module.exports = { initialize, lookForUpdates, install };
