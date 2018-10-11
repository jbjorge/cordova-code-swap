'use strict';

var Promise = require('bluebird');
var errors = require('../shared/errors');

/**
 * Compares the current version with the version received from the server
 * @param  {Object} ccs         The ccs info stored in localstorage
 * @param  {Object} updateInfo  The info received from the server
 * @return {Promise}         	Returns promise that resolves updateInfo if it differs from the current version
 */
function compareWithCurrentVersion(ccs, updateInfo) {
	return Promise.resolve().then(function () {
		return throwIfCurrentVersionIsNewest(ccs, updateInfo);
	}).then(function () {
		return throwIfPendingInstallVersionIsSame(ccs, updateInfo);
	}).then(function () {
		return updateInfo;
	});
}

function throwIfCurrentVersionIsNewest(ccs, updateInfo) {
	if (updateInfo.release === ccs.release) {
		throw errors.create(errors.NO_UPDATE_AVAILABLE);
	}
}

function throwIfPendingInstallVersionIsSame(ccs, updateInfo) {
	if (ccs.pendingInstallation && ccs.pendingInstallation.updateInfo && ccs.pendingInstallation.updateInfo.release === updateInfo.release) {
		throw errors.create(errors.PENDING_INSTALL);
	}
}

module.exports = compareWithCurrentVersion;