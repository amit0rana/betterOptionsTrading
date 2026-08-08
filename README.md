Disclaimer: I have made this tool for my personal use, it may have bugs. 

This repository has 2 userscripts
* [For Zerodha](https://github.com/amit0rana/betterOptionsTrading/blob/master/betterKite.md)
* [For Upstox](https://github.com/amit0rana/betterOptionsTrading/blob/master/betterUpstox.md)
* [For Sensibull](https://github.com/amit0rana/betterOptionsTrading/blob/master/betterSensibull.md)
* [For NSEIndia site] (https://github.com/amit0rana/betterOptionsTrading/blob/master/betterNSE.md)

------
# Developing betterKite

`betterKite.user.js` is **generated** from the modules in `src/`. Editing it directly
will be overwritten on the next build.

```bash
npm install
npm run build    # src/ -> betterKite.user.js + betterKite.meta.js
npm run verify   # build is current + lint + tests
```

| Command | What it does |
| --- | --- |
| `npm run build` | Rebuilds both output files from `src/`. |
| `npm run check` | Fails if the checked-in outputs are stale. |
| `npm run lint` | ESLint over the built script, `betterCommon.js`, `src/`, `build/`, `test/`. |
| `npm test` | Behaviour tests. No browser or Kite login needed. |
| `npm run format` | Prettier. Not yet applied to `src/` — see below. |

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the module layout, why the build
concatenates rather than bundles, and the list of known-odd behaviour that was
deliberately preserved.

**Faster edit loop:** rather than pasting into the Tampermonkey editor, point a small
loader userscript at your working copy with
`// @require file:///path/to/betterOptionsTrading/betterKite.user.js` (needs "Allow
access to file URLs" enabled for the Tampermonkey extension). Every `npm run build` is
then live on the next page refresh.

`src/` has not been run through Prettier yet, to keep the cleanup diff readable.
`npm run format` will do it whenever you want that as its own commit.
