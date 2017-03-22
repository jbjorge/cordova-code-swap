const fs = require('fs');
const path = require('path');

function createCHCP(outputFolder, config = {}) {
	const defaultConfig = {
		content_url: '/',
		release: Date.now().toString()
	};
	const filePath = path.join(outputFolder, 'chcp.json');
	config = Object.assign({}, defaultConfig, config);

	return new Promise((resolve, reject) => {
		fs.writeFile(filePath, JSON.stringify(config), err => {
			if (err) {
				reject(err);
			}
			resolve();
		});
	});
}

module.exports = createCHCP;
