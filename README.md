# Cordova code swap
This library can be used to swap out code in a cordova application.

## Installation
`npm install --save cordova-code-swap`

## Usage
Call `ccs.initialize()` as the first thing after `deviceready` has fired.
If the app is supposed to run on a different version than the code that came with your native installation, it will then switch to that version immediately after `.initialize()` has been called.

Now you are free to check for updates, download and install them.
```javascript
document.addEventListener('deviceready', function(){
	var ccs = require('cordova-code-swap');
	ccs.initialize(); // <-- returns promise
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
	entryFile: 'index.html', // path to your .html file, relative to the www-folder. Default is index.html
}
```

## Creating the necessary files for the update server
TODO