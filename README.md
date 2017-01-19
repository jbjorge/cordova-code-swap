# Cordova code swap
This library makes it possible to swap out the files that are used in your cordova webview.

It contains the code to be run on the client, a CLI and a API for programmatic usage.

## Installation
`npm install --save cordova-code-swap`

## Prerequisites
```xml
<!-- Required to copy files -->
<plugin name="cordova-plugin-file" spec="4.3.1" />

<!-- Required to download updates -->
<plugin name="cordova-plugin-file-transfer" spec="1.6.1" />
```

## Getting started
The CLI can be installed globally with `npm i -g cordova-code-swap`, but using the locally installed version through the script tag in package.json is recommended.
### Dev mode
#### 1: Run the CLI
```bash
$ ccs -i 'www/**/*' -o 'www' -d your-ip-address -r 'www/,' -a
```
#### 2: Add client side code
Add this as the first code that is run in your cordova app:
```javascript
var ccs = require('cordova-code-swap');
var ccsOptions = {
	debug: { reloadServer: 'http://your-ip-address:port' } // this address is the output of the CLI
};
document.addEventListener('deviceready', function(){
	ccs.initialize(ccsOptions)
	    .then(function() {
	        // run your code
	    });
});
```
### Production mode
#### 1: Run the CLI
```bash
$ ccs -i 'www/**/*' -o 'www' -r 'www/,'
```
#### 2: Add client side code
Add this as the first code that is run in your cordova app. The code below will make the app download updates on the first run, and install them the next time the app is started.
```javascript
var ccs = require('cordova-code-swap');
var urlToUpdateEndpoint = 'https://example.com/my-app/';

document.addEventListener('deviceready', function(){
	ccs.initialize()
	    .then(function() { return ccs.install(); })
	    .finally(function() {
	        ccs.lookForUpdates(urlToUpdateEndpoint).then(download => download());
	        // run your code
	    });
});
```

## Client API
#### `ccs.initialize(...) -> Promise`
**Must be run before anything else!**

Checks if a version has been downloaded earlier and should be loaded and returns a promise.

* Changes the window.location.href to the downloaded .html file if the iframe option is false. The returned promise never resolves so no further client code can be run while it is switching to the installed version.
* If running with the iframe options set to true, it will resolve with the url to the currently installed update.

#### `ccs.lookForUpdates(...) -> Promise`
Checks if the update server has an update and returns a promise.

If it does not, it rejects the promise with the error `cordova-code-swap: No new updates found`.
If it encounters an error, it rejects the promise with the error.
If it finds an update, the promise is resolved with a `download` function.

#### `[lookForUpdates].then(function(download) { return download(); }) -> Promise`
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

#### `[download].then(function(install) { return install(); }) -> Promise`
Returns a promise.

Switches to the new version by saving the current entry point in localStorage and changing window.location.href to the downloaded files.

#### `ccs.install() -> Promise`
Returns a promise.

If no update is previously downloaded it will reject the promise with the error: `cordova-code-swap: Tried to install update, but no updates have been previously downloaded.`.
If an update is downloaded and pending installation, it will install that update and immediately switch to it.

## Client options
### Instance options
```javascript
var instanceOptions = {
	// how many of previously installed versions it should keep. Default is 1.
	backupCount: 1,

	// Setting iframe to true causes .initialize() and .install() to return
	// the url of where the downloaded .html entry point recides.
	// This can be useful if you want to run the downloaded app inside an iframe.
	iframe: false,

	// Debug mode is useful for local development, but must be disabled before
	// submitting to the app-store/google-play
	debug: {
		// The server which it will look for real time updates from
		reloadServer: 'http://my-ip:port/',
		
		// When in debug mode, this function will be called with the
		// new url to use in the iframe each time the app has
		// installed an update
		onIframeUpdate: function(url){},

		// This setting will make the plugin swap out files in the
		// same folder on each update to preserve code-breakpoints.
		preserveBreakpoints: true
	}
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
	}
}
ccs.lookForUpdates('http://example.com/', updateOptions);
```

### Usage - all options exposed
```javascript
var ccs = require('cordova-code-swap');
var urlToUpdateEndpoint = 'https://example.com/my-app/';
var myNativeVersion = getNativeVersionSomehow();
var updateOptions = {
	entryFile: 'index.html',
	headers: {
		'User-Agent': 'Cordova-Code-Swap'
	}
};
var instanceOptions = {
	backupCount: 1,
	iframe: true,
	debug: {
		reloadServer: 'http://my-ip:port/',
		onIframeUpdate: function(){},
		preserveBreakpoints: true
	}
};

document.addEventListener('deviceready', function(){
	ccs.initialize(instanceOptions) // must always be run before anything else
      .then(function() {
          return ccs.lookForUpdates(urlToUpdateEndpoint, updateOptions)
      })
      .catch(function(err) { /*handle the error*/ })
      .then(function(download) {
          if (download.updateInfo.min_native_interface > myNativeVersion) {
              throw new Error('Update received from the server requires newer native version of the app to be installed.');
          }
          return download();
      })
      .catch(function(downloadErr) { /*handle the error*/ })
      .then(function(install) { return install() })
      .catch(function(installErr) { /*handle the error*/ });

	// optional
	ccs.install(); // <-- can be used after e.g. restarting the app if there is a downloaded update that has not been installed yet.
});
```


## Programmatic API
If you don't want to use the CLI, but instead want to e.g. use it in a build system, this library offers a programmatic interface.

```javascript
var ccs = require('cordova-code-swap/utils/createCCSFiles');
var ccsOptions = {
	// the config that will be merged into chcp.json
	config: {},

    // "a" will be replaced with "b" in the generated manifest file paths
    replace: ['a', 'b'],

    // the ip:port the debug server will be run on, watches files and generates new manifest upon change
    dev: '',

    // make the app update every time the manifest updates (when running with dev option)
    autoUpdate: false
};
var inputGlob = ['www/**/*']; // array of minimatch strings that will be included in the manifest file
var outputFolder = 'www'; // path to where chcp.json and chcp.manifest will be output to

ccs(inputGlob, outputFolder, ccsOptions) // returns promise that resolves with an emit function that tells the app to update
	.then(function(emitUpdateNotification) {
		// useful when not using ccsOptions.autoUpdate
		emitUpdateNotification();
	});
```