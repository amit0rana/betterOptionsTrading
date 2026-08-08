// Storage keys, dropdown/margin mode constants, the sub-filter flags, and INDEX_CONFIG --
// the one table describing each tradable index (lot size, freeze quantity, expiry day,
// strike step, segment, hedge offset).

const VERSION = "v{{VERSION}}";
const GM_HOLDINGS_NAME = "BK_HOLDINGS";
const GMPositionsName = "BK_POSITIONS";
const GMRefTradeName = "BK_REF_TRADES";

// Read by debug()/info() in betterCommon.js, which Tampermonkey @requires into this
// same scope. It looks unused here because its only consumers live in that file.
// eslint-disable-next-line no-unused-vars
let D_LEVEL = D_LEVEL_NONE;
let PRO_MODE ;
let MARGIN_METHOD;

const DD_NONE = '';
const DD_HOLDINGS = 'H';
const DD_POSITONS = 'P';
const MM_BASKET = 'Basket';
const MM_CALC = 'Calculator';
var g_dropdownDisplay = DD_NONE;
var g_showOnlyMISPositions = false;
var g_showOnlyPEPositions = false;
var g_showOnlyCEPositions = false;
var g_showOnlyFUTPositions = false;
var g_showOnlyOPTPositions = false;
var g_showOnlyEXITEDPositions = false;
var g_showOnlyNRMLPositions = false;
var g_subFilter = false;
var g_subFilterData = false;
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

// One row per index, replacing what used to be six parallel `if symbol.startsWith(...)`
// ladders and twelve *_LOT_SIZE / *_QTY_FREEZE globals. Adding or retuning an index is
// a single row here.
//
//   settings      prefix of the GM_config field ids: `<prefix>_lot_size`, `<prefix>_freeze_quantity`
//   label         shown in the settings panel
//   expiryWeekday day of the week whose expiry this index carries (0=Sun), or null if it has none
//   strikeStep    strike spacing used when building an option chain in the watchlist
//   optionSegment segment sent to the marketwatch API
//   hedgeSetting  GM_config field holding the strike offset used for margin-saving hedges
//
// Key order drives the order of the generated settings fields, so keep it stable.
const INDEX_CONFIG = {
    NIFTY:      { settings: 'nifty',     label: 'Nifty',     defaultLotSize: 25, defaultFreezeQty: 1800, expiryWeekday: 4,    strikeStep: 50,  optionSegment: 'NFO-OPT', hedgeSetting: 'nf_hedge' },
    BANKNIFTY:  { settings: 'banknifty', label: 'BankNifty', defaultLotSize: 15, defaultFreezeQty: 900,  expiryWeekday: 3,    strikeStep: 50,  optionSegment: 'NFO-OPT', hedgeSetting: 'bnf_hedge' },
    FINNIFTY:   { settings: 'finnifty',  label: 'FinNifty',  defaultLotSize: 25, defaultFreezeQty: 1800, expiryWeekday: 2,    strikeStep: 50,  optionSegment: 'NFO-OPT', hedgeSetting: 'stock_hedge' },
    SENSEX:     { settings: 'sensex',    label: 'Sensex',    defaultLotSize: 10, defaultFreezeQty: 1000, expiryWeekday: 5,    strikeStep: 100, optionSegment: 'BFO-OPT', hedgeSetting: 'stock_hedge' },
    BANKEX:     { settings: 'bankex',    label: 'Bankex',    defaultLotSize: 15, defaultFreezeQty: 1000, expiryWeekday: 1,    strikeStep: 100, optionSegment: 'BFO-OPT', hedgeSetting: 'stock_hedge' },
    MIDCPNIFTY: { settings: 'midcap',    label: 'Midcap',    defaultLotSize: 75, defaultFreezeQty: 4200, expiryWeekday: null, strikeStep: 50,  optionSegment: 'NFO-OPT', hedgeSetting: 'stock_hedge' },
};

const INDEX_SYMBOLS = Object.keys(INDEX_CONFIG);

// Scrip name -> the name the same instrument goes by in the watchlist. Only these two
// are translated today; every other index is matched by its own name.
const WATCHLIST_NAME_BY_SCRIP = {
    BANKNIFTY: 'NIFTY BANK',
    NIFTY: 'NIFTY 50',
};

// Prefix of what the user types in the option-chain prompt -> the quote symbol to price
// the chain off, and the index name to add to the watchlist.
// Order matters: BANKEX must be tested before the BANK prefix that BANKNIFTY matches.
const OPTION_CHAIN_INDEX_PREFIXES = [
    ['FINN', 'NSE:NIFTY FIN SERVICE', 'NIFTY FIN SERVICE'],
    ['BANKEX', 'BSE:BANKEX', 'BANKEX'],
    ['NIFT', 'NSE:NIFTY 50', 'NIFTY 50'],
    ['BANK', 'NSE:NIFTY BANK', 'NIFTY BANK'],
    ['MID', 'NSE:NIFTY MID SELECT', 'NIFTY MID SELECT'],
    ['SENSEX', 'BSE:SENSEX', 'SENSEX'],
];

// Lot sizes and freeze quantities read from settings, filled in by the GM_config init
// handler. symbol -> { lotSize, freezeQty }.
const INDEX_LIMITS = {};

/** The index a trading symbol belongs to, or undefined for stocks. */
function indexSymbolFor(tradingsymbol) {
    if (!tradingsymbol) return undefined;
    return INDEX_SYMBOLS.find((symbol) => tradingsymbol.startsWith(symbol));
}

/**
 * Lot size and freeze quantity for a trading symbol.
 * Undefined for stocks, and also before the settings init handler has run -- callers
 * must handle that rather than reaching straight into the result.
 */
function indexLimitsFor(tradingsymbol) {
    const symbol = indexSymbolFor(tradingsymbol);
    return symbol ? INDEX_LIMITS[symbol] : undefined;
}

/** Index name whose weekly expiry falls on the given weekday, or '' if none does. */
function indexExpiringOnWeekday(weekday) {
    return INDEX_SYMBOLS.find((symbol) => INDEX_CONFIG[symbol].expiryWeekday === weekday) || '';
}

/** GM_config field definitions generated from INDEX_CONFIG, keyed by field id. */
function indexSettingsFields(suffix, labelSuffix, defaultKey) {
    const fields = {};
    for (const symbol of INDEX_SYMBOLS) {
        const cfg = INDEX_CONFIG[symbol];
        fields[`${cfg.settings}_${suffix}`] = {
            'label': `${cfg.label} ${labelSuffix}`,
            'type': 'number',
            'default': cfg[defaultKey],
        };
    }
    return fields;
}
