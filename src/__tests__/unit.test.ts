import { NextFunction, Request, Response } from "express";
import readBody from "raw-body";

import expressMsgpack from "..";

jest.mock("raw-body");

describe("expressMsgpack", () => {
	const originalBody = "foo, bar, baz";
	const headers: Record<string, unknown> = {
		"content-type": "application/msgpack",
		"content-length": 42,
	};

	let req: Request;
	let res: Response;
	let next: jest.Mock<NextFunction>;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const readBodyMock: jest.Mock<typeof readBody> = readBody as any;

	beforeEach(() => {
		readBodyMock.mockClear();
		req = {
			body: originalBody,
			get: jest.fn().mockImplementation((header: string) => headers[header.toLowerCase()]),
			header: jest.fn().mockImplementation((header: string) => headers[header.toLowerCase()]),
		} as unknown as Request;
		res = {
			format: jest.fn(),
			json: jest.fn(),
			send: jest.fn(),
		} as unknown as Response;
		next = jest.fn();
	});

	it("handles error reading the body", async () => {
		const error = "oh no!";

		await expressMsgpack()(req, res, next);

		expect(readBodyMock).toHaveBeenCalledWith(req, { length: 42, limit: "100kb" }, expect.any(Function));
		const [, , callback] = readBodyMock.mock.calls[0];

		callback(error);
		expect(next).toHaveBeenCalledWith(error);
	});

	it("handles error decoding the body", async () => {
		await expressMsgpack()(req, res, next);

		expect(readBodyMock).toHaveBeenCalledWith(req, { length: 42, limit: "100kb" }, expect.any(Function));
		const [, , callback] = readBodyMock.mock.calls[0];

		callback(null, {});
		expect(next).toHaveBeenCalledWith(expect.any(Error));
	});

	describe("configuration", () => {
		it("allows you to swap out the encoder", async () => {
			const result = "hello, world";
			const encoder = jest.fn().mockReturnValue(result);

			await expressMsgpack({ encoder })(req, res, next);
			res.json(originalBody);

			expect(res.format).toHaveBeenCalledWith(expect.any(Object));
			const methods = (res.format as jest.Mock).mock.calls[0][0];

			methods["application/msgpack"]();
			expect(encoder).toHaveBeenCalledWith(originalBody);
			expect(res.send).toHaveBeenCalledWith(result);
		});

		it("allows you to swap out the decoder", async () => {
			const result = "hello, world";
			const decoder = jest.fn().mockReturnValue(result);

			await expressMsgpack({ decoder })(req, res, next);

			expect(readBodyMock).toHaveBeenCalledWith(req, { length: 42, limit: "100kb" }, expect.any(Function));
			const [, , callback] = readBodyMock.mock.calls[0];

			callback(null, originalBody);
			expect(decoder).toHaveBeenCalledWith(originalBody);
			expect(req).toMatchObject({ body: result, _body: true });
			expect(next).toHaveBeenCalledWith();
		});

		it("allows you to change body limit", async () => {
			await expressMsgpack({ limit: "1mb" })(req, res, next);

			expect(readBodyMock).toHaveBeenCalledWith(req, { length: 42, limit: "1mb" }, expect.any(Function));
		});
	});
});
