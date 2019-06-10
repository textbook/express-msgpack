const readBody = require("raw-body");

const bodyHandler = (options, req, next) => (err, body) => {
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
};

const expressMsgpack = (options = {}) => {
  options.encoder = options.encoder || require("msgpack-lite").encode;
  options.decoder = options.decoder || require("msgpack-lite").decode;
  options.mimeType = options.mimeType || "application/msgpack";

  return (req, res, next) => {
    // Handle response
    const _json = res.json;
    res.json = (body) => {
      res.format({
        "application/json": () => _json.call(res, body),
        [options.mimeType]: () => res.send(options.encoder(body)),
      });
    };

    // Handle request
    if (new RegExp(`^${options.mimeType}`, "i").test(req.header("Content-Type"))) {
      return readBody(
        req,
        { length: req.header("Content-Length") },
        bodyHandler(options, req, next),
      );
    }

    next();
  };
};

module.exports = expressMsgpack;
