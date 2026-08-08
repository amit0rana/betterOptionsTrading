# betterKite architecture

`betterKite.user.js` is **generated**. Edit the modules in `src/` and run `npm run build`.

```bash
npm install     # once
npm run build   # src/ -> betterKite.user.js + betterKite.meta.js
npm run verify  # build is current + lint + tests
```

## Why it is concatenated, not bundled

Tampermonkey runs `@require`d files and the script body in a **single shared scope**, and
betterKite depends on that in both directions:

- `betterCommon.js` defines `debug()`, `info()`, `formatter`, `getCookie()`, which
  betterKite calls;
- `debug()` and `info()` read a `D_LEVEL` that **betterKite** declares.

Wrapping the output in an ES module or an IIFE would move `D_LEVEL` out of
betterCommon's reach and break every log call. So `build/build.js` concatenates the
modules verbatim and never introduces a scope. The modules are chunks of one script, not
independent units — there are no imports or exports.

Two consequences:

- **Order matters** for anything that is not a function declaration. Top-level statements
  run in manifest order, and `let gmc = await initGM()` in `src/core/13-settings.js`
  splits the script into a synchronous part and an async continuation. Everything after
  it — including the `XMLHttpRequest` patching — runs a microtask later. That is why
  `src/bootstrap/01-init.js` polls `gmc.isInit` before calling `main()`.
- **Function declarations hoist**, so they can be moved between modules freely. That is
  what makes the module layout below possible at all.

`build/check-structure.js` enforces exactly this invariant between two versions of the
built file: function bodies must be unchanged (in any order), and the remaining top-level
statements must appear in the same order.

```bash
node build/check-structure.js old.js betterKite.user.js
```

## Module layout

Build order is `build/manifest.json`. The numeric prefixes reflect that order.

| Module | Owns |
| --- | --- |
| `src/metadata.txt` | The `==UserScript==` block. Also the source of `betterKite.meta.js`. |
| `src/legal/` | Unlicense text and the SEBI disclaimer, shared by both outputs. |
| `src/runtime/` | Toastify CSS injection, the analytics beacon, `jQuery.noConflict`. |
| `src/core/10-constants.js` | Storage keys, filter flags, and `INDEX_CONFIG`. |
| `src/core/11-dom-paths.js` | Every Kite selector. **Start here when a Kite release breaks something.** |
| `src/core/12-utils.js` | Pure helpers and `waitForKeyElements`. Covered by tests. |
| `src/core/13-settings.js` | The GM_config panel and the `gmc` instance. |
| `src/core/14-stored-data.js` | Holdings categories, strategies, reference-trade tags. |
| `src/core/15-margin-api.js` | Basket / SPAN margin lookups. |
| `src/core/16-row-objects.js` | Table row → object. The only place column indices live. |
| `src/ui/` | Tooltips, toasts, and the injected stylesheet. |
| `src/features/` | One file per feature, roughly in build order. |
| `src/main.js` | Wires handlers to the DOM. Called once, after settings load. |
| `src/bootstrap/` | The visit ping and the `gmc.isInit` handover to `main()`. |
| `src/disabled/` | **Not in the build.** Features whose entry points were commented out. |

## Adding or retuning an index

`INDEX_CONFIG` in `src/core/10-constants.js` is one row per index — lot size, freeze
quantity, expiry weekday, strike step, option segment, hedge offset. It replaced six
hand-written `if (symbol.startsWith(...))` ladders and twelve parallel globals, and it
also **generates** the per-index settings fields.

Field ids (`nifty_lot_size`, `banknifty_freeze_quantity`, …) are the persistence keys in
GM_config. Renaming one silently discards whatever the user had configured, so
`test/index-config.test.js` pins the generated ids, defaults and order.

## Tests

```bash
npm test
```

Nothing here needs a browser or a Kite login.

- `test/pure-functions.test.js` compares the pure functions against
  `test/golden/pure-functions.json`, which was captured from the **pre-refactor** script.
  A change there means behaviour moved. Regenerate deliberately, never reflexively:

  ```bash
  node build/capture-golden.js
  ```

- `test/index-config.test.js` transcribes the original per-index ladders and asserts the
  table-driven versions still agree with them.

Both work by lifting named declarations out of the built file and evaluating them with
stubbed dependencies (`test/helpers/extract.js`) — the script itself cannot be
`require()`d, because it is full of top-level side effects.

## Things deliberately left alone

Preserved as-is during the v5.08 cleanup, because changing them would change behaviour:

- **EXITED and NRML sub-filters look broken.** The dropdown offers them, but the `switch`
  in `src/main.js` has no case for either, so they fall through to `default:` and filter
  rows against the literal string `"exited"`, hiding everything.
  `g_showOnlyEXITEDPositions` and `g_showOnlyNRMLPositions` are never set to `true`.
- **BANKNIFTY uses a 50-point strike step** in the option-chain builder, where 100 would
  match the real strike spacing. `INDEX_CONFIG` keeps 50, as the old code did.
- **`scrip` for already-numeric expiries** comes out as `NIFTY2524JUN` — the year is
  inserted even though the expiry already carries one. Pinned by a golden test so it
  cannot change by accident.
- **Watchlist naming is inconsistent**: only NIFTY and BANKNIFTY get their nice names
  (`NIFTY 50`, `NIFTY BANK`); FINNIFTY and MIDCPNIFTY are matched by their scrip names.
- **The analytics beacon** in `src/runtime/01-analytics.js` sends `document.title`, which
  is set to the current P&L. Its `options` variable is a string, so the anonymisation
  flags never apply, and the Universal Analytics property stopped accepting data in 2023.
