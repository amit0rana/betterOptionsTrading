'use strict';

// Globals that Tampermonkey puts in scope via @require, plus the helpers
// betterCommon.js defines. See docs/ARCHITECTURE.md for why these are globals
// rather than imports.
const USERSCRIPT_GLOBALS = {
    GM_config: 'readonly',
    jQuery: 'readonly',
    jQ: 'writable',
    axios: 'readonly',
    qs: 'readonly',
    moment: 'readonly',
    tippy: 'readonly',
    Swal: 'readonly',
    Toastify: 'readonly',
    sha256: 'readonly',
    // betterCommon.js
    D_LEVEL_INFO: 'readonly',
    D_LEVEL_DEBUG: 'readonly',
    D_LEVEL_NONE: 'readonly',
    log: 'readonly',
    debug: 'readonly',
    info: 'readonly',
    formatter: 'readonly',
    reloadPage: 'readonly',
    getCookie: 'readonly',
};

module.exports = {
    root: true,
    env: { es2022: true },
    parserOptions: { ecmaVersion: 2022, sourceType: 'script' },
    ignorePatterns: [
        'node_modules/',
        'betterKite.meta.js',
        // Userscripts for other platforms, not yet migrated to src/.
        'betterNSE.user.js',
        'betterNSE.meta.js',
        'betterOipulse.user.js',
        'betterSensibull.user.js',
        'betterSensibull.meta.js',
        'betterSharekhan.user.js',
        'betterSharekhan.meta.js',
        'betterStocksDeveloper.user.js',
        'betterStocksDeveloper.meta.js',
        'betterTradingeconomics.user.js',
        'betterTradingeconomics.meta.js',
        'betterUpstox.user.js',
        'betterUpstox.meta.js',
        'minimalGA.js',
        'minimalGA.min.js',
    ],
    rules: {
        'no-undef': 'error',
        'no-unused-vars': ['error', { args: 'none' }],
        'no-redeclare': 'error',
        'no-unreachable': 'error',
        'no-dupe-keys': 'error',
        'no-dupe-else-if': 'error',
        'no-duplicate-case': 'error',
        'no-self-assign': 'error',
        'no-constant-condition': ['error', { checkLoops: false }],
        'no-empty': ['error', { allowEmptyCatch: true }],
        'no-fallthrough': 'error',
    },
    overrides: [
        {
            // The built userscript: the artifact Tampermonkey actually runs, and the
            // only place cross-module references resolve. It therefore gets the full
            // no-undef / no-unused-vars check. sourceType is 'module' purely so espree
            // accepts the top-level `await initGM()`.
            files: ['betterKite.user.js'],
            env: { browser: true, greasemonkey: true },
            parserOptions: { sourceType: 'module' },
            globals: USERSCRIPT_GLOBALS,
        },
        {
            // src modules are fragments of the built file, so a reference may
            // legitimately be defined in a sibling module. Syntax and logic rules
            // still apply; name resolution is enforced on the built file above.
            files: ['src/**/*.js'],
            env: { browser: true, greasemonkey: true },
            parserOptions: { sourceType: 'module' },
            globals: USERSCRIPT_GLOBALS,
            rules: {
                'no-undef': 'off',
                'no-unused-vars': 'off',
            },
        },
        {
            // @require'd ahead of betterKite and shares its scope. D_LEVEL is declared
            // by the consumer, not here.
            files: ['betterCommon.js'],
            env: { browser: true },
            globals: { D_LEVEL: 'readonly' },
        },
        {
            files: ['build/**/*.js', 'test/**/*.js'],
            env: { node: true },
        },
    ],
};
