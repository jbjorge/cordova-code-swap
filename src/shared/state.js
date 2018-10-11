const getConfig = require('./getConfig');
const errors = require('./errors');
const state = {
	initialized: false,
	ccs: getConfig(),
	instanceOptions: {},
	isLookingForUpdates: false,
	isDownloading: false,
	isInstalling: false,
};

exports.set = (name, value) => {
	if (!state.hasOwnProperty(name)) {
		throw errors.create(errors.CCS_INTERNAL, 'Tried assigning value to undeclared property');
	}
	state[name] = value;
	return state[name];
};

exports.get = name => state[name];
