const fs = require('fs');

const tapOut = require('tap-out');
const through = require('through2');
const duplexer = require('duplexer');
const format = require('chalk');
const prettyMs = require('pretty-ms');
const _ = require('lodash');
const repeat = require('repeat-string');
const symbols = require('figures');
const stringify = require("json-stringify-pretty-compact");
const vdiff = require ("variable-diff");

function lTrimList (lines) {
  
  var leftPadding;
  
  // Get minimum padding count
  _.each(lines, function (line) {
    
    var spaceLen = line.match(/^\s+/)[0].length;
    
    if (leftPadding === undefined || spaceLen < leftPadding) {
      leftPadding = spaceLen;
    }
  });
  
  // Strip padding at beginning of line
  return _.map(lines, function (line) {
    return line.slice(leftPadding);
  });
}

/**
 * If you try to deepEqual two JSON objects in tape, by the time these reach us
 * here, they are stringified Javascript (not JSON!) objects. So we need to 
 * revive them and the only way is using eval. To make the usage of eval safe
 * we wrap it in JSON.stringify and then restore with JSON.parse
 * 
 * @param {*String} jsString 
 */
function reviveJSON(jsString) {
  let omg;
  eval ("omg = JSON.parse(JSON.stringify(" + jsString + "))");
  return omg;
}

/**
 * Remove lines from error stack that belong to test runner. Nobody cares
 * @param {*String} stack 
 */
function removeUselessStackLines(stack) {
  let pretty = stack.split('\n');
  pretty = pretty.filter((line) => {
    return !line.includes('node_modules') && !line.includes('Error');
  });  
  pretty = pretty.join('\n');
  return pretty;
}

module.exports = function (spec) {

  spec = spec || {};

  var OUTPUT_PADDING = spec.padding || '  ';

  var output = through();
  var parser = tapOut();
  var stream = duplexer(parser, output);
  var startTime = new Date().getTime();

  output.push('\n');

  parser.on('test', function (test) {
    output.push('\n' + pad(format.cyan(test.name)) + '\n');
  });

  // Passing assertions
  parser.on('pass', function (assertion) {

    var glyph = format.green(symbols.tick);
    var name = format.dim(assertion.name);

    output.push(pad('  ' + glyph + pad(name) + '\n'));
  });

  // Failing assertions
  parser.on('fail', function (assertion) {

    var glyph = symbols.cross;
    var title =  glyph + pad(assertion.name);
    var divider = _.fill(
      new Array((title).length + 1),
      '-'
    ).join('');
    output.push(pad('  ' + format.red(title) + '\n'));
    output.push(pad('  ' + format.red(divider) + '\n'));

    let skipObjectDiff = true;
    let errorMessage  = format.magenta("operator:") + " deepEqual\n";

    if (assertion.error.operator === 'deepEqual') {
      skipObjectDiff = false;
      try {
        const exObj = reviveJSON(assertion.error.expected);
        const acObj = reviveJSON(assertion.error.actual);
        const expected = stringify(exObj);
        const actual = stringify(acObj);

        if (typeof exObj == 'object' && typeof acObj == 'object') {
          errorMessage += format.magenta("expected: ") + expected + "\n";
          var difference = vdiff(exObj, acObj).text;
          errorMessage += format.magenta("diff: ") + difference + "\n";
          const moreUsefulStack = removeUselessStackLines(assertion.error.stack);
          errorMessage += format.magenta("source: ") + format.gray(moreUsefulStack) + "\n";   
        } else {
          skipObjectDiff = true;
        }
      } catch (err) {
        console.log("error fired " + err);
        skipObjectDiff = true;
      }
    }

    if (skipObjectDiff) {
      const expected = assertion.error.expected;
      const actual = assertion.error.actual;
      //errorMessage += format.magenta("expected: ") + expected + "\n";
      const delta = vdiff(expected, actual).text;
      errorMessage += format.magenta("diff: ") + delta + "\n";
      const moreUsefulStack = removeUselessStackLines(assertion.error.stack);
      errorMessage += format.magenta("source: ") + format.gray(moreUsefulStack) + "\n"; 
    }

    errorMessage = prettifyRawError(errorMessage, 3);
    output.push(errorMessage);

    stream.failed = true;
  });

  parser.on('comment', function (comment) {
    output.push('\n' + pad('  ' + format.yellow(comment.raw)));
  });

  // All done
  parser.on('output', function (results) {

    output.push('\n\n');

    // Most likely a failure upstream
    if (results.plans.length < 1) {
      process.exit(1);
    }

    if (results.fail.length > 0) {
      output.push(formatErrors(results));
      output.push('\n');
    }

    output.push(formatTotals(results));
    output.push('\n');

    // Exit if no tests run. This is a result of 1 of 2 things:
    //  1. No tests were written
    //  2. There was some error before the TAP got to the parser
    if (results.tests.length === 0) {
      process.exit(1);
    }
  });

  // Utils

  function prettifyRawError (rawError, indentIterations=1) {

    let pretty = rawError.split('\n');
    pretty = pretty.map((line) => {
      let padded = line;
      for (let i=0; i<= indentIterations; i++) {
        padded = pad(padded);
      }
      return padded;
    });
    
    pretty = pretty.join('\n') + '\n';

    return pretty;
  }

  // this duplicates errors that we already showd.
  // @TODO : remove
  function formatErrors (results) {
    return ''; 

    var failCount = results.fail.length;
    var past = (failCount === 1) ? 'was' : 'were';
    var plural = (failCount === 1) ? 'failure' : 'failures';

    var out = '\n' + pad(format.red.bold('Failed Tests:') + ' There ' + past + ' ' + format.red.bold(failCount) + ' ' + plural + '\n');
    out += formatFailedAssertions(results);

    return out;
  }

  function formatTotals (results) {

    if (results.tests.length === 0) {
      return pad(format.red(symbols.cross + ' No tests found'));
    }

    return pad(format.green('passed: ' + results.pass.length + ',')) + 
           pad(format.red('failed: ' + results.fail.length)) +
           pad('of ' + results.asserts.length + ' tests') +
           pad(format.dim('(' + prettyMs(new Date().getTime() - startTime) + ')'));
  }

  function formatFailedAssertions (results) {

    var out = '';

    var groupedAssertions = _.groupBy(results.fail, function (assertion) {
      return assertion.test;
    });

    _.each(groupedAssertions, function (assertions, testNumber) {

      // Wrie failed assertion's test name
      var test = _.find(results.tests, {number: parseInt(testNumber)});
      out += '\n' + pad('  ' + test.name + '\n\n');

      // Write failed assertion
      _.each(assertions, function (assertion) {

        out += pad('    ' + format.red(symbols.cross) + ' ' + format.red(assertion.name)) + '\n';
      });

      out += '\n';
    });

    return out;
  }

  function pad (str) {

    return OUTPUT_PADDING + str;
  }

  return stream;
};