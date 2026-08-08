'use strict';

// Builds betterKite.user.js and betterKite.meta.js from the modules in src/.
//
//   node build/build.js           write both files
//   node build/build.js --check   verify the checked-in files match src/ (exit 1 if not)
//
// The modules are concatenated, not bundled. That is deliberate: Tampermonkey runs
// @require'd files and the script body in one shared scope, and betterCommon.js relies
// on that -- its debug()/info() read a D_LEVEL that betterKite declares. Wrapping the
// output in a module or IIFE would put D_LEVEL out of betterCommon's reach and break
// every log call. So the build must not introduce a scope.
//
// Concatenation order is the manifest order and it matters: top-level statements run in
// that order, and `let gmc = await initGM()` splits the script into a synchronous part
// and an async continuation. Only function declarations, which hoist, can move freely.
// build/check-structure.js verifies that invariant between two builds.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const MANIFEST = path.join(__dirname, 'manifest.json');
const USER_SCRIPT = path.join(ROOT, 'betterKite.user.js');
const META_SCRIPT = path.join(ROOT, 'betterKite.meta.js');

// betterKite.meta.js is what Tampermonkey fetches to check for updates. It must carry
// the same metadata block as the user script; generating both from src/metadata.txt is
// what stops the two drifting apart (they already had, over @grant lines).
const META_PARTS = ['src/metadata.txt', 'src/legal/unlicense.txt', 'src/legal/disclaimer.txt'];

function read(relativePath) {
    return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

/** package.json is the single source of truth for the version. */
function version() {
    return JSON.parse(read('package.json')).version;
}

function substitute(text) {
    return text.split('{{VERSION}}').join(version());
}

function buildUserScript(files) {
    return substitute(files.map(read).join('\n'));
}

function buildMetaScript() {
    return substitute(META_PARTS.map(read).join('\n'));
}

/** Syntax-checks the built script. `node --check` cannot: it rejects top-level await. */
function assertParses(source) {
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    try {
        new AsyncFunction(source);
    } catch (err) {
        throw new Error(`built userscript does not parse: ${err.message}`);
    }
}

function main() {
    const check = process.argv.includes('--check');
    const { files } = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));

    const userScript = buildUserScript(files);
    const metaScript = buildMetaScript();
    assertParses(userScript);

    if (check) {
        const problems = [];
        if (fs.readFileSync(USER_SCRIPT, 'utf8') !== userScript) problems.push('betterKite.user.js');
        if (fs.readFileSync(META_SCRIPT, 'utf8') !== metaScript) problems.push('betterKite.meta.js');

        if (problems.length) {
            console.error(`Out of date with src/: ${problems.join(', ')}`);
            console.error('Run `npm run build`.');
            process.exit(1);
        }
        console.log(`betterKite.user.js and betterKite.meta.js are up to date with src/ (v${version()})`);
        return;
    }

    fs.writeFileSync(USER_SCRIPT, userScript);
    fs.writeFileSync(META_SCRIPT, metaScript);
    console.log(
        `Built v${version()} from ${files.length} modules -> betterKite.user.js (${userScript.split('\n').length} lines), betterKite.meta.js`
    );
}

main();
