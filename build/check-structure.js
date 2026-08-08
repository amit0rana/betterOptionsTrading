'use strict';

// Structural diff between two versions of the userscript.
//
//   node build/check-structure.js <before.js> <after.js>
//
// betterKite runs as one flat script, so two things determine its behaviour:
//
//   1. the body of each top-level function, and
//   2. the order of everything that is NOT a function declaration -- variable
//      initialisers, the GA beacon, the XHR patching, waitForKeyElements() calls.
//
// Function declarations are hoisted, so moving one between modules cannot change
// behaviour. Moving anything else can. This script checks exactly that: function
// bodies must be unchanged (in any order), and the remaining top-level statements
// must appear in the same order with the same text.
//
// Used to prove that regrouping code into src/ modules was a pure move.

const fs = require('fs');
const espree = require('espree');

const PARSE_OPTIONS = { ecmaVersion: 2022, sourceType: 'module', range: true };

function summarise(file) {
    const source = fs.readFileSync(file, 'utf8');
    const program = espree.parse(source, PARSE_OPTIONS);

    const functions = new Map();
    const statements = [];

    for (const node of program.body) {
        // A stray `;` after a function declaration parses as an empty statement and
        // does nothing at all, so it is not worth reporting as a difference.
        if (node.type === 'EmptyStatement') continue;

        const text = source.slice(node.range[0], node.range[1]);
        if (node.type === 'FunctionDeclaration') {
            functions.set(node.id.name, normalise(text));
        } else {
            statements.push(normalise(text));
        }
    }
    return { functions, statements };
}

/** Ignore whitespace-only differences: trailing spaces, and runs of blank lines. */
function normalise(text) {
    return text
        .replace(/\r\n/g, '\n')
        .replace(/[ \t]+$/gm, '')
        .replace(/\n{2,}/g, '\n\n')
        .trim();
}

function main() {
    const [beforeFile, afterFile] = process.argv.slice(2);
    if (!beforeFile || !afterFile) {
        console.error('usage: node build/check-structure.js <before.js> <after.js>');
        process.exit(2);
    }

    const before = summarise(beforeFile);
    const after = summarise(afterFile);
    const problems = [];

    for (const [name, text] of before.functions) {
        if (!after.functions.has(name)) problems.push(`function removed: ${name}`);
        else if (after.functions.get(name) !== text) problems.push(`function body changed: ${name}`);
    }
    for (const name of after.functions.keys()) {
        if (!before.functions.has(name)) problems.push(`function added: ${name}`);
    }

    if (before.statements.length !== after.statements.length) {
        problems.push(
            `top-level statement count changed: ${before.statements.length} -> ${after.statements.length}`
        );
    }
    const shared = Math.min(before.statements.length, after.statements.length);
    for (let i = 0; i < shared; i++) {
        if (before.statements[i] !== after.statements[i]) {
            problems.push(
                `top-level statement #${i} changed or moved:\n    before: ${preview(before.statements[i])}\n    after:  ${preview(after.statements[i])}`
            );
        }
    }

    console.log(
        `${before.functions.size} functions, ${before.statements.length} top-level statements compared`
    );
    if (problems.length) {
        console.error(`\nSTRUCTURAL DIFFERENCES (${problems.length}):`);
        for (const problem of problems) console.error(`  - ${problem}`);
        process.exit(1);
    }
    console.log('No structural differences: same functions, same statement order.');
}

function preview(text) {
    const firstLine = text.split('\n')[0];
    return firstLine.length > 90 ? firstLine.slice(0, 90) + '...' : firstLine;
}

main();
