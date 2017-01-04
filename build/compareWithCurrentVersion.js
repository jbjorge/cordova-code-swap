'use strict';

var Promise = require('bluebird');

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
		return throwIfNativeVersionTooOld(ccs, updateInfo);
	}).then(function () {
		return updateInfo;
	});
}

function throwIfCurrentVersionIsNewest(ccs, updateInfo) {
	if (updateInfo.release === ccs.version) {
		throw new Error('cordova-code-swap: ' + 'Current installed version is the same as the version on the update server.');
	}
}

function throwIfNativeVersionTooOld(ccs, updateInfo) {
	if (!updateInfo.min_native_interface) return;

	return getNativeVersion(ccs, updateInfo).then(function (nativeVersion) {
		if (nativeVersion < updateInfo.min_native_interface) throw new Error('cordova-code-swap: ' + 'Native app version is too old to receive this update (min_native_interface is lower)');
	});
}

function getNativeVersion(ccs, updateInfo) {
	return new Promise(function (resolve) {
		if (usingPlugin()) cordova.getAppVersion.getVersionCode(resolve);else if (ccs.currentNativeVersion) resolve(ccs.currentNativeVersion);else resolve(updateInfo.min_native_interface);
	});
}

function usingPlugin() {
	return cordova.getAppVersion && cordova.getAppVersion.getVersionCode;
}

module.exports = compareWithCurrentVersion;