#!/usr/bin/env node
import { exec as originalExec } from "node:child_process";
import { copyFile, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs, promisify } from "node:util";

const exec = promisify(originalExec);

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageDir = resolve(__dirname, "..");

const { values: { local, tag } } = parseArgs({
	allowPositionals: false,
	options: {
		local: { type: "boolean", default: false, short: "l" },
		tag: { type: "string", default: "latest", short: "t" },
	},
	strict: true,
});

if (local && tag !== "latest") {
	throw new Error("cannot use a specific tag for local testing");
}

/** @type {string} */
let packageSpec;

if (local) {
	await exec("npm run build", { cwd: packageDir });
	const { stdout } = await exec("npm pack", { cwd: packageDir });
	packageSpec = join(packageDir, stdout.trim());
	await exec("node smoke.test.js", { cwd: packageDir });
} else {
	packageSpec = `express-msgpack@${tag}`;
}


const pkgFile = {
	name: "test-package",
	version: "0.1.0",
	type: "module",
	scripts: { test: "node --test" },
	devDependencies: { supertest: "*" },
};

const results = await Promise.allSettled([
	{ express: "^4", msgpack: "^3" },
	{ express: "^4", msgpack: "^2" },
	{ express: "^4", msgpack: "^1.3.2" },
].map(async ({ express, msgpack }) => {
	const deps = [`express@${express}`, `@msgpack/msgpack@${msgpack}`];
	const workDir = await mkdtemp(join(tmpdir(), "test-"));

	await writeFile(join(workDir, "package.json"), JSON.stringify(pkgFile, null, 2), { encoding: "utf-8" });
	await copyFile(join(packageDir, "smoke.test.js"), join(workDir, "smoke.test.js"));
	await exec(["npm", "install", ...deps, packageSpec].join(" "), { cwd: workDir });

	await exec("npm test", { cwd: workDir });
	console.info("tests passed for %s", deps.join(" "));
}));

const failures = results.filter(({ status }) => status === "rejected");

if (failures.length > 0) {
	const message = "Smoke testing failed";
	if (!local) {
		await exec(`npm unpublish ${packageSpec} '${message}'`);
	}
	for (const failure of failures) {
		console.error(failure.reason);
	}
	throw new Error(message);
}
