var readBody = require("raw-body");

function expressMsgpack (options) {
  var config = options || {};
  if (!config.encoder) {
    config.encoder = require("msgpack-lite").encode;
  }
  if (!config.decoder) {
    config.decoder = require("msgpack-lite").decode;
  }

  return function (req, res, next) {
    // Handle response
    var _json = res.json;
    res.json = function (body) {
      res.format({
        "application/json": function () {
          _json.call(res, body);
        },
        "application/msgpack": function () {
          res.send(config.encoder(body));
        },
      });
    }

    // Handle request
    if (/^application\/msgpack/.test(req.get("Content-Type"))) {
      return readBody(req, { length: req.get("Content-Length")}, function (err, body) {
        if (err) {
          return next(err);
        }
        try {
          req.body = config.decoder(body);
        } catch (err) {
          return next(err);
        }
        req._body = true;
        next();
      });
    }

    next();
  }
}

module.exports = expressMsgpack;
