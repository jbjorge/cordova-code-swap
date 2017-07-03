'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var Promise = require('bluebird');
/**
 * PUBLIC
 * Initialize the CCS instance
 * @param {Object} instanceOptions - Options to use for the instance.
 * @return {Promise}
 */
module.exports = function () {
	var instanceOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	return new Promise(function (resolve) {
		var state = require('./shared/state');
		var negotiateStartReloadService = require('./initialize/negotiateStartReloadService');
		var defaultOptions = require('./shared/defaultOptions');
		var lookForUpdates = require('./lookForUpdates');
		var ccsConfig = state.get('ccs');
		var isInitialized = state.get('initialized');

		if (!isInitialized) {
			state.set('instanceOptions', _extends({}, defaultOptions.instance, instanceOptions));
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
	}).timeout(5000, 'cordova-code-swap: .initialize() failed to run.');
};