#! /usr/bin/env node
require('babel-register');
process.chdir(__dirname);
const {
  outputDir,
} = require('./build/buildConstants');
const rimraf = require('rimraf');
const path = require('path');
// eslint-disable-next-line no-console
rimraf(path.resolve(outputDir), () => console.info('deleted'));

