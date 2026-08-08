'use strict';

// The pure functions worth pinning down, the stubs they need, and the inputs to run
// them on. Shared by capture-golden.js (which records the answers the pre-refactor
// code gave) and pure-functions.test.js (which checks the current code still agrees).
//
// Everything here must be deterministic: no real clock, no real Intl formatting.

const FIXED_NOW_ISO = '2025-06-26T10:30:00+05:30'; // a Thursday, and June 2025's last Thursday

/** A Date whose no-arg constructor is frozen, so date-dependent code is testable. */
function makeFixedDate(iso) {
    const fixed = new Date(iso).getTime();
    return class FixedDate extends Date {
        constructor(...args) {
            if (args.length === 0) super(fixed);
            else super(...args);
        }
        static now() {
            return fixed;
        }
    };
}

/** Only `.format('YY')` is ever used, so that is all the stub implements. */
function makeMomentStub() {
    return (date) => ({
        format(token) {
            if (token === 'YY') return String(date.getFullYear() % 100).padStart(2, '0');
            throw new Error(`moment stub: unsupported token "${token}"`);
        },
    });
}

/** Stands in for Intl currency formatting, which varies with the ICU build. */
const formatterStub = {
    format(value) {
        return `INR ${Number(value).toFixed(2)}`;
    },
};

function makeStubs() {
    return {
        debug: () => {},
        info: () => {},
        Date: makeFixedDate(FIXED_NOW_ISO),
        moment: makeMomentStub(),
        formatter: formatterStub,
    };
}

// Declarations lifted out of the userscript for these tests. MONTHS is included so the
// real constant is exercised rather than a copy that could drift.
const DECLARATIONS = [
    'MONTHS',
    'closestStrike',
    'getExpiryText',
    'getLastThursday',
    'getSensibullZerodhaTradingSymbol',
    'getMarginCalculationData',
    'queryStringToJSON',
    'isLastDay',
    'createPnlText',
];

// [functionName, [args...]] -- the result of each call is what gets pinned.
const CASES = [
    ['closestStrike', [23412]],
    ['closestStrike', [23425]],
    ['closestStrike', [23437]],
    ['closestStrike', [58340, 100]],
    ['closestStrike', [0, 50]],

    ['getExpiryText', ['NIFTY 26Jun 23000 CE']],
    ['getExpiryText', ['INFY']],
    ['getExpiryText', ['BANKNIFTY 26Jun FUT']],

    ['getLastThursday', ['JAN', 2025]],
    ['getLastThursday', ['Jun', 2025]],
    ['getLastThursday', ['DEC', 2024]],
    ['getLastThursday', ['FEB', 2024]],
    ['getLastThursday', ['JUN']],

    ['getSensibullZerodhaTradingSymbol', ['NIFTY']],
    ['getSensibullZerodhaTradingSymbol', ['BHARTIARTL JUN FUT NFO']],
    ['getSensibullZerodhaTradingSymbol', ['NIFTY 8th w APR 14200 CE NFO']],
    ['getSensibullZerodhaTradingSymbol', ['BANKNIFTY JUN 30000 PE NFO']],
    ['getSensibullZerodhaTradingSymbol', ['NIFTY 24JUN 23000 CE NFO']],

    ['getMarginCalculationData', ['', 'NFO', 'NRML', 1, 1]],
    ['getMarginCalculationData', ['INFY', 'NSE', 'CNC', 10, 1500]],
    ['getMarginCalculationData', ['SBIN', 'BSE', 'CNC', 10, 800]],
    ['getMarginCalculationData', ['NIFTY JUN FUT NFO', 'NFO', 'NRML', 75, 23000]],
    ['getMarginCalculationData', ['NIFTY 8th w APR 14200 CE NFO LABELS', 'NFO', 'NRML', -75, 120]],
    ['getMarginCalculationData', ['BANKNIFTY JUN 30000 PE NFO', 'NFO', 'NRML', -15, 200]],
    ['getMarginCalculationData', ['NIFTY 24JUN 23000 CE NFO', 'NFO', 'NRML', 75, 12]],
    ['getMarginCalculationData', ['SENSEX 24JUN 80000 PE BFO', 'BFO', 'NRML', -10, 90]],
    ['getMarginCalculationData', ['NIFTY  JUN  23000  CE  NFO', 'NFO', ' NRML ', 75, 12]],

    ['queryStringToJSON', ['tradingsymbol=NIFTY25JUN23000CE&quantity=75&price=0']],
    ['queryStringToJSON', ['a=1&a=2&a=3']],
    ['queryStringToJSON', ['name=NIFTY%20BANK&empty=']],

    ['isLastDay', [4]],
    ['isLastDay', [1]],
    ['isLastDay', [3]],

    ['createPnlText', [1500, -5000, 100000]],
    ['createPnlText', [-1500, -5000, 100000]],
    ['createPnlText', [0, 0, -1]],
];

module.exports = { DECLARATIONS, CASES, makeStubs, FIXED_NOW_ISO };
