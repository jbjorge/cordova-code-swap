global.localStorage = {};
global.window = {
	location: {
		reload: function(){
			console.log("Window location reload")
		}
	}
};
var lib = require('./index');


lib.lookForUpdates("https://live.zegeba.com/assets/app/chcp.json")
	.then(download => download())
	.then(install => install())
	.catch(err => {
		console.log("Download failed");
		console.log(err);
	})