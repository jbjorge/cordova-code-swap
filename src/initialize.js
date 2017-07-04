const Promise = require('bluebird');
/**
 * PUBLIC
 * Initialize the CCS instance
 * @param {Object} instanceOptions - Options to use for the instance.
 * @return {Promise}
 */
module.exports = (instanceOptions = {}) => {
	return new Promise((resolve) => {
		const state = require('./shared/state');
		const negotiateStartReloadService = require('./initialize/negotiateStartReloadService');
		const defaultOptions = require('./shared/defaultOptions');
		const lookForUpdates = require('./lookForUpdates');
		const ccsConfig = state.get('ccs');
		const isInitialized = state.get('initialized');

		if (!isInitialized) {
			instanceOptions = state.set('instanceOptions', Object.assign({}, defaultOptions.instance, instanceOptions));
			state.set('initialized', true);
			negotiateStartReloadService(instanceOptions.debug, lookForUpdates);
		}

		if (ccsConfig.entryPoint) {
			if (instanceOptions.iframe) {
				resolve(ccsConfig.entryPoint);
			} else if (ccsConfig.entryPoint !== window.location.href) {
				window.location.href = ccsConfig.entryPoint;
			} else {
				resolve();
			}
		} else {
			resolve();
		}
	})
	.timeout(5000, 'cordova-code-swap: .initialize() failed to run.');
};
