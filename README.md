# tap-nirvana

A TAP reporter optimized for developer comfort above anything else. Works with
any TAP-compatible test runner, such as
[tape](https://www.npmjs.com/package/tape) or
[blue-tape](https://www.npmjs.com/package/blue-tape) (the promisified version of
tape).

## Usage:

```
blue-tape test/**/*.js | tap-diff
```

### Features:

1. Color-coded diffs of complex objects for easy expected/actual analysis
2. Laser-sharp pointer to where exceptions occured
3. Usually gets out of your way and reduces noise.

### Screenshot

![screenshot image](screenshot-diff.jpg)
