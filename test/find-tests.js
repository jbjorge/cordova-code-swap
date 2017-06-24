const fs = require('fs');
const path = require('path');

module.exports = function(options = {}) {
	const rootPaths = options.rootPaths || [options.rootPath || path.resolve('./src')];
	const fileContains = options.fileContains || '.spec';

	rootPaths.forEach(searchForTests);
};

function searchForTests(dir, treeLevel) {
	treeLevel = treeLevel || 1;
	const items = fs.readdirSync(dir);
	items.forEach(function(item) {
		const sutPath = dir + '/' + item;
		if (isDirectory(sutPath)) {
			searchForTests(sutPath, treeLevel + 1);
		} else if (item.match(/\.spec$/)) {
			const testPath = sutPath.split('/').slice(treeLevel * -1).join('/');
			context(testPath, () => {
				require(sutPath);
			});
		}
	});
}

function isDirectory(name) {
	try {
		return fs.statSync(name).isDirectory();
	} catch (err) {
		return false;
	}
};
