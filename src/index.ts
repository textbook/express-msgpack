/* eslint-disable @typescript-eslint/no-var-requires */
import readBody from "raw-body";
import { NextFunction, Request, RequestHandler } from "express";

export interface ExpressMsgpackOptions {
	encoder: (body: unknown) => Buffer;
	decoder: (body: Buffer) => unknown;
	mimeType: string;
}

export default (overrides: Partial<ExpressMsgpackOptions> = {}): RequestHandler => {
	const options = createOptions(overrides);

	return (req, res, next) => {
		// Handle response
		const _json = res.json;
		res.json = (body) => {
			return res.format({
				"application/json": () => _json.call(res, body),
				[options.mimeType]: () => res.send(options.encoder(body)),
			});
		};

		// Handle request
		if (new RegExp(`^${options.mimeType}`, "i").test(req.header("Content-Type") || "")) {
			return readBody(
				req,
				{ length: req.header("Content-Length") },
				bodyHandler(options, req, next)
			);
		}

		next();
	};
};

const bodyHandler = (options: ExpressMsgpackOptions, req: Request, next: NextFunction) => (err: Error, body: Buffer) => {
	if (err) {
		return next(err);
	}
	try {
		req.body = options.decoder(body);
	} catch (err) {
		return next(err);
	}
	(req as Request & { _body: boolean })._body = true;
	next();
};

const createOptions = (overrides: Partial<ExpressMsgpackOptions>): ExpressMsgpackOptions => {
	const options: ExpressMsgpackOptions & { _encode?: ExpressMsgpackOptions["encoder"] } = {
		decoder: overrides.decoder || require("@msgpack/msgpack").decode,
		encoder: overrides.encoder || ((body) => {
			if (!options._encode) {
				const encoder = require("@msgpack/msgpack").encode;
				options._encode = encoder;
				return Buffer.from(encoder(body));
			} else {
				return Buffer.from(options._encode(body));
			}
		}),
		mimeType: overrides.mimeType || "application/msgpack",
	};
	return options;
};
