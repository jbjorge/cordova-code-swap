const getConfig = require('./getConfig');
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
		throw new Error('Tried assigning value to undeclared property');
	}
	state[name] = value;
	return state[name];
};

exports.get = name => state[name];
