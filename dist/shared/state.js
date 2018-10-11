'use strict';

var getConfig = require('./getConfig');
var errors = require('./errors');
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
		throw errors.create(errors.CCS_INTERNAL, 'Tried assigning value to undeclared property');
	}
	state[name] = value;
	return state[name];
};

exports.get = function (name) {
	return state[name];
};