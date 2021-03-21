/* eslint-disable @typescript-eslint/no-var-requires */
const express = require("express");
const { default: msgpack } = require("express-msgpack");
const request = require("supertest");

const app = express();
app.use(express.json());
app.use(msgpack());
app.post("/test", (req, res) => res.json(req.body));

const json = {
	"int": 1,
	"float": 0.5,
	"boolean": true,
	"null": null,
	"string": "foo bar",
	"array": [
		"foo",
		"bar",
	],
	"object": {
		"foo": 1,
		"baz": 0.5,
	},
};
const messagepack = Buffer.from([
	135, 163, 105, 110, 116, 1, 165, 102, 108, 111,
	97, 116, 203, 63, 224, 0, 0, 0, 0, 0,
	0, 167, 98, 111, 111, 108, 101, 97, 110, 195,
	164, 110, 117, 108, 108, 192, 166, 115, 116, 114,
	105, 110, 103, 167, 102, 111, 111, 32, 98, 97,
	114, 165, 97, 114, 114, 97, 121, 146, 163, 102,
	111, 111, 163, 98, 97, 114, 166, 111, 98, 106,
	101, 99, 116, 130, 163, 102, 111, 111, 1, 163,
	98, 97, 122, 203, 63, 224, 0, 0, 0, 0,
	0, 0,
]);
const text = messagepack.toString("utf8");

it("handles msgpack -> msgpack", async () => {
	await request(app)
		.post("/test")
		.send(messagepack)
		.set("Accept", "application/msgpack")
		.set("Content-Type", "application/msgpack")
		.expect("Content-Type", /^application\/msgpack/)
		.expect(200, text);
});

it("handles msgpack -> json", async () => {
	await request(app)
		.post("/test")
		.send(messagepack)
		.set("Accept", "application/json")
		.set("Content-Type", "application/msgpack")
		.expect("Content-Type", /^application\/json/)
		.expect(200, json);
});

it("handles json -> msgpack", async () => {
	await request(app)
		.post("/test")
		.send(json)
		.set("Accept", "application/msgpack")
		.expect("Content-Type", /^application\/msgpack/)
		.expect(200, text);
});

it("ignores json -> json", async () => {
	await request(app)
		.post("/test")
		.send(json)
		.expect("Content-Type", /^application\/json/)
		.expect(200, json);
});
