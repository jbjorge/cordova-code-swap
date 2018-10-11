const Promise = require('bluebird');
const initialize = require('./initialize');
const lookForUpdates = require('./lookForUpdates');
const errors = require('./shared/errors');

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
		return Promise.reject(errors.create(errors.NOT_INITIALIZED));
	}
	if (ccsConfig.pendingInstallation) {
		return _install(ccsConfig.pendingInstallation.updateInfo, ccsConfig.pendingInstallation.options);
	} else {
		return Promise.reject(errors.create(errors.NO_PENDING_INSTALL));
	}
}

module.exports = { initialize, lookForUpdates, install, errors };
