#! /usr/bin/env node
require('babel-register');
process.chdir(__dirname);
const webpack = require('webpack');
const getConfig = require('./dev.webpack.babel').default;
const {
  outputDir,
  outputHTMLFileName,
} = require('./build/buildConstants');
const open = require('open');
const path = require('path');
const rimraf = require('rimraf');
const fs = require('fs');

const htmlFilePath = path.resolve(outputDir, outputHTMLFileName);

if (fs.existsSync(htmlFilePath)) {

  open(htmlFilePath);
} else {

  rimraf(path.resolve(outputDir), () => {
    webpack(getConfig(), (err, stats) => {
      if (err || stats.hasErrors()) {
        console.error('error', err);
      }

      open(htmlFilePath);
    });
  });
}


