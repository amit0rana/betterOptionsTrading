'use strict';

// INDEX_CONFIG replaced six hand-written `if (symbol.startsWith(...))` ladders and two
// blocks of parallel settings fields. The golden tests cannot cover those, because none
// of it was a callable function before.
//
// So instead this file transcribes the ORIGINAL ladders verbatim from the pre-refactor
// script and asserts the table-driven versions agree with them everywhere. If a row in
// INDEX_CONFIG is wrong, one of these fails.

const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { loadDeclarations } = require('./helpers/extract.js');

const sourceFile = path.join(__dirname, '..', 'betterKite.user.js');

const {
    INDEX_CONFIG,
    INDEX_SYMBOLS,
    WATCHLIST_NAME_BY_SCRIP,
    OPTION_CHAIN_INDEX_PREFIXES,
    indexSymbolFor,
    indexExpiringOnWeekday,
    indexSettingsFields,
} = loadDeclarations(
    sourceFile,
    [
        'INDEX_CONFIG',
        'INDEX_SYMBOLS',
        'WATCHLIST_NAME_BY_SCRIP',
        'OPTION_CHAIN_INDEX_PREFIXES',
        'indexSymbolFor',
        'indexExpiringOnWeekday',
        'indexSettingsFields',
    ],
    {}
);

// ---------------------------------------------------------------------------
// Reference implementations, copied from betterKite.user.js v5.08.
// ---------------------------------------------------------------------------

const indices = ['NIFTY', 'BANKNIFTY', 'FINNIFTY', 'SENSEX', 'BANKEX', 'MIDCPNIFTY'];
const [NIFTY, BANKNIFTY, FINNIFTY, SENSEX, BANKEX, MIDCPNIFTY] = indices;

const ORIGINAL_LOT_SIZE = { NIFTY: 25, BANKNIFTY: 15, FINNIFTY: 25, SENSEX: 10, BANKEX: 15, MIDCAP: 75 };
const ORIGINAL_FREEZE = { NIFTY: 1800, BANKNIFTY: 900, FINNIFTY: 1800, SENSEX: 1000, BANKEX: 1000, MIDCAP: 4200 };

/** showLotsTippy() */
function originalLots(instrument, quantity) {
    if (instrument.startsWith(NIFTY)) return Math.abs(quantity / ORIGINAL_LOT_SIZE.NIFTY);
    else if (instrument.startsWith(BANKNIFTY)) return Math.abs(quantity / ORIGINAL_LOT_SIZE.BANKNIFTY);
    else if (instrument.startsWith(FINNIFTY)) return Math.abs(quantity / ORIGINAL_LOT_SIZE.FINNIFTY);
    else if (instrument.startsWith(SENSEX)) return Math.abs(quantity / ORIGINAL_LOT_SIZE.SENSEX);
    else if (instrument.startsWith(BANKEX)) return Math.abs(quantity / ORIGINAL_LOT_SIZE.BANKEX);
    else if (instrument.startsWith(MIDCPNIFTY)) return Math.abs(quantity / ORIGINAL_LOT_SIZE.MIDCAP);
    return 0;
}

/** sendPlaceNewOrderRequest() */
function originalFreezeLimit(tradingsymbol, qty) {
    if (tradingsymbol.startsWith(BANKNIFTY)) return ORIGINAL_FREEZE.BANKNIFTY;
    else if (tradingsymbol.startsWith(NIFTY)) return ORIGINAL_FREEZE.NIFTY;
    else if (tradingsymbol.startsWith(FINNIFTY)) return ORIGINAL_FREEZE.FINNIFTY;
    else if (tradingsymbol.startsWith(SENSEX)) return ORIGINAL_FREEZE.SENSEX;
    else if (tradingsymbol.startsWith(MIDCPNIFTY)) return ORIGINAL_FREEZE.MIDCAP;
    else if (tradingsymbol.startsWith(BANKEX)) return ORIGINAL_FREEZE.BANKEX;
    return qty;
}

