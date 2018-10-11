'use strict';

var Promise = require('bluebird');
var initialize = require('./initialize');
var lookForUpdates = require('./lookForUpdates');
var errors = require('./shared/errors');

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
		return Promise.reject(errors.create(errors.NOT_INITIALIZED));
	}
	if (ccsConfig.pendingInstallation) {
		return _install(ccsConfig.pendingInstallation.updateInfo, ccsConfig.pendingInstallation.options);
	} else {
		return Promise.reject(errors.create(errors.NO_PENDING_INSTALL));
	}
}

module.exports = { initialize: initialize, lookForUpdates: lookForUpdates, install: install, errors: errors };