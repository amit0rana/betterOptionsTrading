'use strict';

process.env.TZ = 'Asia/Kolkata'; // must be set before anything constructs a Date

const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { loadDeclarations } = require('./helpers/extract.js');
const { DECLARATIONS, CASES, makeStubs } = require('./helpers/cases.js');

const golden = require('./golden/pure-functions.json');
const sourceFile = path.join(__dirname, '..', 'betterKite.user.js');

const fns = loadDeclarations(sourceFile, DECLARATIONS, makeStubs());

test('golden file covers every case', () => {
    assert.strictEqual(golden.cases.length, CASES.length, 'run `node build/capture-golden.js` if cases changed');
});

for (const [index, expected] of golden.cases.entries()) {
    const label = `${expected.fn}(${expected.args.map((a) => JSON.stringify(a)).join(', ')})`;

    test(`${label} still behaves as it did before the refactor`, () => {
        const fn = fns[expected.fn];
        assert.strictEqual(typeof fn, 'function', `${expected.fn} is missing from the userscript`);

        let actual;
        try {
            actual = fn(...expected.args);
        } catch (err) {
            actual = { __threw: err.message };
        }
        if (actual === undefined) actual = { __undefined: true };

        assert.deepStrictEqual(actual, expected.result, `case #${index} (${label}) changed behaviour`);
    });
}