/** addAltOptionChain() weekday switch */
function originalExpirySymbol(weekday) {
    switch (weekday) {
        case 1: return BANKEX;
        case 2: return FINNIFTY;
        case 3: return BANKNIFTY;
        case 4: return NIFTY;
        case 5: return SENSEX;
        default: return '';
    }
}

/** addAltOptionChain() strike spacing */
function originalStrikeStep(h) {
    return h.startsWith(BANKEX) || h.startsWith(SENSEX) ? 100 : 50;
}

/** buildWatchlistEntry() segment */
function originalSegment(tradingsymbol) {
    return tradingsymbol.startsWith(BANKEX) || tradingsymbol.startsWith(SENSEX) ? 'BFO-OPT' : 'NFO-OPT';
}

/** checkMarginSaving() hedge offset */
function originalHedgeSetting(symbol) {
    if (symbol == 'NIFTY') return 'nf_hedge';
    else if (symbol == 'BANKNIFTY') return 'bnf_hedge';
    return 'stock_hedge';
}

/** createPositionsDropdown() watchlist naming */
function originalWatchlistName(ts) {
    if (ts == BANKNIFTY) return 'NIFTY BANK';
    else if (ts == NIFTY) return 'NIFTY 50';
    return ts;
}

/** addAltOptionChain() symbol prefix ladder */
function originalOptionChainSymbols(sym) {
    if (sym.startsWith('FINN')) return ['NSE:NIFTY FIN SERVICE', 'NIFTY FIN SERVICE'];
    else if (sym.startsWith(BANKEX)) return ['BSE:BANKEX', BANKEX];
    else if (sym.startsWith('NIFT')) return ['NSE:NIFTY 50', 'NIFTY 50'];
    else if (sym.startsWith('BANK')) return ['NSE:NIFTY BANK', 'NIFTY BANK'];
    else if (sym.startsWith('MID')) return ['NSE:NIFTY MID SELECT', 'NIFTY MID SELECT'];
    else if (sym.startsWith(SENSEX)) return ['BSE:SENSEX', SENSEX];
    return [sym, ''];
}

// ---------------------------------------------------------------------------

// Real trading symbols plus the stocks and edge cases that must NOT match an index.
const SYMBOLS = [
    'NIFTY25JUN23000CE', 'NIFTY25JUNFUT', 'NIFTY',
    'BANKNIFTY25JUN52000PE', 'BANKNIFTY',
    'FINNIFTY25JUN23000CE', 'FINNIFTY',
    'SENSEX25JUN80000CE', 'SENSEX',
    'BANKEX25JUN58000PE', 'BANKEX',
    'MIDCPNIFTY25JUN12000CE', 'MIDCPNIFTY',
    'INFY', 'RELIANCE', 'SBIN25JUNFUT', 'NIFTYBEES', 'BANKBEES', '',
];

test('lot-size lookup matches the original ladder', () => {
    const limits = defaultLimits();
    for (const symbol of SYMBOLS) {
        for (const qty of [75, -150, 0]) {
            const index = indexSymbolFor(symbol);
            const actual = index ? Math.abs(qty / limits[index].lotSize) : 0;
            assert.strictEqual(actual, originalLots(symbol, qty), `lots for ${symbol} qty ${qty}`);
        }
    }
});

test('freeze-quantity lookup matches the original ladder', () => {
    const limits = defaultLimits();
    for (const symbol of SYMBOLS) {
        const qty = 5000;
        const index = indexSymbolFor(symbol);
        const actual = index ? limits[index].freezeQty : qty;
        assert.strictEqual(actual, originalFreezeLimit(symbol, qty), `freeze limit for ${symbol}`);
    }
});

test('expiry weekday mapping matches the original switch', () => {
    for (let weekday = 0; weekday <= 6; weekday++) {
        assert.strictEqual(indexExpiringOnWeekday(weekday), originalExpirySymbol(weekday), `weekday ${weekday}`);
    }
});

test('strike step matches the original BANKEX/SENSEX check', () => {
    for (const symbol of SYMBOLS) {
        const actual = INDEX_CONFIG[indexSymbolFor(symbol)]?.strikeStep ?? 50;
        assert.strictEqual(actual, originalStrikeStep(symbol), `strike step for ${symbol}`);
    }
});

