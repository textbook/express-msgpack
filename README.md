# Express Msgpack

[![License](https://img.shields.io/github/license/textbook/express-msgpack.svg)](https://github.com/textbook/express-msgpack/blob/main/LICENSE)
[![Build Status](https://github.com/textbook/express-msgpack/workflows/Node.js%20CI/badge.svg?branch=main)](https://github.com/textbook/express-msgpack/actions)
[![Test Coverage](https://api.codeclimate.com/v1/badges/e9a820ea77a01c1ba8bb/test_coverage)](https://codeclimate.com/github/textbook/express-msgpack/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/e9a820ea77a01c1ba8bb/maintainability)](https://codeclimate.com/github/textbook/express-msgpack/maintainability)
[![NPM Version](https://img.shields.io/npm/v/express-msgpack.svg)](https://www.npmjs.com/package/express-msgpack)

[Express] and [MessagePack], together at last. Uses [`@msgpack/msgpack`][1] by default.

## Functionality

Provides transparent middleware that can be used to support clients requesting
`Accept: application/msgpack` from endpoints using `res.json` or sending
`Content-Type: application/msgpack` to any endpoint. You can continue to use
`req.body` and `res.json` and `expressMsgpack` will handle the conversion in
the background using `@msgpack/msgpack` (or any compatible library of your
choice).

## Installation

```bash
$ npm install --save express-msgpack
// or
$ yarn add express-msgpack
```

If you intend to use an alternative to `@msgpack/msgpack` (see Configuration)
you can add the `--no-optional` flag; it's an optional dependency.

## Usage

```javascript
import msgpack from "express-msgpack";

// ...
app.use(msgpack());
```

### CommonJS

```javascript
const msgpack = require("express-msgpack").default;

// ...
app.use(msgpack());
```

## Configuration

To configure, pass options when you configure the middleware. Currently supported options are:

| Parameter  | Description                                              | Default                                                                      |
|------------|----------------------------------------------------------|------------------------------------------------------------------------------|
| `decoder`  | a function converting from MessagePack to JavaScript     | `@msgpack/msgpack#decode`                                                    |
| `encoder`  | a function converting from JavaScript to MessagePack     | `@msgpack/msgpack#encode` (with a wrapper to convert the result to a Buffer) |
| `mimeType` | the MIME type to detect and set for MessagePack payloads | `"application/msgpack"`                                                      |
| `limit`    | The byte limit of the body. This is the number of bytes or any string format supported by [bytes](https://www.npmjs.com/package/bytes) | `"100kb"`                                                      |

For example, to switch to the node-gyp C++ based [msgpack] library:

```javascript
import msgpack from "express-msgpack";
import { pack, unpack } from "msgpack";

// ...
app.use(msgpack({ decoder: unpack, encoder: pack }));
```

## Development

The project has code linting and testing, using the following commands:

  - `npm run e2e`: run the smoke/E2E tests
  - `npm run lint`: run the ESLint checks
  - `npm run ship`: lint and run unit, integration and E2E tests
  - `npm test`: run the Jest unit and integration tests
  - `npm test:watch`: run the tests in watch mode

The tests are in the `__tests__/` directory and are run using [Jest]. They're
split into two files:

  - `unit.test.ts` - mockist unit tests, to check specific internal details
  - `integration.test.ts` - integration tests using [SuperTest] with a simple
    Express app using the middleware

There is also a `smoke/` directory containing E2E/smoke tests for a deployed
version of the package, used by `bin/smoke.sh`. If the `--local` argument is
supplied to the script the local version is packaged and tested , otherwise
the specified `$TAG` version is installed from the registry and tested.

[Express]: https://expressjs.com/
[Jest]: https://jestjs.io/
[MessagePack]: https://msgpack.org/
[msgpack]: https://www.npmjs.com/package/msgpack
[SuperTest]: https://github.com/visionmedia/supertest
[1]: https://www.npmjs.com/package/@msgpack/msgpack
