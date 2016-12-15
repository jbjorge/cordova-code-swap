global.localStorage = {};
global.window = {
	location: {
		reload: function(){
			console.log('Window location reload');
		}
	},
	resolveLocalFileSystemURL: function(_, resolve){
		resolve();
	}
};
global.cordova = {
	file: {
		dataDirectory: 'dataDirectory/'
	}
};
global.FileTransfer = function(){
	return {
		download: function(url, destinationFolder, onSuccess, onError, trustAllHosts, options){
			console.log(url, destinationFolder);
			onSuccess({
				toURL: function(){}
			})
		}
	}
}
var lib = require('./index');

lib.initialize()
	.then(() => lib.lookForUpdates('https://live.zegeba.com/assets/app/chcp.json'))
	.then(download => download())
	.then(install => install())
	.then(() => console.log('Finished'))
	.catch(err => {
		console.log('Download failed');
		console.log(err);
	})