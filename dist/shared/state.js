'use strict';

var getConfig = require('./getConfig');
var state = {
	initialized: false,
	ccs: getConfig(),
	instanceOptions: {},
	isLookingForUpdates: false,
	isDownloading: false,
	isInstalling: false
};

exports.set = function (name, value) {
	if (!state.hasOwnProperty(name)) {
		throw new Error('Tried assigning value to undeclared property');
	}
	state[name] = value;
};

exports.get = function (name) {
	return state[name];
};