test('option segment matches the original BANKEX/SENSEX check', () => {
    for (const symbol of SYMBOLS) {
        const actual = INDEX_CONFIG[indexSymbolFor(symbol)]?.optionSegment ?? 'NFO-OPT';
        assert.strictEqual(actual, originalSegment(symbol), `segment for ${symbol}`);
    }
});

test('hedge setting matches the original NIFTY/BANKNIFTY/else ladder', () => {
    for (const symbol of [...INDEX_SYMBOLS, 'INFY', 'RELIANCE']) {
        const actual = INDEX_CONFIG[symbol]?.hedgeSetting ?? 'stock_hedge';
        assert.strictEqual(actual, originalHedgeSetting(symbol), `hedge setting for ${symbol}`);
    }
});

test('watchlist naming matches the original two-case mapping', () => {
    for (const symbol of [...INDEX_SYMBOLS, 'INFY', 'NIFTY 50']) {
        assert.strictEqual(WATCHLIST_NAME_BY_SCRIP[symbol] || symbol, originalWatchlistName(symbol), symbol);
    }
});

test('option-chain prefix table matches the original if/else chain, order included', () => {
    const typed = ['NIFTY', 'NIFT', 'BANKNIFTY', 'BANK', 'FINNIFTY', 'FINN', 'MIDCPNIFTY', 'MID',
                   'SENSEX', 'BANKEX', 'INFY', 'CRUDEOIL'];
    for (const sym of typed) {
        const match = OPTION_CHAIN_INDEX_PREFIXES.find(([prefix]) => sym.startsWith(prefix));
        const actual = match ? [match[1], match[2]] : [sym, ''];
        assert.deepStrictEqual(actual, originalOptionChainSymbols(sym), `option chain symbols for ${sym}`);
    }
});

test('generated settings fields keep the original ids, defaults and order', () => {
    // Field ids are the persistence keys in GM_config: changing one silently discards
    // whatever the user had configured.
    assert.deepStrictEqual(Object.keys(indexSettingsFields('freeze_quantity', 'Qty Freeze', 'defaultFreezeQty')), [
        'nifty_freeze_quantity',
        'banknifty_freeze_quantity',
        'finnifty_freeze_quantity',
        'sensex_freeze_quantity',
        'bankex_freeze_quantity',
        'midcap_freeze_quantity',
    ]);
    assert.deepStrictEqual(Object.keys(indexSettingsFields('lot_size', 'lot size', 'defaultLotSize')), [
        'nifty_lot_size',
        'banknifty_lot_size',
        'finnifty_lot_size',
        'sensex_lot_size',
        'bankex_lot_size',
        'midcap_lot_size',
    ]);

    const freeze = indexSettingsFields('freeze_quantity', 'Qty Freeze', 'defaultFreezeQty');
    const lots = indexSettingsFields('lot_size', 'lot size', 'defaultLotSize');
    for (const symbol of INDEX_SYMBOLS) {
        const prefix = INDEX_CONFIG[symbol].settings;
        const legacyKey = symbol === 'MIDCPNIFTY' ? 'MIDCAP' : symbol;
        assert.strictEqual(freeze[`${prefix}_freeze_quantity`].default, ORIGINAL_FREEZE[legacyKey], symbol);
        assert.strictEqual(lots[`${prefix}_lot_size`].default, ORIGINAL_LOT_SIZE[legacyKey], symbol);
        assert.strictEqual(freeze[`${prefix}_freeze_quantity`].type, 'number');
        assert.strictEqual(lots[`${prefix}_lot_size`].type, 'number');
    }
});

/** INDEX_LIMITS as the GM_config init handler would fill it, using the defaults. */
function defaultLimits() {
    const limits = {};
    for (const symbol of INDEX_SYMBOLS) {
        limits[symbol] = {
            lotSize: INDEX_CONFIG[symbol].defaultLotSize,
            freezeQty: INDEX_CONFIG[symbol].defaultFreezeQty,
        };
    }
    return limits;
}
