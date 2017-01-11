# Cordova code swap

This library is a drop-in-replacement for the client side of [cordova-hot-code-push](https://github.com/nordnet/cordova-hot-code-push) that avoids some of its limitations.

## Differences from cordova-hot-code-push

- Minimal API
- API returns promises
- Can update your app on first run
- Supports relative content_url path in chcp.json
- Leaves checking min_native_version up to you (see example in [Usage](#usage))

## Installation

`npm install --save cordova-code-swap`

## Prerequisites

```xml
<!-- Required to copy files -->
<plugin name="cordova-plugin-file" spec="4.3.1"/>

<!-- Required to download updates -->
<plugin name="cordova-plugin-file-transfer" spec="1.6.1"/>
```

## Creating the necessary files for the update server

See [cordova-hot-code-push-cli](https://github.com/nordnet/cordova-hot-code-push-cli).

## Usage

```javascript
var ccs = require('cordova-code-swap');
var urlToUpdateEndpoint = 'https://example.com/my-app/';
var myNativeVersion = getNativeVersion();
var updateOptions = {
	entryFile: 'app.html',
	headers: {
		'User-Agent': 'Cordova-Code-Swap'
	},
	debug: false
};
var instanceOptions = {
	backupCount: 1
};

document.addEventListener('deviceready', function(){
	ccs.initialize(instanceOptions) // must always be run before anything else
	ccs.lookForUpdates(urlToUpdateEndpoint, updateOptions)
		.catch(err => {})
		.then(download => {
			if (download.updateInfo.min_native_interface > myNativeVersion) {
				throw new Error('Update received from the server requires newer native version of the app to be installed.');
			}
			return download();
		})
		.catch(downloadErr => {})
		.then(install => install())
		.catch(installErr => {});

	// optional
	ccs.install(); // <-- can be used after e.g. restarting the app if there is a downloaded update that has not been installed yet.
});
```

## Options
### Instance options
```javascript
var instanceOptions = {
	// how many of previously installed versions it should keep. Default is 1.
	backupCount: 1
}
ccs.initialize(instanceOptions);
```

### Update options
```javascript
var updateOptions = {
	// Path to your .html file, relative to the www-folder. Default is index.html
	entryFile: 'index.html',

	// Headers that will be sent with the requests to the update server
	headers: {
		key: value
	},

	// Debug mode will swap out files in the same folder on each update.
	// This is to make it possible to keep breakpoints after fetching an update.
	// This also disables instanceOptions.backup since it only works with one
	// code source at all times
	// Default is false.
	debug: false
}
ccs.lookForUpdates('http://example.com/', updateOptions);
```

## API

#### `ccs.initialize(...)`
Returns a promise that always resolves.
Must be run before anything else!
Checks if a version has been downloaded earlier and should be loaded. If so, it changes the window.location.href to the downloaded .html file.

#### `ccs.lookForUpdates(...)`
Checks if the update server has an update and returns a promise.
If it does not, it rejects the promise with the error `cordova-code-swap: No new updates found`.
If it encounters an error, it rejects the promise with the error.
If it finds an update, the promise is resolved with a `download` function.

#### `[lookForUpdates].then(function(download) { return download(); })`
Downloads the update and returns a promise.
If it encounters an error, it rejects the promise with the error.
If it finished downloading without errors, the promise is resolved with an `install` function.

The `download` function can be called when you want to download the updated files.
The `download` function has the property `.updateInfo` tacked on. This contains the JSON-object it received from the server when looking for updates and can be used to better determine if you want to call `download()` or not.
The `download.updateInfo` object can e.g. look like this:

```javascript
{
	"content_url": "https://example.com/my-app-name/", //(or "content_url": "/relative/to/chcp.json")
	"release": "1.3.3",
	"installTime": "afterRestart",
	"min_native_interface": 50
}
```

#### `[download].then(function(install) { return install(); })`
Switches to the new version by saving the current entry point in localStorage and changing window.location.href to the downloaded files.

#### `ccs.install()`
Returns a promise.
If no update is previously downloaded it will reject the promise with the error: `cordova-code-swap: Tried to install update, but no updates have been previously downloaded.`.
If an update is downloaded and pending installation, it will install that update and immediately switch to it.