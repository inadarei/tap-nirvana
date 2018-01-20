#!/usr/bin/env node

const tapBDiff = require('../tap-nirvana')();

process.stdin
  .pipe(tapBDiff)
  .pipe(process.stdout);

process.on('exit', function (status) {
  
  if (status === 1) {
    process.exit(1);
  }
  
  if (tapBDiff.failed) {
    process.exit(1);
  }
});