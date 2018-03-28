/**
 * Install the update - this function is returned in the resolved promise of _download
 * @param  {Object} updateInfo 	- The info received from the server
 * @param  {Object} options    	- Name of the entry point when redirecting to this update
 * @return {Promise}
 */
module.exports = function(updateInfo, options) {
	return new Promise((resolve, reject) => {
		const updateCCSConfig = require('./install/updateCCSConfig');
		const deleteBackups = require('./install/deleteBackups');
		const state = require('./shared/state');
		const instanceOptions = state.get('instanceOptions');
		const initialize = require('./initialize');
		const sort = require('./shared/sort');
		let ccsConfig = state.get('ccs');

		if (state.get('isInstalling')) {
			reject('cordova-code-swap: An installation is already in progress');
		} else {
			state.set('isInstalling', true);
		}

		// create new config with settings needed to load the newly installed version
		ccsConfig = state.set('ccs', updateCCSConfig(ccsConfig, updateInfo, options, instanceOptions));

		// find obsolete backups
		let sortedBackups = sort.descending(ccsConfig.backups, 'timestamp');
		let backupsToDelete = sortedBackups.slice(instanceOptions.backupCount, sortedBackups.length);

		// update the current the backup list
		ccsConfig.backups = sortedBackups.slice(0, instanceOptions.backupCount);

		Promise.resolve()
			.then(() => instanceOptions.debug.preserveBreakpoints ? null : deleteBackups(backupsToDelete))
			.then(() => { localStorage.ccs = JSON.stringify(ccsConfig); })
			.then(
				() => state.set('isInstalling', false),
				err => {
					state.set('isInstalling', false);
					throw err;
				}
			)
			.then(() => {
				if (instanceOptions.debug.preserveBreakpoints && !instanceOptions.iframe) {
					window.location.reload();
				} else {
					resolve(initialize(instanceOptions));
				}
			})
			.catch(err => reject(err));
	});
};
