# Cordova code swap
This library is a drop-in-replacement for the client side of [cordova-hot-code-push](https://github.com/nordnet/cordova-hot-code-push) that avoids some of its limitations.

## Differences from cordova-hot-code-push

* Minimal API
* API returns promises
* Can update your app on first run

## Installation
`npm install --save cordova-code-swap`

## Usage
Call `.initialize()` as the first thing after `deviceready` has fired.
If the app is supposed to run on a different version than the code that came with your native installation, it will then switch to that version immediately after `.initialize()` has been called.

Now you are free to check for updates, download and install them.
```javascript
var ccs = require('cordova-code-swap');

document.addEventListener('deviceready', function(){
	ccs.initialize(); // <-- returns promise that always resolves
	ccs.lookForUpdates(urlToUpdateFile, options)
		.catch(err => {})
		.then(download => download())
		.catch(downloadErr => {})
		.then(install => install())
		.catch(installErr => {});
});
```

## Options
```
options = {
	// path to your .html file, relative to the www-folder. Default is index.html
	entryFile: 'index.html',

	// headers that will be sent with the requests to the update server
	headers: {
		key: value
	}
}
```

## Creating the necessary files for the update server
See [cordova-hot-code-push-cli](https://github.com/nordnet/cordova-hot-code-push-cli).