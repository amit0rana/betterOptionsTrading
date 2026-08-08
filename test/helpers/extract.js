'use strict';

// betterKite is a userscript: one flat scope, no exports, and a pile of top-level
// side effects (GM_* calls, XHR patching, an analytics beacon) that make the file
// impossible to simply require() from a test.
//
// So instead of loading the file, we lift named top-level declarations out of it by
// text and evaluate just those in a sandbox with stubbed dependencies. That lets the
// pure logic -- symbol parsing, margin payload construction, date maths -- be pinned
// down by tests without a browser, and it works identically against the pre-refactor
// file and the post-refactor src/ modules.

const fs = require('fs');

/**
 * Finds a top-level `function NAME`, `const NAME =`, `let NAME =` or `var NAME =`
 * declaration and returns its full source text.
 *
 * Ends the declaration where bracket depth returns to zero, or at the first top-level
 * `;` for declarations that never open a bracket. Strings, template literals, comments
 * and regex literals are skipped so their brackets do not count.
 */
function extractDeclaration(source, name) {
    const lines = source.split('\n');
    const startPattern = new RegExp(
        `^(?:async\\s+)?(?:function\\s+${name}\\s*\\(|(?:const|let|var)\\s+${name}\\s*=)`
    );

    let startLine = -1;
    for (let i = 0; i < lines.length; i++) {
        if (startPattern.test(lines[i])) {
            startLine = i;
            break;
        }
    }
    if (startLine === -1) {
        throw new Error(`extract: could not find a top-level declaration of "${name}"`);
    }

    const text = lines.slice(startLine).join('\n');
    const end = findDeclarationEnd(text, name);
    return text.slice(0, end);
}

// Parentheses are deliberately not counted: a `function name(args)` header would
// otherwise look like a complete declaration before its body is reached.
const OPENERS = '{[';
const CLOSERS = '}]';

function findDeclarationEnd(text, name) {
    let depth = 0;
    let openedSomething = false;

    for (let i = 0; i < text.length; i++) {
        const ch = text[i];

        if (ch === '/' && text[i + 1] === '/') {
            i = skipLineComment(text, i);
            continue;
        }
        if (ch === '/' && text[i + 1] === '*') {
            i = skipBlockComment(text, i);
            continue;
        }
        if (ch === '"' || ch === "'") {
            i = skipQuoted(text, i, ch);
            continue;
        }
        if (ch === '`') {
            i = skipTemplate(text, i);
            continue;
        }
        if (ch === '/' && looksLikeRegexStart(text, i)) {
            i = skipRegex(text, i);
            continue;
        }

        if (OPENERS.includes(ch)) {
            depth++;
            openedSomething = true;
        } else if (CLOSERS.includes(ch)) {
            depth--;
            if (depth === 0 && openedSomething) {
                // Swallow a trailing `;` so `const f = () => {...};` stays valid.
                return text[i + 1] === ';' ? i + 2 : i + 1;
            }
        } else if (ch === ';' && depth === 0) {
            return i + 1;
        }
    }
    throw new Error(`extract: declaration of "${name}" is never closed`);
}

function skipLineComment(text, i) {
    const nl = text.indexOf('\n', i);
    return nl === -1 ? text.length : nl;
}

function skipBlockComment(text, i) {
    const end = text.indexOf('*/', i + 2);
    return end === -1 ? text.length : end + 1;
}

function skipQuoted(text, i, quote) {
    for (let j = i + 1; j < text.length; j++) {
        if (text[j] === '\\') {
            j++;
            continue;
        }
        if (text[j] === quote) return j;
        if (text[j] === '\n') return j - 1; // unterminated; let the parser complain later
    }
    return text.length;
}

/** Template literals may contain `${ ... }` placeholders holding real code, including
 *  nested templates, so this recurses rather than scanning for the closing backtick. */
function skipTemplate(text, i) {
    for (let j = i + 1; j < text.length; j++) {
        if (text[j] === '\\') {
            j++;
            continue;
        }
        if (text[j] === '`') return j;
        if (text[j] === '$' && text[j + 1] === '{') {
            j = skipBalanced(text, j + 1);
        }
    }
    return text.length;
}

/** Given the index of a `{`, returns the index of its matching `}`. */
function skipBalanced(text, i) {
    let depth = 0;
    for (let j = i; j < text.length; j++) {
        const ch = text[j];
        if (ch === '"' || ch === "'") {
            j = skipQuoted(text, j, ch);
            continue;
        }
        if (ch === '`') {
            j = skipTemplate(text, j);
            continue;
        }
        if (ch === '{') depth++;
        else if (ch === '}') {
            depth--;
            if (depth === 0) return j;
        }
    }
    return text.length;
}

/** Distinguishes a regex literal from a division operator by the preceding token. */
function looksLikeRegexStart(text, i) {
    for (let j = i - 1; j >= 0; j--) {
        const ch = text[j];
        if (/\s/.test(ch)) continue;
        return !/[\w$)\]]/.test(ch);
    }
    return true;
}

function skipRegex(text, i) {
    let inClass = false;
    for (let j = i + 1; j < text.length; j++) {
        const ch = text[j];
        if (ch === '\\') {
            j++;
            continue;
        }
        if (ch === '[') inClass = true;
        else if (ch === ']') inClass = false;
        else if (ch === '/' && !inClass) return j;
        else if (ch === '\n') return i; // not a regex after all
    }
    return text.length;
}

/**
 * Evaluates the named declarations in a sandbox.
 * @param {string} file        path to read
 * @param {string[]} names     top-level declarations to lift out
 * @param {object} stubs       name -> value for everything those declarations reference
 * @returns {object}           name -> evaluated value
 */
function loadDeclarations(file, names, stubs = {}) {
    const source = fs.readFileSync(file, 'utf8');
    const blocks = names.map((name) => extractDeclaration(source, name));

    const stubNames = Object.keys(stubs);
    const body = `${blocks.join('\n\n')}\nreturn { ${names.join(', ')} };`;

    let factory;
    try {
        factory = new Function(...stubNames, body);
    } catch (err) {
        throw new Error(`extract: lifted source from ${file} does not parse: ${err.message}`);
    }
    return factory(...stubNames.map((n) => stubs[n]));
}

module.exports = { extractDeclaration, loadDeclarations };
