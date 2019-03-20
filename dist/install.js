'use strict';

var errors = require('./shared/errors');

/**
 * Install the update - this function is returned in the resolved promise of _download
 * @param  {Object} updateInfo 	- The info received from the server
 * @param  {Object} options    	- Name of the entry point when redirecting to this update
 * @return {Promise}
 */
module.exports = function (updateInfo, options) {
	return new Promise(function (resolve, reject) {
		var updateCCSConfig = require('./install/updateCCSConfig');
		var deleteBackups = require('./install/deleteBackups');
		var state = require('./shared/state');
		var instanceOptions = state.get('instanceOptions');
		var initialize = require('./initialize');
		var sort = require('./shared/sort');
		var ccsConfig = state.get('ccs');

		if (state.get('isInstalling')) {
			reject(errors.create(errors.INSTALL_IN_PROGRESS));
		} else {
			state.set('isInstalling', true);
		}

		// create new config with settings needed to load the newly installed version
		ccsConfig = state.set('ccs', updateCCSConfig(ccsConfig, updateInfo, options, instanceOptions));

		// find obsolete backups
		var sortedBackups = sort.descending(ccsConfig.backups, 'timestamp');
		var backupsToDelete = sortedBackups.slice(instanceOptions.backupCount, sortedBackups.length).filter(function (backup) {
			return backup.release !== ccsConfig.release;
		});

		// update the current the backup list
		ccsConfig.backups = sortedBackups.slice(0, instanceOptions.backupCount).filter(function (backup) {
			return backup.release !== ccsConfig.release;
		});

		Promise.resolve().then(function () {
			return instanceOptions.debug.preserveBreakpoints ? null : deleteBackups(backupsToDelete);
		}).then(function () {
			localStorage.ccs = JSON.stringify(ccsConfig);
		}).then(function () {
			return state.set('isInstalling', false);
		}, function (err) {
			state.set('isInstalling', false);
			throw err;
		}).then(function () {
			if (instanceOptions.debug.preserveBreakpoints && !instanceOptions.iframe) {
				window.location.reload();
			} else {
				resolve(initialize(instanceOptions));
			}
		}).catch(function (err) {
			return reject(errors.create(errors.INSTALL_GENERAL, '', err));
		});
	});
};