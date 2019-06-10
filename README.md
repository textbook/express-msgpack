Express Msgpack
===============

[![License](https://img.shields.io/github/license/textbook/express-msgpack.svg)](https://github.com/textbook/express-msgpack/blob/master/LICENSE)
[![Build Status](https://travis-ci.org/textbook/express-msgpack.svg?branch=master)](https://travis-ci.org/textbook/express-msgpack)
[![Test Coverage](https://api.codeclimate.com/v1/badges/e9a820ea77a01c1ba8bb/test_coverage)](https://codeclimate.com/github/textbook/express-msgpack/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/e9a820ea77a01c1ba8bb/maintainability)](https://codeclimate.com/github/textbook/express-msgpack/maintainability)
[![NPM Version](https://img.shields.io/npm/v/express-msgpack.svg)](https://www.npmjs.com/package/express-msgpack)

[Express] and [MessagePack], together at last. Uses [`msgpack-lite`][1] by default.

Functionality
-------------

Provides transparent middleware that can be used to support clients requesting
`Accept: application/msgpack` from endpoints using `res.json` or sending
`Content-Type: application/msgpack` to any endpoint. You can continue to use
`req.body` and `res.json` and `expressMsgpack` will handle the conversion in
the background using `msgpack-lite` or any compatible library of your choice.

Installation
------------

```bash
$ npm install --save express-msgpack
// or
$ yarn add express-msgpack
```

If you intend to use an alternative to `msgpack-lite` (see Configuration) you
can add the `--no-optional` flag; it's an optional dependency.

Usage
-----

```javascript
const msgpack = require("express-msgpack");

// ...
app.use(msgpack());
```

Configuration
-------------

To configure, pass options when you configure the middleware. Currently supported options are:

Parameter | Description | Default
----------|-------------|---------
`decoder` | a function converting from MessagePack to JavaScript | `msgpack-lite#decode`
`encoder` | a function converting from JavaScript to MessagePack | `msgpack-lite#encode`
`mimeType` | the MIME type to detect and set for MessagePack payloads | `"application/msgpack"`

For example, to switch to the node-gyp C++ based [msgpack] library:

```javascript
const { pack, unpack } = require("msgpack");
const msgpack = require("express-msgpack");

// ...

app.use(msgpack({ decoder: unpack, encoder: pack }));
```

Development
-----------

As `npm install` won't include peer or optional dependencies by default,
there's an additional step required to set the package up for development:

```bash
$ npm install
$ npm run install:peers
```

The project has code linting and testing, using the following commands:

  - `npm run lint`: run the ESLint checks
  - `npm run ship`: lint and test
  - `npm test`: run the Jest unit and integration tests
  - `npm test:watch`: run the tests in watch mode

The tests are in the `__tests__/` directory and are run using [Jest]. They're
split into two files:

  - `unit.test.js` - mockist unit tests, to check specific internal details
  - `integration.test.js` - integration tests using [SuperTest] with a simple
    Express app using the middleware

There is also a `smoke/` directory containing smoke tests for a deployed
version of the package, used by `smoke.sh`.

[Express]: https://expressjs.com/
[Jest]: https://jestjs.io/
[MessagePack]: https://msgpack.org/
[msgpack]: https://www.npmjs.com/package/msgpack
[SuperTest]: https://github.com/visionmedia/supertest
[1]: https://www.npmjs.com/package/msgpack-lite
