const readBody = require("raw-body");

const expressMsgpack = require("..");

jest.mock("raw-body");

describe("expressMsgpack", () => {
  const originalBody = "foo, bar, baz";
  const headers = {
    "content-type": "application/msgpack",
    "content-length": 42,
  };

  let req;
  let res;
  let next;

  beforeEach(() => {
    readBody.mockClear();
    req = {
      body: originalBody,
      get: jest.fn().mockImplementation((header) => headers[header.toLowerCase()]),
      header: jest.fn().mockImplementation((header) => headers[header.toLowerCase()]),
    };
    res = {
      format: jest.fn(),
      json: jest.fn(),
      send: jest.fn(),
    };
    next = jest.fn();
  });

  it("handles error reading the body", () => {
    const error = "oh no!";

    expressMsgpack()(req, res, next);

    expect(readBody).toHaveBeenCalledWith(req, { length: 42 }, expect.any(Function));
    const [, , callback] = readBody.mock.calls[0];

    callback(error);
    expect(next).toHaveBeenCalledWith(error);
  });

  it("handles error decoding the body", () => {
    expressMsgpack()(req, res, next);

    expect(readBody).toHaveBeenCalledWith(req, { length: 42 }, expect.any(Function));
    const [, , callback] = readBody.mock.calls[0];

    callback(null, {});
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  describe("configuration", () => {
    it("allows you to swap out the encoder", () => {
      const result = "hello, world";
      const encoder = jest.fn().mockReturnValue(result);

      expressMsgpack({ encoder })(req, res, next);
      res.json(originalBody);

      expect(res.format).toHaveBeenCalledWith(expect.any(Object));
      const methods = res.format.mock.calls[0][0];

      methods["application/msgpack"]();
      expect(encoder).toHaveBeenCalledWith(originalBody);
      expect(res.send).toHaveBeenCalledWith(result);
    });

    it("allows you to swap out the decoder", () => {
      const result = "hello, world";
      const decoder = jest.fn().mockReturnValue(result);

      expressMsgpack({ decoder })(req, res, next);

      expect(readBody).toHaveBeenCalledWith(req, { length: 42 }, expect.any(Function));
      const [, , callback] = readBody.mock.calls[0];

      callback(null, originalBody);
      expect(decoder).toHaveBeenCalledWith(originalBody);
      expect(req).toMatchObject({ body: result, _body: true });
      expect(next).toHaveBeenCalledWith();
    });
  });
});
