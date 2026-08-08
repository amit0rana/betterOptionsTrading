'use strict';

// Records what the pure functions currently return, so a refactor can be checked
// against the behaviour that shipped rather than against someone's memory of it.
//
//   node build/capture-golden.js [sourceFile]
//
// Run this once against the pre-refactor script. Re-running it after a change
// overwrites the evidence, so only do that when a behaviour change is intended --
// the diff on test/golden/pure-functions.json is then the record of what changed.

process.env.TZ = 'Asia/Kolkata'; // must be set before anything constructs a Date

const fs = require('fs');
const path = require('path');
const { loadDeclarations } = require('../test/helpers/extract.js');
const { DECLARATIONS, CASES, makeStubs } = require('../test/helpers/cases.js');

const sourceFile = path.resolve(process.argv[2] || path.join(__dirname, '..', 'betterKite.user.js'));
const outFile = path.join(__dirname, '..', 'test', 'golden', 'pure-functions.json');

const fns = loadDeclarations(sourceFile, DECLARATIONS, makeStubs());

const results = CASES.map(([name, args]) => {
    if (typeof fns[name] !== 'function') {
        throw new Error(`capture: "${name}" did not evaluate to a function`);
    }
    let value;
    try {
        value = fns[name](...args);
    } catch (err) {
        value = { __threw: err.message };
    }
    return { fn: name, args, result: value === undefined ? { __undefined: true } : value };
});

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(
    outFile,
    JSON.stringify({ capturedFrom: path.basename(sourceFile), cases: results }, null, 2) + '\n'
);

console.log(`Captured ${results.length} cases from ${path.basename(sourceFile)} -> ${path.relative(process.cwd(), outFile)}`);
