Express Msgpack
===============

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
$ npm install --save express-msgpack msgpack-lite
// or
$ yarn add express-msgpack msgpack-lite
```

If you intend to use an alternative to `msgpack-lite` (see Configuration) you
can leave that out; it's an optional dependency.

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

  - `encoder`: a function converting from JavaScript to MessagePack (default:
    `msgpack-lite#encode`)
  - `decoder`: a function converting from MessagePack to JavaScript (default:
    `msgpack-lite#decode`)

For example, to switch to the node-gyp C++ based [msgpack] library:

```javascript
const { pack, unpack } = require("msgpack");
const msgpack = require("express-msgpack");

// ...

app.use(msgpack({ decoder: unpack, encoder: pack }));
```

Development
-----------

The tests are in the `__tests__/` directory and are run using [Jest]. They're
split into two files:

  - `unit.test.js` - mockist unit tests, to check specific internal details
  - `integration.test.js` - integration tests using [SuperTest] with a simple
    Express app using the middleware

[Express]: https://expressjs.com/
[Jest]: https://jestjs.io/
[MessagePack]: https://msgpack.org/
[msgpack]: https://www.npmjs.com/package/msgpack
[SuperTest]: https://github.com/visionmedia/supertest
[1]: https://www.npmjs.com/package/msgpack-lite
