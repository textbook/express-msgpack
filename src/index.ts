import { NextFunction, Request, RequestHandler } from "express";
import readBody from "raw-body";

export interface ExpressMsgpackOptions {
	encoder: (body: unknown) => Buffer;
	decoder: (body: Buffer) => unknown;
	mimeType: string;
}

export default (overrides: Partial<ExpressMsgpackOptions> = {}): RequestHandler => {
	const optionsPromise = createOptions(overrides);

	return async (req, res, next) => {
		try {
			const options = await optionsPromise;
			// Handle response
			const _json = res.json;
			res.json = (body) => {
				return res.format({
					"application/json": () => _json.call(res, body),
					[options.mimeType]: () => res.send(options.encoder(body)),
				});
			};

			// Handle request
			if (new RegExp(`^${options.mimeType}`, "i").test(req.header("Content-Type") ?? "")) {
				return readBody(
					req,
					{ length: req.header("Content-Length") },
					bodyHandler(options, req, next)
				);
			}

			next();
		} catch (err) {
			next(err);
		}
	};
};

type ReadBodyCallback = (err: Error, body: Buffer) => void;

const bodyHandler = (options: ExpressMsgpackOptions, req: Request, next: NextFunction): ReadBodyCallback => (err, body) => {
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

const createOptions = async (overrides: Partial<ExpressMsgpackOptions>): Promise<ExpressMsgpackOptions> => {
	return {
		decoder: overrides.decoder
			?? await import("@msgpack/msgpack").then(({ decode }) => decode),
		encoder: overrides.encoder
			?? await import("@msgpack/msgpack").then(({ encode }) => (body) => Buffer.from(encode(body))),
		mimeType: overrides.mimeType
			?? "application/msgpack",
	};
};
