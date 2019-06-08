const readBody = require("raw-body");

const expressMsgpack = (options = {}) => {
  if (!options.encoder) {
    options.encoder = require("msgpack-lite").encode;
  }
  if (!options.decoder) {
    options.decoder = require("msgpack-lite").decode;
  }

  return (req, res, next) => {
    // Handle response
    const _json = res.json;
    res.json = (body) => {
      res.format({
        "application/json": () => _json.call(res, body),
        "application/msgpack": () => res.send(options.encoder(body)),
      });
    };

    // Handle request
    if (/^application\/msgpack/.test(req.get("Content-Type"))) {
      return readBody(req, { length: req.get("Content-Length") }, (err, body) => {
        if (err) {
          return next(err);
        }
        try {
          req.body = options.decoder(body);
        } catch (err) {
          return next(err);
        }
        req._body = true;
        next();
      });
    }

    next();
  };
};

module.exports = expressMsgpack;
