#!/usr/bin/env node

const argv = require("minimist")(process.argv.slice(2));

const { init } = require("./index.js");
init(argv);
