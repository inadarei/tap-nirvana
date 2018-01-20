# Tap Nirvana - Proper Reporter

A TAP reporter optimized for developer comfort above anything else. Works with
any TAP-compatible test runner, such as
[tape](https://www.npmjs.com/package/tape) or
[blue-tape](https://www.npmjs.com/package/blue-tape) (the promisified version of
tape).

## Usage:

Snippet from a package.json:

```
 "devDependencies": {
    "blue-tape": "^1.0.0",
    "tap-nirvana": "^1.0.5",
    "nyc": "^11.3.0"
  },
  "scripts": {
    "test": "nyc blue-tape test/**/*.js | tap-nirvana "
  }
```

### Features:

1. Color-coded diffs of complex objects for easy expected/actual analysis
2. Laser-sharp pointer to where exceptions occured
3. Usually gets out of your way and reduces noise.

### Screenshot

![screenshot image](screenshot-diff.jpg)

### Credit

TAP Nirvana is a fork of [Tap-Spec](https://github.com/scottcorgan/tap-spec)