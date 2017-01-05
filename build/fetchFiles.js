'use strict';

var downloadFiles = require('./downloadFiles');
var createFoldersInPath = require('./createFoldersInPath');
var sanitizeFolder = require('filenamify');
var copyExistingFiles = require('./copyExistingFiles');
var copyCordovaFiles = require('./copyCordovaFiles');

/**
 * Fetches the update files. Tries to copy from current version first if hashes match, reverts to downloading if that fails.
 * @param  {Object} ccs                     The ccs info stored in localstorage
 * @param  {Array[String]} filesToCopy 		Files to be copied
 * @param  {Array[String]} filesToDownload 	Files to be downloaded
 * @param  {Object} versionInfo             The info received from the server
 * @param  {Object} options                 See calling function
 * @return {Promise}
 */
function fetchFiles(ccs, _ref, versionInfo, options) {
  var filesToCopy = _ref.filesToCopy,
      filesToDownload = _ref.filesToDownload;

  var contentUrl = versionInfo.content_url;
  var destinationFolderName = sanitizeFolder(versionInfo.release);
  var dataDir = cordova.file.dataDirectory;

  return createFoldersInPath(destinationFolderName).then(function () {
    return copyExistingFiles(ccs, dataDir, filesToCopy, destinationFolderName);
  }).catch(function () {
    return downloadFiles(contentUrl, filesToCopy, destinationFolderName, options);
  }).then(function () {
    return downloadFiles(contentUrl, filesToDownload, destinationFolderName, options);
  }).then(function () {
    return copyCordovaFiles(dataDir, destinationFolderName);
  });
}

module.exports = fetchFiles;