/**
 * Install the update - this function is returned in the resolved promise of _download
 * @param  {Object} updateInfo 	- The info received from the server
 * @param  {Object} options    	- Name of the entry point when redirecting to this update
 * @return {Promise}
 */
module.exports = function(updateInfo, options) {
	return new Promise((resolve, reject) => {
		const updateCCSConfig = require('./updateCCSConfig');
		const deleteBackups = require('./deleteBackups');
		const state = require('./state');
		const ccsConfig = state.get('ccs');
		const instanceOptions = state.get('instanceOptions');
		const initialize = require('./initialize');
		
		if (state.get('isInstalling')) {
			reject('cordova-code-swap: An installation is already in progress');
		} else {
			state.set('isInstalling', true);
		}

		// create new config with settings needed to load the newly installed version
		state.set('ccs', updateCCSConfig(ccsConfig, updateInfo, options, instanceOptions));

		// find obsolete backups
		let sortedBackups = ccsConfig.backups.sort((b1, b2) => b1.timestamp || 0 < b2.timestamp || 0);
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
					resolve(initialize());
				}
			})
			.catch(err => reject(err));
	});
}