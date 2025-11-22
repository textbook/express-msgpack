import cyf from "@codeyourfuture/eslint-config-standard";
import jest from "eslint-plugin-jest";
import globals from "globals";
import tseslint from "typescript-eslint";

/** @type {import("eslint").Linter.Config[]} */
export default [
	...cyf.configs.standard,
	...tseslint.configs.strict,
	...tseslint.configs.stylistic,
	{
		languageOptions: {
			globals: globals.node,
		},
	},
	{
		files: ["**/*.test.js", "**/*.test.ts"],
		languageOptions: {
			globals: jest.environments.globals.globals,
		},
		plugins: { jest },
		rules: {
			"jest/expect-expect": [
				"error",
				{ assertFunctionNames: ["expect", "request.**.expect"] },
			],
			"jest/no-commented-out-tests": "error",
			"jest/no-disabled-tests": "error",
		},
	},
	{ ignores: ["dist/"] },
];
