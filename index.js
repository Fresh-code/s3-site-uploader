#!/usr/bin/env node

'use strict';

require('dotenv').config();

const directory = process.argv.slice(2)[0];
const uploadDirectory = require('./lib/upload-directory');

if (!directory) {
  console.log(`[warn] You have to specify a directory to upload site from. For example: node index.js ../dir`);
  process.exit(1);
} else {
  uploadDirectory(directory);
}