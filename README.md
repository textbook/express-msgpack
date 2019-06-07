Express Msgpack
===============

[Express] and [MessagePack], together at last. Uses [msgpack-lite] by default.

Installation
------------

```bash
$ npm install express-msgpack
```

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

 - `encoder`: a function converting from JavaScript to MessagePack (default: `msgpack-lite#encode`)
 - `decoder`: a function converting from MessagePack to JavaScript (default: `msgpack-lite#decode`)

For example, to switch to the node-gyp C++ based [msgpack] library:

```javascript
const msgpack = require("msgpack");
const expressMsgpack = require("express-msgpack");

// ...

app.use(expressMsgpack({
  decoder: msgpack.unpack,
  encoder: msgpack.pack,
}))
```

[Express]: https://expressjs.com/
[MessagePack]: https://msgpack.org/
[msgpack]: https://www.npmjs.com/package/msgpack
[msgpack-lite]: https://www.npmjs.com/package/msgpack-lite
