const sut = require('./configureUrl');
const assert = require('assert');

it('should add http:// and default port to ip/domain without port', () => {
	const ip = '10.0.0.1';
	const expected = 'http://10.0.0.1:9555';
	const actual = sut(ip);
	assert.equal(actual, expected);

	const domain = 'localhost.com';
	const expected2 = 'http://localhost.com:9555';
	const actual2 = sut(domain);
	assert.equal(actual2, expected2);
});

it('should add default port to url without port', () => {
	const url = 'http://10.0.0.1';
	const expected = url + ':9555';
	const actual = sut(url);
	assert.equal(actual, expected);

	const url2 = 'https://10.0.0.1';
	const expected2 = url2 + ':9555';
	const actual2 = sut(url2);
	assert.equal(actual2, expected2);

	const url3 = 'http://localhost.com';
	const expected3 = url3 + ':9555';
	const actual3 = sut(url3);
	assert.equal(actual3, expected3);

	const url4 = 'http://localhost.com';
	const expected4 = url4 + ':9555';
	const actual4 = sut(url4);
	assert.equal(actual4, expected4);
});

it('should add http:// to ip/domain with port', () => {
	const ip = '10.0.0.1:1234';
	const expected = 'http://' + ip;
	const actual = sut(ip);
	assert.equal(actual, expected);

	const domain = 'localhost.com:1234';
	const expected2 = 'http://' + domain;
	const actual2 = sut(domain);
	assert.equal(actual2, expected2);
});

it('should do nothing with urls that have port', () => {
	const url = 'http://10.0.0.1:1234';
	const expected = url;
	const actual = sut(url);
	assert.equal(actual, expected);

	const url2 = 'https://10.0.0.1:1234';
	const expected2 = url2;
	const actual2 = sut(url2);
	assert.equal(actual2, expected2);
});
