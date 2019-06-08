#! /usr/bin/env node

const npm = require("npm");

const { optionalDependencies, peerDependencies } = require("./package.json");

const packages = (deps) => Object
  .keys(deps)
  .map((name) => `${name}@${deps[name]}`);

npm.load({ save: false }, () => npm.commands.install([
  ...packages(peerDependencies),
  ...packages(optionalDependencies),
]));
