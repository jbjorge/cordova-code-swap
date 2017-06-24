const assert = require('assert');
const getContentUrl = require('./getContentUrl');
const serverUrl = 'http://example.com';
const sut = getContentUrl.bind(null, serverUrl);

it('should return content_url if it contains http://', function() {
	const updateInfo = { content_url: 'http://otherexample.com' };
	const expected = updateInfo.content_url;
	assert.equal(sut(updateInfo), expected);
});

it('should return content_url if it contains https://', function() {
	const updateInfo = { content_url: 'https://otherexample.com' };
	const expected = updateInfo.content_url;
	assert.equal(sut(updateInfo), expected);
});

it('should crash when content_url does not exist', function() {
	assert.throws(() => sut({}));
});

it('should return serverUrl/ if content_url is empty', function() {
	const updateInfo = { content_url: '' };
	const expected = serverUrl + '/';
	assert.equal(sut(updateInfo), expected);
});

it('should return serverUrl/content_url if content_url is relative', function() {
	const updateInfo1 = { content_url: '/' };
	const expected1 = serverUrl + '/';
	assert.equal(sut(updateInfo1), expected1);

	const updateInfo2 = { content_url: 'somepath' };
	const expected2 = serverUrl + '/' + 'somepath';
	assert.equal(sut(updateInfo2), expected2);

	const updateInfo3 = { content_url: '/somepath' };
	const expected3 = serverUrl + '/' + 'somepath';
	assert.equal(sut(updateInfo3), expected3);
});
