'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var codes = {
	// internal
	CCS_INTERNAL: { code: 0, message: 'ccs encountered an internal error.' },

	// general errors
	LOOKFORUPDATES_GENERAL: { code: 1, message: '.lookForUpdates error.' },
	DOWNLOAD_GENERAL: { code: 2, message: '.download errors.' },
	INSTALL_GENERAL: { code: 3, message: '.install error.' },

	// setup errors
	NOT_INITIALIZED: { code: 4, message: '.initialize() needs to be run before installing. It should be the first thing to be run in the application.' },

	// file access errors
	GET_FILE_SYSTEM: { code: 5, message: 'Encountered an error while getting the file system.' },
	GET_FOLDER: { code: 6, message: 'Encountered an error while reading folder from the file system.' },
	GET_FILE: { code: 7, message: 'Encountered an error while reading file from file system.' },
	FILE_COPY: { code: 8, message: 'Encountered an error while copying files.' },
	FOLDER_COPY: { code: 9, message: 'Encountered an error while copying folder.' },
	DELETE_FOLDER: { code: 10, message: 'Encountered an error while deleting folder from file system.' },
	FILE_DOWNLOAD: { code: 11, message: 'Encountered an error while downloading file.' },
	FILE_DOWNLOAD_TIMEOUT: { code: 12, message: 'Encountered a timeout while downloading file.' },

	// ccs errors
	INSTALL_IN_PROGRESS: { code: 13, message: 'An installation is already in progress' },
	DOWNLOAD_IN_PROGRESS: { code: 14, message: 'A download is already in progress.' },
	LOOKFORUPDATES_IN_PROGRESS: { code: 15, message: '.lookForUpdates is already running.' },
	NO_PREVIOUS_VERSION: { code: 16, message: 'No previous versions to copy files from.' },
	NO_PENDING_INSTALL: { code: 17, message: 'Tried to install update, but no updates have been previously downloaded.' },
	NO_URL: { code: 18, message: 'No url was supplied when using .lookForUpdates' },
	NO_UPDATE_AVAILABLE: { code: 19, message: 'Current installed version is the same as the version on the update server.' },
	PENDING_INSTALL: { code: 20, message: 'Newest version is already downloaded, but not installed. Use .install() to install it.' }
};

function resolveType() {
	var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	for (var key in codes) {
		if (codes[key].code === type.code && codes[key].message === type.message) {
			return codes[key];
		}
	}
}

module.exports = Object.freeze(_extends(codes, {
	create: function create(type, message, originalErr) {
		var resolvedErr = resolveType(type);
		var errMessage = 'cordova-code-swap: ' + (message || resolvedErr.message);
		var err = originalErr || new Error(errMessage);
		err.code = resolvedErr.code;
		return err;
	}
}));