#!/usr/bin/env node
const through = require('through2');
const duplexer = require('duplexer');

var vdiff = require('variable-diff');

var jsdiff = require('json-diff');
var { colorize } = require('json-diff/lib/colorize');

var jsondiffpatch = require("jsondiffpatch");

const expected = {
  "one" : "val",
  "two" : "val",
  "three" : "val",
  "four" : "val",
  "five" : {
    "someting" : "lorem ipsum dolor sit amet", "other" : "lorem ipsum is getting too long"
  }      
};

const actual = {
  "five" : {
    "someting" : "lorem ipsum dolor sit amet", "other" : "lorem1 ipsum is getting too long"
  },      
  "four" : "val",
  "three" : "val",
  "two" : "val",
};


 
var difference = colorize(jsdiff.diff(expected, actual));
console.log("json-diff");
console.log(difference);


// ---------

console.log("variable-diff");
result = vdiff(expected, actual);
console.log(result.text);

// --------
console.log("jsondiffpatch");
var delta = jsondiffpatch.diff(expected, actual);
var deltaColor = jsondiffpatch.formatters.console.format(delta);
console.log(deltaColor);