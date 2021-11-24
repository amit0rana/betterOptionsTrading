// ==UserScript==
// @name         betterKite
// @namespace    https://github.com/amit0rana/betterKite
// @version      3.32
// @description  Introduces small features on top of kite app
// @author       Amit
// @match        https://kite.zerodha.com/*
// @match        https://console.zerodha.com/*
// @match        https://insights.sensibull.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @require      https://raw.githubusercontent.com/amit0rana/betterOptionsTrading/master/betterCommon.js
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js
// @require      https://raw.githubusercontent.com/amit0rana/MonkeyConfig/master/monkeyconfig.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/axios/0.21.1/axios.min.js
// @require      https://raw.githubusercontent.com/kawanet/qs-lite/master/dist/qs-lite.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.27.0/moment.min.js
// @downloadURL  https://github.com/amit0rana/betterOptionsTrading/raw/master/betterKite.user.js
// @updateURL    https://github.com/amit0rana/betterOptionsTrading/raw/master/betterKite.meta.js
// ==/UserScript==

var context = window, options = "{    anonymizeIp: true,    colorDepth: true,    characterSet: true,    screenSize: true,    language: true}"; const hhistory = context.history, doc = document, nav = navigator || {}, storage = localStorage, encode = encodeURIComponent, pushState = hhistory.pushState, typeException = "exception", generateId = () => Math.random().toString(36), getId = () => (storage.cid || (storage.cid = generateId()), storage.cid), serialize = e => { var t = []; for (var o in e) e.hasOwnProperty(o) && void 0 !== e[o] && t.push(encode(o) + "=" + encode(e[o])); return t.join("&") }, track = (e, t, o, n, i, a, r) => { const c = "https://www.google-analytics.com/collect", s = serialize({ v: "1", ds: "web", aip: options.anonymizeIp ? 1 : void 0, tid: "UA-176741575-1", cid: getId(), t: e || "pageview", sd: options.colorDepth && screen.colorDepth ? `${screen.colorDepth}-bits` : void 0, dr: doc.referrer || void 0, dt: doc.title, dl: doc.location.origin + doc.location.pathname + doc.location.search, ul: options.language ? (nav.language || "").toLowerCase() : void 0, de: options.characterSet ? doc.characterSet : void 0, sr: options.screenSize ? `${(context.screen || {}).width}x${(context.screen || {}).height}` : void 0, vp: options.screenSize && context.visualViewport ? `${(context.visualViewport || {}).width}x${(context.visualViewport || {}).height}` : void 0, ec: t || void 0, ea: o || void 0, el: n || void 0, ev: i || void 0, exd: a || void 0, exf: void 0 !== r && !1 == !!r ? 0 : void 0 }); if (nav.sendBeacon) nav.sendBeacon(c, s); else { var d = new XMLHttpRequest; d.open("POST", c, !0), d.send(s) } }, tEv = (e, t, o, n) => track("event", e, t, o, n), tEx = (e, t) => track(typeException, null, null, null, null, e, t); hhistory.pushState = function (e) { return "function" == typeof history.onpushstate && hhistory.onpushstate({ state: e }), setTimeout(track, options.delay || 10), pushState.apply(hhistory, arguments) }, track(), context.ma = { tEv: tEv, tEx: tEx };

window.jQ = jQuery.noConflict(true);
const VERSION = "v3.32";
const GM_HOLDINGS_NAME = "BK_HOLDINGS";
const GMPositionsName = "BK_POSITIONS";
const GMRefTradeName = "BK_REF_TRADES";

const DD_NONE = '';
const DD_HOLDINGS = 'H';
const DD_POSITONS = 'P';
const MM_BASKET = 'MM_BASKET';
const MM_CALC = 'MM_CALC';
var g_dropdownDisplay = DD_NONE;
var g_showOnlyMISPositions = false;
var g_showOnlyPEPositions = false;
var g_showOnlyCEPositions = false;
var g_showOnlyFUTPositions = false;
var g_showOnlyOPTPositions = false;
var g_subFilter = false;
var g_subFilterData = false;
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

var g_color = ((jQ('html').attr('data-theme') == 'dark') ? '#191919' : 'white');

const g_config = new MonkeyConfig({
    title: 'betterKite Settings',
    menuCommand: true,
    onSave: reloadPage,
    params: {
        auto_refresh_PnL: {
            type: 'checkbox',
            default: false
        },
        include_existing_positions: {
            type: 'checkbox',
            default: false
        },
        margin_method: {
            type: 'select',
            choices: ['Basket', 'Calculator'],
            values: [MM_BASKET, MM_CALC],
            default: MM_BASKET
        },
        filter_watchlist: {
            type: 'checkbox',
            default: true
        },
        nf_hedge: {
            type: 'number',
            default: 500
        },
        bnf_hedge: {
            type: 'number',
            default: 700
        },
        stock_hedge: {
            type: 'number',
            default: 100
        },
        logging: {
            type: 'select',
            choices: ['Info', 'Debug', 'None'],
            values: [D_LEVEL_INFO, D_LEVEL_DEBUG, D_LEVEL_NONE],
            default: D_LEVEL_NONE
        },
        pro_mode: {
            type: 'checkbox',
            default: false
        },
    }
});
const D_LEVEL = g_config.get('logging');
const PRO_MODE = g_config.get('pro_mode');
const MARGIN_METHOD = g_config.get('margin_method');

const allDOMPaths = {
    rowsFromHoldingsTable: "div.holdings > section > div > div > table > tbody > tr",
    attrNameForInstrumentTR: "data-uid",
    tradingSymbol: "td.instrument > span.tradingsymbol",
    domPathWatchlistRow: "div.instruments > div > div.vddl-draggable.instrument",
    domPathPendingOrdersTR: "div.pending-orders > div > table > tbody > tr",
    domPathExecutedOrdersTR: "div.completed-orders > div > table > tbody > tr",
    domPathTradingSymbolInsideOrdersTR: "span.tradingsymbol > span",
    domPathStockNameInWatchlistRow: "span.nice-name",
    domPathMainInitiatorLabel: "h3.page-title.small > span",
    domPathTabToChangeWatchlist: "ul.marketwatch-selector.list-flat > li",
    PathForPositions: "div.positions > section.open-positions.table-wrapper > div > div > table > tbody > tr",
    PathForBasketPositions: "div.basket-table > div > table > tbody > tr",
    domPathForPositionsDayHistory: "div.positions > section.day-positions.table-wrapper > div > div > table > tbody > tr",
    positionHeader: "header.row.data-table-header > h3",
    //sensibullRows: "#app > div > div > div > div > div > div > div:nth-child(1) > div:nth-child(2) > div > table > tbody > tr",
    sensibullRows: "tr.jss32.jss33",
    sensibullRowCheckbox: "th > div > span > span > input",
    sensibullScriptSelected: "#app > div > div > div > div > div > div > div:nth-child(1) > div:nth-child(1) > div > div"
};
//sensibullScriptSelected: "#app > div > div > div > div > div > div > div:nth-child(1) > div:nth-child(1) > div > button > span.MuiButton-label"
//("#app > div > div > div > div > div > div > div.style__LeftContentWrapper-t0trse-21.kQiWSc > div.style__SearchableInstrumentWrapper-t0trse-10.duNZzV > div > button > span.MuiButton-label")

const holdings = initHoldings();

const positions = initPositions();

const referenceTrades = initReferenceTrades();

const BASE_ORDERINFO_DOM = "div.modal-mask.order-info-modal > div.modal-wrapper > div.modal-container.layer-2";
var g_tradingBasket = new Array();
const BASE_PNL_REPORT = "#app > div.wrapper > div > div > h1";

main();

function addStyle() {
    var style = document.createElement("style");
    style.textContent = `
randomClassToHelpHide {outline: 1px dotted green;}
tagSelectorStyle {
margin: 15px 0;margin-top: 15px;margin-right: 0px;margin-bottom: 15px;margin-left: 0px;
border-right: 1px solid #e0e0e0;border-right-width: 1px;border-right-style: solid;border-right-color: rgb(224, 224, 224);
}
`;
    //only for debuggin- document.body.appendChild(style);
}

function initHoldings() {
    //Note: if script name as & then write it as &amp;
    //Note: Zerodha may either display NSE stock or BSE stock so better to mention both for the stock.

    var defaultHoldings = {
        "Dividend": ["SJVN", "VEDL"],
        "Wealth Creators": ["WHIRLPOOL", "ICICIBANK",],
        "Sell On profit": ["LUMAXIND", "RADICO"]
    };
    var holdings = GM_getValue(GM_HOLDINGS_NAME, defaultHoldings);

    if (PRO_MODE) {
        GM_registerMenuCommand("Set Holdings", function () {
            var h = GM_getValue(GM_HOLDINGS_NAME, defaultHoldings);
            h = prompt("Provide Holdings object. Eg: {'groupName 1':['INFY','RELIANCE'],'groupName 2':['M&amp;M','ICICIBANK']}", JSON.stringify(h));
            if (h == null) return;
            try {
                holdings = JSON.parse(h);
                GM_setValue(GM_HOLDINGS_NAME, holdings);
            }
            catch (err) {
                alert("There was error in your input");
                debug(err);
            }

            window.location.reload();
        }, "h");
    }

    return holdings;
}

function getSensibullZerodhaTradingSymbol(original) {
    //BANKNIFTY JUN 30000 PE NFO
    //BHARTIARTL JUN FUT NFO
    debug(`getSensibullZerodhaTradingSymbol ${original}`)
    var ts = original.split(" ");
    if (ts[2] == 'FUT') {
        debug('FUT');
        return `${ts[0]} ${getLastThursday(ts[1])} ${ts[2]}`;
    } else if (ts[2] == "w") {
        debug('weekly');
        return `${ts[0]} ${ts[1].match(/\d+/)[0].padStart(2, 0)}${ts[3]} ${ts[4]} ${ts[5]}`;
    } else {
        debug('monthly');
        if (ts[1].match(/^\d/)) {
            return `${ts[0]} ${ts[1]} ${ts[2]} ${ts[3]}`;
        } else {
            return `${ts[0]} ${getLastThursday(ts[1])} ${ts[2]} ${ts[3]}`;
        }
    }
    return;
}

function initPositions() {
    var defaultPositions = {
    };
    var positions = GM_getValue(GMPositionsName, defaultPositions);

    if (PRO_MODE) {
        GM_registerMenuCommand("Option Strategies", function () {
            var p = GM_getValue(GMPositionsName, defaultPositions);
            p = prompt("Provide Positions object. Eg: {'strategy 1':['12304386','12311298'],'strategy 2':['12431106']}", JSON.stringify(p));
            if (p == null) return;
            try {
                positions = JSON.parse(p);
                GM_setValue(GMPositionsName, positions);
            }
            catch (err) {
                alert("There was error in your input");
            }

            window.location.reload();
        }, "p");
    }
    GM_registerMenuCommand("Add to or Create new Strategy", function () {
        var selectedPositions = jQ(allDOMPaths.PathForPositions).filter(':has(:checkbox:checked)');
        info("selected ps " + selectedPositions.length);

        var storedStrategies = GM_getValue(GMPositionsName, defaultPositions);
        var keys = [];
        for (var k in storedStrategies) {
            keys.push(k);
        }

        var msg = '';
        if (selectedPositions.length <= 0) {
            alert('Please select atleast one position to be added to a strategy');
            return;
            //msg = 'You have selected '+selectedPositions.length+' positions. Please provide name of the strategy. \n\nNOTE: (1) If strategy name exists then position will be added to the group. \n(2) If this is new name then new strategy will be created.';
        }

        msg = 'Please tell your strategy name:\n\nNOTE: (1) If there is an existing strategy with same name then we will add selected position to same strategy. \n(2)If there is no strategy with this name then we will create a new one.\n\nYour existing strategies are: ' + keys.toString();

        var strategyName = prompt(msg);
        if (strategyName == null) return;
        strategyName = strategyName.toUpperCase();

        if (keys.includes(strategyName)) {
            var confirmAdd = confirm("This message is to confirm that there was no typo in strategy name.\n\nYou are adding to an **EXISTING** strategy.");
            if (confirmAdd == false) return;
        } else {
            var confirmAdd = confirm("This message is to confirm that there was no typo in strategy name.\n\nYou are adding to a **NEW** strategy.");
            if (confirmAdd == false) return;
        }

        var positionArray = [];
        selectedPositions.each(function (rowIndex) {
            var dataUidInTR = this.getAttribute(allDOMPaths.attrNameForInstrumentTR);

            var text = getSensibullZerodhaTradingSymbol(jQ(jQ(this).find('td')[2]).text());
            //return;

            //var text = dataUidInTR.split(".")[1];
            positionArray.push(text);
        });

        debug(JSON.stringify(storedStrategies));

        if (keys.includes(strategyName)) {
            storedStrategies[strategyName] = storedStrategies[strategyName].concat(positionArray);
        } else {
            storedStrategies[strategyName] = positionArray;
        }
        debug(JSON.stringify(storedStrategies));

        GM_setValue(GMPositionsName, storedStrategies);
        window.location.reload();
    }, "s");

    GM_registerMenuCommand("Delete A Strategy", function () {
        var storedStrategies = GM_getValue(GMPositionsName, defaultPositions);
        var keys = [];
        for (var k in storedStrategies) {
            keys.push(k);
        }

        var strategyToDelete = prompt("Please specify which strategy do you want to delete: " + keys.toString());
        if (strategyToDelete == null) return;
        strategyToDelete = strategyToDelete.toUpperCase();

        if (keys.includes(strategyToDelete)) {
            var confirmDelete = confirm("Deleting strategy " + strategyToDelete + "\n\nNOTE: Deletion does not have any impact on the Positions, this will simply delete strategy from the dropdown. Please confirm, name is correct?");
            if (confirmDelete == false) return;

            debug(JSON.stringify(storedStrategies));
            delete storedStrategies[strategyToDelete];
            debug(JSON.stringify(storedStrategies));
            GM_setValue(GMPositionsName, storedStrategies);

            window.location.reload();
        } else {
            alert('You do not have any custom strategy with this name. No action taken. Input you gave was: ' + strategyToDelete);
        }

    }, "d");

    return positions;
}

function initReferenceTrades() {
    var defaultRefTrades = {
        "RF.blue": ["12304386", "10397698"],
        "MT.red": ["11899650"]
    };
    var referenceTrades = GM_getValue(GMRefTradeName, defaultRefTrades);

    if (PRO_MODE) {
        GM_registerMenuCommand("Reference Trades & Martingales", function () {
            var rt = GM_getValue(GMRefTradeName, defaultRefTrades);
            rt = prompt("Provide trades object. Eg: {'RF.blue':['12304386','12311298'],'MT.red':['12431106']}", JSON.stringify(rt));
            if (rt == null) return;
            try {
                referenceTrades = JSON.parse(rt);
                GM_setValue(GMRefTradeName, referenceTrades);
            }
            catch (err) {
                alert("There was error in your input");
            }

            window.location.reload();
        }, "r");
    }

    return referenceTrades;
}

function assignHoldingTags() {
    jQ(allDOMPaths.rowsFromHoldingsTable).hover(
        function () {
            if (jQ(this).find("span[random-att='tagAddBtn']").length < 1) {
                var displayedStockName = removeExtraCharsFromStockName(this.getAttribute(allDOMPaths.attrNameForInstrumentTR));
                jQ(this).find(".instrument.right-border").append("<span random-att='tagAddBtn' title='Add tag' class='randomClassToHelpHide'><span class='randomClassToHelpHide'>&nbsp;</span><span id='tagAddIcon' class='text-label grey randomClassToHelpHide' value='" + displayedStockName + "'>+</span></span>");
            }
        },
        function () {
            jQ(this).find("span[random-att='tagAddBtn']").remove();
        }
    );

    //check if tags are present
    var tagNameSpans = jQ("span[random-att='tagName']");
    info('no of tags found: ' + tagNameSpans.length);
    if (tagNameSpans.length < 1) {

        //add label indicating category of stock
        // jQ("td.instrument.right-border > span:nth-child(1)").each(function (rowIndex) {
        jQ(allDOMPaths.rowsFromHoldingsTable).each(function (rowIndex) {

            //var displayedStockName = removeExtraCharsFromStockName(this.innerHTML);
            var displayedStockName = removeExtraCharsFromStockName(this.getAttribute(allDOMPaths.attrNameForInstrumentTR));
        
            for (var categoryName in holdings) {
                debug(`holdings[categoryName].includes(displayedStockName)`);
                if (holdings[categoryName].includes(displayedStockName)) {
                    jQ(this).find("td.instrument.right-border > span").append("<span random-att='tagName' class='randomClassToHelpHide'>&nbsp;</span><span id='idForTagDeleteAction' class='text-label blue randomClassToHelpHide' tag='" + categoryName + "' stock='" + displayedStockName + "'>" + categoryName + "</span>");
                }
            }

        });
    } else { debug('tags found'); }
}

function removeExtraCharsFromStockName(dataUidInTR) {
    if (dataUidInTR.includes("-BE")) {
        dataUidInTR = dataUidInTR.split("-BE")[0];
    } else if (dataUidInTR.includes("NSE")) {
        dataUidInTR = dataUidInTR.split("NSE")[0];
    } else if (dataUidInTR.includes("BSE")) {
        dataUidInTR = dataUidInTR.split("BSE")[0];
    }
    if (dataUidInTR.includes("*")) {
        dataUidInTR = dataUidInTR.split("*")[0];
    }

    return dataUidInTR;
}

function filterWatchlist(stocksToFilter, selectedCat) {
    var allWatchlistRows = jQ(allDOMPaths.domPathWatchlistRow);
    allWatchlistRows.show();
    if (selectedCat === "All") {
        //don't do anything
    } else {
        allWatchlistRows.addClass("allHiddenRows");

        allWatchlistRows.each(function (rowIndex) {
            var watchlistRowDiv = this;
            var stockName = jQ(watchlistRowDiv).find(allDOMPaths.domPathStockNameInWatchlistRow);
            var watchlistStock = stockName.text();
            if (watchlistStock.includes("-BE")) {
                watchlistStock = watchlistStock.split("-BE")[0];
            }
            var matchFound = false;
            if (Array.isArray(stocksToFilter)) {
                matchFound = stocksToFilter.includes(watchlistStock);
            } else {
                matchFound = watchlistStock.includes(stocksToFilter);
            }

            if (matchFound) {
                //do nothing
            } else {
                jQ(watchlistRowDiv).hide();
            }
        });
    }
}

function createHoldingsDropdown() {
    var selectBox = document.createElement("SELECT");
    selectBox.id = "tagSelectorH";
    selectBox.classList.add("randomClassToHelpHide");
    selectBox.style = "margin: 15px 0;margin-top: 15px;margin-right: 0px;margin-bottom: 15px;margin-left: 0px; background-color: var(--color-bg-default)"

    var option = document.createElement("option");
    option.text = "All Holdings";
    option.value = "All";
    selectBox.add(option);
    selectBox.addEventListener("change", function () {
        tEv("kite", "holdings", "filter", "");
        var selectedCat = this.value;

        info("Tag selected: " + selectedCat);
        var selectedStocks = holdings[selectedCat];

        var currentUrl = window.location.pathname;
        info(currentUrl);
        if (currentUrl.includes('holdings')) {

            //START work on Holdings AREA
            var allHoldingrows = jQ(allDOMPaths.rowsFromHoldingsTable);
            info('found holdings row: ' + allHoldingrows.length);
            allHoldingrows.show();
            if (selectedCat === "All") {
                jQ("#stocksInTagCount").text("");
                //don't do anything
            } else {
                //logic to hide the rows in Holdings table not in our list
                var countHoldingsStocks = 0;
                allHoldingrows.addClass("allHiddenRows");

                var pnl = 0;
                allHoldingrows.each(function (rowIndex) {
                    var dataUidInTR = removeExtraCharsFromStockName(this.getAttribute(allDOMPaths.attrNameForInstrumentTR));

                    var matchFound = false;
                    matchFound = selectedStocks.includes(dataUidInTR);

                    if (matchFound) {
                        //dont do anything, let the row be shown.
                        countHoldingsStocks++;
                        pnl += parseFloat(jQ(jQ(this).find("td")[5]).text().split(",").join(""));
                    } else {
                        jQ(this).hide();
                    }
                });

                jQ("#stocksInTagCount").text("(" + countHoldingsStocks + ") " + formatter.format(pnl));

            }

            assignHoldingTags();

            //END work on Holdings AREA
        }

        //START work on watchlist AREA
        filterWatchlist(selectedStocks, selectedCat);
        //END work on watchlist AREA

        return this;
    });

    for (var key in holdings) {
        option = document.createElement("option");
        option.text = key;
        option.value = key;
        selectBox.add(option);
    };
    return selectBox;
}

function assignPositionTags() {
    jQ(allDOMPaths.PathForPositions).hover(
        function () {
            if (jQ(this).find("span[random-att='tagAddBtn']").length < 1) {
                var dataUidInTR = this.getAttribute(allDOMPaths.attrNameForInstrumentTR);
                var p = dataUidInTR.split(".")[1];

                jQ(this).find(".open.instrument").append("<span random-att='tagAddBtn' title='Add tag' class='randomClassToHelpHide'><span class='randomClassToHelpHide'>&nbsp;</span><span id='positionTagAddIcon' class='text-label grey randomClassToHelpHide' value='" + p + "'>+</span></span>");
            }
        },
        function () {
            jQ(this).find("span[random-att='tagAddBtn']").remove();
        }
    );

    //check if tags are present
    var tagNameSpans = jQ("span[random-att='tagName']");
    info('no of tags found: ' + tagNameSpans.length);
    if (tagNameSpans.length < 1) {
        var allPositionsRow = jQ(allDOMPaths.PathForPositions);
        allPositionsRow.each(function (rowIndex) {
            var dataUidInTR = this.getAttribute(allDOMPaths.attrNameForInstrumentTR);
            var p = dataUidInTR.split(".")[1];

            var positionSpan = jQ(this).find("span.exchange.text-xxsmall.dim");

            for (var tradeTag in referenceTrades) {
                if (referenceTrades[tradeTag].includes(p)) {
                    var color = tradeTag.split(".")[1];
                    var tn = tradeTag.split(".")[0];
                    jQ(positionSpan).append("<span random-att='tagName' class='randomClassToHelpHide'>&nbsp;</span><span id='idForPositionTagDeleteAction' tag='" + tradeTag + "' position='" + p + "' class='text-label " + color + " randomClassToHelpHide'>" + tn + "</span>");
                }
            }
        });
    } else { debug('tags found'); }
}

function createPositionsDropdown() {
    var selectBox = document.createElement("SELECT");
    selectBox.id = "tagSelectorP";
    selectBox.classList.add("randomClassToHelpHide");
    selectBox.style = "margin: 15px 0;margin-top: 15px;margin-right: 0px;margin-bottom: 15px;margin-left: 0px;font-size: 12px;background-color: var(--color-bg-default)"

    var option = document.createElement("option");
    option.text = "All Positions";
    option.value = "All";
    selectBox.add(option);

    var userGeneratedGroups = document.createElement("optgroup");
    userGeneratedGroups.text = "---USER GROUPS---";
    userGeneratedGroups.label = "---USER GROUPS---";

    selectBox.addEventListener("change", function (evt) {
        debug('event: strategy change');

        tEv("kite", "positions", "filter", "");
        if (('detail' in evt) && evt.detail.simulated == true) {
            // jQ('#subFilterDropdownId').val('all');
        } else {
            debug('normal event call');
            resetSubFilter();
            jQ('#subFilterDropdownId').val('all');
            jQ('#allSubFilterId').prop('text', 'All');
        }

        var selectedGroup = this.value;
        var selectedType = jQ('option:selected', this).attr('type');

        info(`Group : ${selectedGroup}, type: ${jQ('option:selected', this).attr('type')}`);
        var selectedPositions = positions[selectedGroup];

        var currentUrl = window.location.pathname;
        info(currentUrl);
        if (currentUrl.includes('positions')) {
            //START work on Positions AREA
            var allPositionsRow = jQ(allDOMPaths.PathForPositions);
            info('found positions row: ' + allPositionsRow.length);
            allPositionsRow.show();

            assignPositionTags();

            var stocksInList = [];
            var misCount = 0;
            var ceCount = 0;
            var peCount = 0;
            var futCount = 0;
            var optCount = 0;
            var pnl = 0;
            var sellCount = 0;
            var buyCount = 0;

            //logic to hide the rows in positions table not in our list
            var countPositionsDisplaying = 0;
            allPositionsRow.addClass("allHiddenRows");

            
            // misCount = 0;
            // ceCount = 0;
            // peCount = 0;
            // futCount = 0;
            // optCount = 0;

            var selection = [];
            var optGrp = document.createElement("optgroup");
            var optGrpExpiry = document.createElement("optgroup");
            optGrp.text = "---SCRIP WISE---";
            optGrp.label = "---SCRIP WISE---";
            optGrp.id = "subFilterScripGroupId";
            jQ('#subFilterScripGroupId').remove();


            optGrpExpiry.text = "---EXPIRY WISE---";
            optGrpExpiry.label = "---EXPIRY WISE---";
            optGrpExpiry.id = "subFilterExpiryGroupId";
            jQ('#subFilterExpiryGroupId').remove();


            var arrForUnique = [];
            var uniqueExpiryArray = [];

            allPositionsRow.each(function (rowIndex) {
                var dataUidInTR = this.getAttribute(allDOMPaths.attrNameForInstrumentTR);
                //var p = dataUidInTR.split(".")[1];

                var position = getPositionRowObject(this);
                var p = getSensibullZerodhaTradingSymbol(jQ(jQ(this).find('td')[2]).text());

                var matchFound = false;
                var tradingSymbolText = jQ(this).find(allDOMPaths.tradingSymbol).text();
                var productType = jQ(this).find("td.product > span").text().trim();
                var instrument = jQ(jQ(this).find("td")[2]).text();
                var product = jQ(jQ(this).find("td")[1]).text();
                var qty = parseFloat(jQ(jQ(this).find("td")[3]).text().split(",").join(""));
                var price = parseFloat(jQ(jQ(this).find("td")[4]).text().split(",").join(""));
                debug("INSTRUMENT : " + instrument);

                //if (instrument.includes(' CE')) {

                if (selectedGroup.includes("SPECIAL")) {
                    var lengthOfSpecial = 7;
                    var s = selectedGroup.substring(selectedGroup.indexOf("SPECIAL") + lengthOfSpecial);
                    var ts = tradingSymbolText.split(" ")[0];
                    var expiry = getExpiryText(p);

                    if (ts == s) {
                        if (position.transaction_type == "SELL") {
                            sellCount = sellCount + Math.abs(position.quantity);
                        } else if (position.transaction_type == "BUY") {
                            buyCount = buyCount + Math.abs(position.quantity);
                        }
                    }


                    if (ts == s || s == expiry) {
                        matchFound = true;
                    }
                    // } else if (tradingSymbolText.includes(" " + s + " ")) {
                    // matchFound = true;
                    // }
                    if (matchFound) {
                        if (!stocksInList.includes(ts)) {
                            if (ts == 'BANKNIFTY') {
                                stocksInList.push('NIFTY BANK');
                            } else if (ts == 'NIFTY') {
                                stocksInList.push('NIFTY 50');
                            } else {
                                stocksInList.push(ts);
                            }
                        }
                    }
                } else if (selectedGroup === "All") {
                    matchFound = true;
                } else {
                    matchFound = selectedPositions.includes(p);
                }

                if (g_showOnlyMISPositions) {
                    if (productType == "MIS") {
                        //let filter decision pass
                    } else {
                        //overide filter decision and hide.
                        matchFound = false;
                    }
                }
                if (g_showOnlyCEPositions) {
                    if (instrument.includes(' CE')) {
                        //let filter decision pass
                    } else {
                        //overide filter decision and hide.
                        matchFound = false;
                    }
                }
                debug(`${g_showOnlyPEPositions} logic to hide PE ${instrument}`);
                if (g_showOnlyPEPositions) {
                    if (instrument.includes(' PE')) {
                        //let filter decision pass
                    } else {
                        //overide filter decision and hide.
                        matchFound = false;
                    }
                }

                if (g_showOnlyFUTPositions) {
                    if (instrument.includes(' FUT')) {
                        //let filter decision pass
                    } else {
                        //overide filter decision and hide.
                        matchFound = false;
                    }
                }

                if (g_showOnlyOPTPositions) {
                    if (instrument.includes(' NFO') && !instrument.includes(' FUT')) {
                        //let filter decision pass
                    } else {
                        //overide filter decision and hide.
                        matchFound = false;
                    }
                }

                debug(`subfilter ${g_subFilter} d:${g_subFilterData} e:${getExpiryText(p)} s:${position.scrip}`)
                if (g_subFilter) {
                    if (getExpiryText(p) == g_subFilterData || position.scrip == g_subFilterData) {
                        //let filter decision pass
                    } else {
                        //overide filter decision and hide.
                        matchFound = false;
                    }
                }

                if (matchFound) {
                    //dont do anything, let the row be shown.
                    countPositionsDisplaying++;
                    var v = jQ(jQ(this).find("td")[6]).text().split(",").join("");

                    pnl += parseFloat(v);
                    if (!stocksInList.includes(tradingSymbolText)) {
                        stocksInList.push(tradingSymbolText);
                    }
                    if (productType == "MIS") {
                        misCount++;
                    }
                    if (instrument.includes(' CE')) {
                        ceCount++;
                    }
                    if (instrument.includes(' PE')) {
                        peCount++;
                    }

                    if (instrument.includes(' FUT')) {
                        futCount++;
                    }

                    if (instrument.includes(' NFO') && !instrument.includes(' FUT')) {
                        optCount++;
                    }

                    var data = getMarginCalculationData(instrument, product, qty, price);
                    if (data != null) {
                        selection.push(data);
                    }

                    if (selectedType == 'expiry') {
                        //creating auto generated scrip wise grouping
                        if (!arrForUnique.includes(position.scrip)) {
                            var option = document.createElement("option");
                            option.text = position.scrip;
                            option.value = position.scrip;
                            jQ(optGrp).append(option);
                            arrForUnique.push(position.scrip);
                        }
                    }

                    if (selectedType == 'scrip') {

                        //creating auto generated expiry wise grouping
                        var expiry = getExpiryText(p);
                        if (!uniqueExpiryArray.includes(expiry)) {
                            var option2 = document.createElement("option");
                            option2.text = expiry;
                            option2.value = expiry;
                            jQ(optGrpExpiry).append(option2);
                            uniqueExpiryArray.push(expiry);
                        }
                    }

                } else {
                    jQ(this).hide();
                }
                //END work on Positions AREA
            });


            var allPositionsDayHistoryDomTRs = jQ(allDOMPaths.domPathForPositionsDayHistory);
            allPositionsDayHistoryDomTRs.show();
            allPositionsDayHistoryDomTRs.addClass("allHiddenRows");

            allPositionsDayHistoryDomTRs.each(function (rowIndex) {
                var dataUidInTR = this.getAttribute(allDOMPaths.attrNameForInstrumentTR);
                //var p = dataUidInTR.split(".")[1];
                debug('3');
                var p = getSensibullZerodhaTradingSymbol(jQ(jQ(this).find('td')[1]).text());

                var matchFound = false;
                var tradingSymbolText = jQ(this).find("td.instrument > span.tradingsymbol").text();
                var productType = jQ(this).find("td.product > span").text().trim();

                if (selectedGroup.includes("SPECIAL")) {
                    var lengthOfSpecial = 7;
                    var s = selectedGroup.substring(selectedGroup.indexOf("SPECIAL") + lengthOfSpecial);
                    var ts = tradingSymbolText.split(" ")[0];
                    if (ts == s) {
                        matchFound = true;
                    } else if (tradingSymbolText.includes(" " + s + " ")) {
                        matchFound = true;
                    }
                } else if (selectedGroup === "All") {
                    matchFound = true;
                } else {
                    matchFound = selectedPositions.includes(p);
                }

                if (g_showOnlyMISPositions) {
                    if (productType == "MIS") {
                        //let filter decision pass
                    } else {
                        //overide filter decision and hide.
                        matchFound = false;
                    }
                }

                if (matchFound) {
                    //dont do anything, let the row be shown.
                } else {
                    jQ(this).hide();
                }

                //END work on Positions Day history AREA
            });

            jQ("#misFilterId").text("MIS (" + misCount + ")");
            jQ("#peFilterId").text("PE (" + peCount + ")");
            jQ("#ceFilterId").text("CE (" + ceCount + ")");
            jQ("#optFilterId").text("OPT (" + optCount + ")");
            jQ("#futFilterId").text("FUT (" + futCount + ")");

            if (selectedType == 'scrip' && uniqueExpiryArray.length > 1) {
                jQ('#subFilterDropdownId').append(optGrpExpiry);
            }
            if (selectedType == 'expiry' && arrForUnique.length > 1) {
                jQ('#subFilterDropdownId').append(optGrp);
            }

            if (selectedType == 'scrip') {
                jQ('#spanBuyCountId').attr('data-balloon','Zerodha allows same number of longs as shorts irrespective of calls or puts. So, if you have 4 PUT shorts, you can buy 4 CALL long even though buying CALL is not a hedge position for 4 lots of PUT shorts, so one need to add all shorts across CE and PE and add all longs across CE and PE to find the difference (allowed hedges)');
                if (buyCount < sellCount) {
                    jQ('#spanBuyCountId').addClass("green");
                    jQ('#spanBuyCountId').html("Can BUY : " + (sellCount - buyCount));
                } else {
                    jQ('#spanBuyCountId').addClass("red");
                    jQ('#spanBuyCountId').html("BUY : Not Possible");
                }                
            } else {
                jQ('#spanBuyCountId').attr('data-balloon','Select a Scrip from the strategy filter dropdown.');
                jQ('#spanBuyCountId').html("");
            }

            if (g_subFilter) {
                jQ("#misFilterId").hide();
                jQ("#peFilterId").hide();
                jQ("#ceFilterId").hide();
                jQ("#optFilterId").hide();
                jQ("#futFilterId").hide();
                jQ("#resetSubId").show();
                jQ('#allSubFilterId').prop('text', g_subFilterData);
                
            } else {
                jQ("#misFilterId").show();
                jQ("#peFilterId").show();
                jQ("#ceFilterId").show();
                jQ("#optFilterId").show();
                jQ("#futFilterId").show();
                jQ("#resetSubId").hide();
            }

            calculateMargin(selection).then(margin => {
                updatePositionInfo(countPositionsDisplaying, pnl, margin);
            });

            debug(stocksInList);
            if (g_config.get('filter_watchlist')) {
                filterWatchlist(stocksInList, selectedGroup);
            }
        }

        return this;
    });

    //add options to the positions select drop down
    for (var key in positions) {
        option = document.createElement("option");
        option.text = key;
        option.value = key;
        jQ(userGeneratedGroups).append(option);
    };

    selectBox.add(userGeneratedGroups);
    return selectBox;
}

function updatePositionInfo(countPositionsDisplaying, pnl, margin) {
    var textDisplay = `(${countPositionsDisplaying}) P&L: ${formatter.format(pnl)}`;
    debug('updatePositionInfo ' + textDisplay);
    var topDisplay = jQ("#stocksInTagCount");
    topDisplay.text(textDisplay);
    var roi = (pnl / margin * 100).toFixed(2);
    topDisplay.prop('title', `ROI: ${roi}%`);

    topDisplay.removeClass("text-green");
    topDisplay.removeClass("text-red");
    topDisplay.removeClass("text-black");
    if (pnl > 0) {
        topDisplay.addClass("text-green");
    } else if (pnl < 0) {
        topDisplay.addClass("text-red");
    } else {
        topDisplay.addClass("text-black");
    }

    if (margin < 0) {
        jQ("#marginDiv").text('0');
    } else {
        var display = 'M (C)';
        if (MARGIN_METHOD == MM_BASKET) {
            display = 'M (B)';
        }
        jQ("#marginDiv").text(display + ": " + formatter.format(margin));
    }
    jQ("#marginDiv").prop('title', `ROI: ${(pnl / margin * 100).toFixed(2)}%`);
    jQ('title').text(formatter.format(pnl));
}

function createSubFilter() {
    debug('createSubFilter');

    var dropDown = jQ("<SELECT id='subFilterDropdownId' class='randomClassToHelpHide' style='margin: 2px 0;font-size: 10px;background-color: var(--color-bg-default)'></SELECT>");

    var s = jQ("<span id='headerSubActionsID' class='text-label grey randomClassToHelpHide' ></span>");

    var option = document.createElement("option");
    option.text = "All";
    option.value = "all";
    option.id = "allSubFilterId";
    jQ(dropDown).append(option);

    option = document.createElement("option");
    option.text = "MIS";
    option.id = 'misFilterId';
    option.value = "mis";
    jQ(dropDown).append(option);

    //PE only
    option = document.createElement("option");
    option.id = 'peFilterId';
    option.text = "PE";
    option.value = "pe";
    jQ(dropDown).append(option);

    //CE only
    option = document.createElement("option");
    option.text = "CE";
    option.id = 'ceFilterId';
    option.value = "ce";
    jQ(dropDown).append(option);

    option = document.createElement("option");
    option.text = "FUT";
    option.id = 'futFilterId';
    option.value = "fut";
    jQ(dropDown).append(option);

    option = document.createElement("option");
    option.text = "OPT";
    option.id = 'optFilterId';
    option.value = "opt";
    jQ(dropDown).append(option);

    option = document.createElement("option");
    option.text = "Reset";
    option.id = 'resetSubId';
    option.value = "reset";
    jQ(dropDown).append(option);

    jQ(s).append(dropDown);

    //Select all
    t = jQ("<span id='spanselectAllId' class='text-label red randomClassToHelpHide'>|</span>");
    i = document.createElement("INPUT");
    i.style = 'margin: 2px';
    i.type = 'button';
    i.id = "selectAllId";
    i.name = 'selectAllId';
    i.value = 'Toggle Sel.';

    //jQ(s).append(t);
    jQ(s).append(i);

    //savings button
    i = document.createElement("INPUT");
    i.style = 'margin: 2px';
    i.type = 'button';
    i.id = "saveMarginBtnId";
    i.name = 'saveMarginBtnId';
    i.value = 'Save Margin';

    jQ(s).append(i);

    i = document.createElement("INPUT");
    i.style = 'margin: 2px';
    i.type = 'button';
    i.id = "hideRestId";
    i.name = 'hideRestId';
    i.value = 'Hide Sel.';
    jQ(s).append(i);

    i = document.createElement("INPUT");
    i.style = 'margin: 2px';
    i.type = 'button';
    i.id = "resetRowsId";
    i.name = 'resetRowsId';
    i.value = 'Reset';
    jQ(s).append(i);

    

    t = jQ("<span id='spanBuyCountId' class='text-label randomClassToHelpHide' data-balloon-length='large' data-balloon-pos='right' data-balloon='Select a Scrip from the strategy filter dropdown.'></span></span>");
    jQ(s).append(t);

    return s;
}

var g_observer;
var g_positionsPnlObserver;

function hideDropdown() {
    jQ(".randomClassToHelpHide").remove();
    jQ(".allHiddenRows").show();

    g_dropdownDisplay = DD_NONE;
    if (g_observer) g_observer.disconnect();
    if (g_positionsPnlObserver) g_positionsPnlObserver.disconnect();
}

//waitForKeyElements("span.count",showPositionDropdown);

function showPositionDropdown(retry = true) {
    jQ("#headerSubActionsID").remove();
    jQ("div.positions > section.open-positions.table-wrapper > header > h3").after(createSubFilter());

    debug('showPositionDropdown');

    var allPositionsRow = jQ(allDOMPaths.PathForPositions);

    if (allPositionsRow.length < 1) {
        debug('sleeping as couldnt find positions ' + retry);
        //TODO if no positions this will cause loop
        if (retry) {
            setTimeout(function () { showPositionDropdown(false); }, 1000);
        }
        return;
    }

    var positionGroupdropdown;
    debug(jQ('#tagSelectorP').exists());
    if (jQ('#tagSelectorP').exists()) {
        positionGroupdropdown = jQ('#tagSelectorP');
    } else {
        positionGroupdropdown = createPositionsDropdown();
    }

    var lastC = positionGroupdropdown.lastChild;
    debug(lastC);
    if (lastC && lastC.id == "randomForDeleteOptGroupE") {
        positionGroupdropdown.removeChild(lastC);
    }

    lastC = positionGroupdropdown.lastChild;
    debug(lastC);
    if (lastC && lastC.id == "randomForDeleteOptGroup") {
        positionGroupdropdown.removeChild(lastC);
    }

    var optGrp = document.createElement("optgroup");
    optGrp.text = "---SCRIP WISE---";
    optGrp.label = "---SCRIP WISE---";
    optGrp.id = "randomForDeleteOptGroup";

    var optGrpExpiry = document.createElement("optgroup");
    optGrpExpiry.text = "---EXPIRY WISE---";
    optGrpExpiry.label = "---EXPIRY WISE---";
    optGrpExpiry.id = "randomForDeleteOptGroupE";

    var arrForUnique = [];
    var uniqueExpiryArray = [];
    allPositionsRow.each(function (rowIndex) {

        var text = getSensibullZerodhaTradingSymbol(jQ(jQ(this).find('td')[2]).text());
        var tradingSymbol = jQ(this).find("td.instrument > span.tradingsymbol").text();

        //creating auto generated script wise grouping
        var ts = tradingSymbol.split(" ")[0];
        if (!arrForUnique.includes(ts)) {
            var option = document.createElement("option");
            option.text = ts;
            option.value = "SPECIAL" + ts;
            option.setAttribute("data", ts);
            option.setAttribute("type", 'scrip');
            jQ(optGrp).append(option);
            arrForUnique.push(ts);
        }

        //creating auto generated expiry wise grouping

        var expiry = getExpiryText(text);
        if (!uniqueExpiryArray.includes(expiry)) {
            var option2 = document.createElement("option");
            option2.text = expiry;
            option2.value = "SPECIAL" + expiry;
            option2.setAttribute("data", expiry);
            option2.setAttribute("type", 'expiry');
            jQ(optGrpExpiry).append(option2);
            uniqueExpiryArray.push(expiry);
        }
    });

    positionGroupdropdown.add(optGrp);
    positionGroupdropdown.add(optGrpExpiry);

    jQ("a.logo")[0].after(positionGroupdropdown);

    var div1 = document.createElement("div");
    div1.style = "line-height:20%;text-align:right;";
    var spanForCount = document.createElement("div");
    spanForCount.classList.add("randomClassToHelpHide");
    spanForCount.classList.add("tagSelectorStyle");
    spanForCount.style = "margin: 15px 0;margin-top: 15px;margin-right: 0px;margin-bottom: 15px;margin-left: 0px;font-size: 10.5px;border-right-style: solid;border-right-color: rgb(224, 224, 224);padding: 0 0px;"
    spanForCount.id = 'stocksInTagCount';
    spanForCount.addEventListener("click", () => updatePnl(true));

    var divForMargin = document.createElement("div");
    divForMargin.classList.add("randomClassToHelpHide");
    divForMargin.classList.add("tagSelectorStyle");
    divForMargin.style = "font-size: 10.5px;"
    divForMargin.id = 'marginDiv';

    div1.appendChild(spanForCount);
    div1.appendChild(divForMargin);
    jQ(positionGroupdropdown).after(div1);

    g_dropdownDisplay = DD_POSITONS;
    addWatchlistFilter();
    simulateSelectBoxEvent();

    // The node to be monitored
    var target = jQ("div.positions > section.open-positions.table-wrapper > div > div > table > tbody")[0];

    // Create an observer instance
    g_observer = new MutationObserver(function (mutations) {
        var st = null;
        mutations.forEach(function (mutation) {
            var newNodes = mutation.addedNodes; // DOM NodeList
            if (newNodes !== null) { // If there are new nodes added
                if (st != null) {
                    clearTimeout(st);
                }
                st = setTimeout(function () { simulateSelectBoxEvent(); }, 2000);
            }
        });
    });

    // Configuration of the observer:
    var config = {
        childList: true,
        characterData: true
    };

    // Pass in the target node, as well as the observer options
    g_observer.observe(target, config);

    if (g_config.get('auto_refresh_PnL') === true) {
        debug('going to observe pnl change');
        target = jQ("div.positions > section.open-positions.table-wrapper > div > div > table > tfoot > tr > td")[3];
        debug("**********" + jQ(target).text());
        g_positionsPnlObserver = new MutationObserver(function (mutations) {
            var st = null;
            mutations.forEach(function (mutation) {
                if (mutation.type == "characterData") {
                    debug("pnl changed");
                    updatePnl(true);
                }
            });
        });

        // Configuration of the observer:
        config = {
            characterData: true,
            subtree: true
        };

        // Pass in the target node, as well as the observer options
        g_positionsPnlObserver.observe(target, config);
    }
}

function getScripText(fullText) {
    debug('getScripText ' + fullText);
    var expiry = fullText.split(' ');
    var t = expiry[0];

    return t;
}

function getScripExpiryText(fullText) {
    debug('getgetScripExpiryTextExpiryText ' + fullText);
    var expiry = fullText.split(' ');
    var t = expiry[0] + ' ' + expiry[1];

    return t;
}

function getExpiryText(fullText) {
    //debug('getExpiryText ' + fullText);
    var expiry = fullText.split(' ');
    var t = expiry[1];

    return t;
}

function showHoldingDropdown() {
    g_dropdownDisplay = DD_HOLDINGS;
    //crete the dropdown to filter stocks.
    var dropdown = createHoldingsDropdown();

    //jQ("h3.page-title.small")[0].before(dropdown);
    jQ("a.logo")[0].after(dropdown);

    var spanForCount = document.createElement("span");
    spanForCount.classList.add("randomClassToHelpHide");
    spanForCount.classList.add("tagSelectorStyle");
    spanForCount.style = "margin: 15px 0;margin-top: 15px;margin-right: 0px;margin-bottom: 15px;margin-left: 0px;border-right: 1px solid #e0e0e0;border-right-width: 1px;border-right-style: solid;border-right-color: rgb(224, 224, 224);padding: 0 10px;"

    spanForCount.id = 'stocksInTagCount';
    spanForCount.addEventListener("click", () => updatePnl(false));
    jQ(dropdown).after(spanForCount);

    addWatchlistFilter();
    simulateSelectBoxEvent();
}

function toggleDropdown(currentUrl) {
    debug('toggleDropdown');

    if (currentUrl.includes('positions')) {
        switch (g_dropdownDisplay) {
            case DD_NONE:
                // show positions dropdown
                showPositionDropdown();
                break;
            case DD_POSITONS:
                // do nothing
                //hideDropdown();
                simulateSelectBoxEvent();
                break;
            case DD_HOLDINGS:
                // hide holidings
                hideDropdown();
                // show positions
                showPositionDropdown();
        }
    } else if (currentUrl.includes('holdings')) {
        switch (g_dropdownDisplay) {
            case DD_NONE:
                // show holdings dropdown
                showHoldingDropdown();
                break;
            case DD_POSITONS:
                // hide positions
                hideDropdown();
                // show holdings
                showHoldingDropdown();
                break;
            case DD_HOLDINGS:
                // do nothing
                //hideDropdown();
                simulateSelectBoxEvent();
        }
    } else if (currentUrl.includes('orders')) {
        // if (jQ('#bo_basket-form').length > 0) {
        //     debug('found send order form');
        //     updateOrderButtons();
        // } else {
        //     debug('showing send order form');
        //     showSendOrderButton();
        // }
    }
}

//dispatch tagSelector change event.
function simulateSelectBoxEvent() {
    debug('simulating tagSelector change ');
    var currentUrl = window.location.pathname;

    var tagSelectorH = document.querySelector("#tagSelectorH");
    var tagSelectorP = document.querySelector("#tagSelectorP");

    if (currentUrl.includes('holdings')) {
        //if (tagSelectorP) {tagSelectorP.style.display = "none";}
        if (tagSelectorH) {
            //tagSelectorH.style.display = "block";
            var allHoldingrows = jQ(allDOMPaths.rowsFromHoldingsTable);
            if (allHoldingrows.length > 0) {
                debug('initiating change event found holdings');
                tagSelectorH.dispatchEvent(new Event("change"));
            } else {
                debug('sleeping as couldnt find holding');
                //setTimeout(function(){ simulateSelectBoxEvent(); }, 1000);
            }
        }
    } else if (currentUrl.includes('positions')) {
        //if (tagSelectorH) {tagSelectorH.style.display = "none";}
        if (tagSelectorP) {
            //tagSelectorP.style.display = "block";
            var allPositionsRows = jQ(allDOMPaths.PathForPositions);
            if (allPositionsRows.length > 0) {
                debug('initiating change event found positions');
                // tagSelectorP.dispatchEvent(new Event("change", {'simulated': true}));
                tagSelectorP.dispatchEvent(new CustomEvent('change', {'detail': {'simulated': true}}));
                
            } else {
                debug('sleeping as couldnt find positions (simulateSelectBox)');
                //waitForKeyElements("div.positions > section.open-positions.table-wrapper > div > div > table > tbody > tr:nth-child(1)",simulateSelectBoxEvent);
                //waitForKeyElements("span.count",simulateSelectBoxEvent);
                //setTimeout(function(){ simulateSelectBoxEvent(); }, 2000);
            }
        }
    }

    //FIX BELOW for ORDERS
    /*
    if (tagSelector) {
        var currentUrl = window.location.pathname;
        debug("simulateSelectBoxEvent: currentURL " + currentUrl);
        if (currentUrl.includes('holdings')) {

        } else if (currentUrl.includes('positions')) {

        } else if (currentUrl.includes('orders')) {
            debug('this is just a work aroud. First order dom for order is accessible after few sec');
            if (jQ(allDOMPaths.domPathPendingOrdersTR).length < 1 && jQ(allDOMPaths.domPathExecutedOrdersTR).length < 1) {
                setTimeout(function(){tagSelector.dispatchEvent(new Event("change")); }, 2000);
            } else {
                tagSelector.dispatchEvent(new Event("change"));
            }
        }
    }
    */
}

function filterOrders() { //notused
    debug('filter orders');
    //there are 3 sections
    //Open or pending orders

    var tagSelectorH = document.querySelector("#tagSelectorH");
    var tagSelectorP = document.querySelector("#tagSelectorP");

    var selectedCat = "All";

    if (tagSelectorH) {
        selectedCat = tagSelectorH.value;
    } else if (tagSelectorP) {
        selectedCat = tagSelectorP.value;
    } else {
        //do nothing
        return;
    }

    return;

    //START work on order AREA
    var allPendingOrderRows = jQ(allDOMPaths.domPathPendingOrdersTR);

    var allExecutedOrderRows = jQ(allDOMPaths.domPathExecutedOrdersTR);
    allPendingOrderRows.show();
    allExecutedOrderRows.show();

    info("pending orders: " + allPendingOrderRows.length);

    if (selectedCat === "All") {
        //don't do anything
    } else {
        var countPendingOrdersStocks = 0;
        allPendingOrderRows.addClass("allHiddenRows");
        allPendingOrderRows.each(function (rowIndex) {
            var workingRow = this;
            var stockInRow = jQ(workingRow).find(allDOMPaths.domPathTradingSymbolInsideOrdersTR).html();
            debug("found pending order: " + stockInRow);
            if (stockInRow.includes("-BE")) {
                stockInRow = stockInRow.split("-BE")[0];
            }
            var matchFound = false;
            matchFound = selectedStocks.includes(stockInRow);

            if (matchFound) {
                //do nothing
                countPendingOrdersStocks++;
            } else {
                jQ(workingRow).hide();
            }
        });

        jQ("#stocksInTagCount").text("(" + countPendingOrdersStocks + ") ");

        allExecutedOrderRows.addClass("allHiddenRows");
        allExecutedOrderRows.each(function (rowIndex) {
            var workingRow = this;
            var stockInRow = jQ(workingRow).find(allDOMPaths.domPathTradingSymbolInsideOrdersTR).html();
            debug("found executed order: " + stockInRow);
            if (stockInRow.includes("-BE")) {
                stockInRow = stockInRow.split("-BE")[0];
            }
            var matchFound = false;
            matchFound = selectedStocks.includes(stockInRow);

            if (matchFound) {
                //do nothing
            } else {
                jQ(workingRow).hide();
            }
        });

    }
    //END work on order AREA

    //Executed orders
    //Trades
}


const calculateMargin = async (selection) => {
    if (MARGIN_METHOD == MM_BASKET) {
        return calculateMarginUsingBasket(selection);
    } else {
        return calculateMarginUsingMarginCalculator(selection);
    }
}

const calculateMarginUsingMarginCalculator = async (selection) => {
    let margin = 0
    var payload = qs.stringify({
        'action': 'calculate'
    });
    selection.forEach(data => {
        var d = qs.stringify({
            'exchange[]': data.exchange,
            'product[]': data.optfut,
            'scrip[]': data.scrip,
            'option_type[]': data.pece,
            'strike_price[]': `${data.strike}`,
            'qty[]': `${Math.abs(data.quantity)}`,
            'trade[]': data.transaction_type.toLowerCase()
        });
        payload = `${payload}&${d}`
    });

    var config = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    };
    let response = await axios.post("https://zerodha.com/margin-calculator/SPAN/", payload, config);
    margin = response.data.total != null && response.data.total !== undefined ? response.data.total.total : 0;
    debug('calculateMarginUsingMarginCalculator');
    return margin;
}

const calculateMarginUsingBasket = async (selection) => {
    let margin = 0
    var payload = []

    selection.forEach(data => {
        var orderType = 'LIMIT'
        if (data.hasOwnProperty('order_type')) {
            orderType = data.order_type;
        }
        var d = {
            'exchange': data.exchange,
            'order_type': orderType,
            'price': data.price,
            'product': data.product,
            'quantity': Math.abs(data.quantity),
            'squareoff': 0,
            'stoploss': 0,
            'tradingsymbol': data.tradingsymbol,
            'transaction_type': data.transaction_type,
            'trigger_price': 0,
            'variety': 'regular'
        };
        payload.push(d)
    });

    var config = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `enctoken ${getCookie('enctoken')}`
        }
    };
    // debug(`config: ${config} payload: ${payload}`)
    return await axios.post(`/oms/margins/basket?consider_positions=${g_config.get('include_existing_positions')}&mode=compact`, payload, config)
        .then(function (response) {
            //margin = response.data.data.initial!=null && response.data.data.initial!==undefined?response.data.data.initial.total:0;
            margin = response.data.data.final != null && response.data.data.final !== undefined ? response.data.data.final.total : 0;
            return margin;
        }
        )
        .catch(function (error) {
            debug(error); return -1;
        }
        );

}

const getMarginCalculationData = (instrument, product, q, price) => {
    // frame payload for SPAN calculation
    var tokens = instrument.replace(/\s+/g, ' ').split(" ");
    //debug(tokens);
    var data = {};
    if (tokens[1] === "NSE" || tokens[1] === "BSE") { //buy: OAL BSE HOLDING, sell: OAL NSE SOLD HOLDING
        return null;
    }
    data.symbol = tokens[0];
    data.product = product.replace(/\s/g, '');
    //data.product = product.replace(/\n/g, '').replace(/\t/g, '').trim();
    if (tokens[2] === "FUT") {
        //NIFTY APR FUT NFO
        data.tradingsymbol = `${tokens[0]}${moment(new Date()).format("YY")}${tokens[1]}FUT`;
        data.exchange = `${tokens[3]}`;
        data.pece = 'PE';
        data.strike = '';
        data.optfut = 'FUT';
        data.scrip = `${tokens[0]}${moment(new Date()).format("YY")}${tokens[1]}`;
    } else {
        data.optfut = 'OPT';
        if (tokens[2] === "w") {
            //eg: NIFTY2140814200CE (NIFTY 8th w APR 14200 CE NFO LABELS)
            const MONTHS_FOR_WEEKLY = ["1","2","3","4","5","6","7","8","9","O","N","D"];

            data.tradingsymbol = `${tokens[0]}${moment(new Date()).format("YY")}${MONTHS_FOR_WEEKLY[MONTHS.indexOf(tokens[3])]}${tokens[1].match(/\d+/)[0].padStart(2, 0)}${tokens[4]}${tokens[5]}`;
            data.exchange = `${tokens[6]}`;
            data.pece = `${tokens[5]}`;
            data.strike = `${tokens[4]}`;
            data.scrip = `${tokens[0]}${moment(new Date()).format("YY")}${MONTHS_FOR_WEEKLY[MONTHS.indexOf(tokens[3])]}${tokens[1].replace(/\D/g, "")}`
        } else {
            //eg: NIFTY21APR14200PE (NIFTY APR 14200 PE NFO LABELS)
            if (tokens[1].match(/^\d/)) {
                data.tradingsymbol = `${tokens[0]}${tokens[1]}${tokens[2]}${tokens[3]}`;
            } else {
                data.tradingsymbol = `${tokens[0]}${moment(new Date()).format("YY")}${tokens[1]}${tokens[2]}${tokens[3]}`;
            }
    
            data.exchange = `${tokens[4]}`;
            data.pece = `${tokens[3]}`;
            data.strike = `${tokens[2]}`;
            data.scrip = `${tokens[0]}${moment(new Date()).format("YY")}${tokens[1]}`;
        }
    }

    data.quantity = q > 0 ? q : q * -1;
    data.price = price;
    data.transaction_type = q > 0 ? 'BUY' : 'SELL';
    return data;
}

var filterText = "";
function addWatchlistFilter() {
    //jQ("#watchlistFilterId").remove();
    var wFilter = document.createElement("li");
    wFilter.id = 'watchlistFilterId';
    wFilter.classList.add("randomClassToHelpHide");
    wFilter.classList.add("item");
    wFilter.innerText = "Filter";

    jQ("div.marketwatch-sidebar.marketwatch-wrap > ul > li.settings").before(wFilter);
}

function updatePnl(forPositions = true) {
    var allVisibleRows;
    var pnlCol;
    if (forPositions) {
        allVisibleRows = jQ(allDOMPaths.PathForPositions + ":visible");
        pnlCol = 6;
    } else {
        pnlCol = 5;
        allVisibleRows = jQ(allDOMPaths.rowsFromHoldingsTable + ":visible");
    }

    debug('found visible rows: ' + allVisibleRows.length);

    var pnl = 0;

    var selection = [];
    allVisibleRows.each(function (rowIndex) {
        var v = jQ(jQ(this).find("td")[pnlCol]).text().split(",").join("");
        pnl += parseFloat(v);

        if (forPositions) {
            var instrument = jQ(jQ(this).find("td")[2]).text();

            var qty = parseFloat(jQ(jQ(this).find("td")[3]).text().split(",").join(""));
            var price = parseFloat(jQ(jQ(this).find("td")[4]).text().split(",").join(""));
            var product = jQ(jQ(this).find("td")[1]).text();
            var data = getMarginCalculationData(instrument, product, qty, price);
            if (data != null) {
                selection.push(data);
            }
        }
    });

    if (allVisibleRows.length > 0) {
        calculateMargin(selection).then(margin => {
            updatePositionInfo(allVisibleRows.length, pnl, margin);
        });
    }
}

function onSuCheckboxSelection() {
    tEv("kite", "positionscheckbox", "click", "");
    debug('select su-checkbox changed');
    var selectedRows = jQ(`${allDOMPaths.PathForPositions}.selected`);

    var pnl = 0;
    var maxPnl = 0;
    var peQ = 0;
    var ceQ = 0;
    var points = 0;
    var selection = [];
    debug(`su- selected rows: ${selectedRows.length}`);
    selectedRows.each(function (rowIndex) {
        var v = jQ(jQ(this).find("td")[6]).text().split(",").join("");

        pnl += parseFloat(v);

        var instrument = jQ(jQ(this).find("td")[2]).text();
        debug(instrument);
        if (instrument.includes('NSE') || instrument.includes('BSE')) {
            return;
        }
        var q = parseFloat(jQ(jQ(this).find("td")[3]).text().split(",").join(""));
        if (instrument.includes(' CE')) {
            ceQ = ceQ + q;
        } else if (instrument.includes(' PE')) {
            peQ = peQ + q;
        }

        var avgPrice = parseFloat(jQ(jQ(this).find("td")[4]).text().split(",").join(""));
        var value = q * avgPrice;
        maxPnl = maxPnl - value;

        if (q > 0) {
            points = points + avgPrice;
        } else {
            points = points - avgPrice;
        }

        var product = jQ(jQ(this).find("td")[1]).text();
        var data = getMarginCalculationData(instrument, product, q, avgPrice);
        if (data != null) {
            selection.push(data);
        }
    });

    var tag = jQ("span[random-att='temppnl']");
    if (tag.length > 0) {
        tag.remove();
    }
    tag = jQ("span[random-att='marginsave']");
    if (tag.length > 0) {
        tag.remove();
    }

    if (selectedRows.length > 0) {
        calculateMargin(selection).then(margin => {
            if (selectedRows.length > 0) {
                if (ceQ > peQ) {

                } else if (peQ > ceQ) {

                }
                var t = ceQ + "CE & " + peQ + "PE";
                var pnlText = "";
                if (pnl > 0) {
                    pnlText = "<span random-att='temppnl' class='text-green open pnl randomClassToHelpHide'>P&L: " + formatter.format(pnl);
                } else {
                    pnlText = "<span random-att='temppnl' class='text-red open pnl randomClassToHelpHide'>P&L: " + formatter.format(pnl);

                }
                pnlText += "<br><span class='text-label randomClassToHelpHide'>Max Profit: " + formatter.format(maxPnl) + " / " + (maxPnl / margin * 100).toFixed(2) + "%</span>";
                pnlText += "<br><span class='text-label randomClassToHelpHide'>% Profit achieved: " + (pnl / maxPnl * 100).toFixed(2) + "% </span>";
                if (margin >= 0) {
                    pnlText += "<br><span class='text-label randomClassToHelpHide'>Margin: " + formatter.format(margin) + "</span>";
                    pnlText += "<br><span class='text-label randomClassToHelpHide'>Current ROI: " + (pnl / margin * 100).toFixed(2) + "% </span>";
                }
                pnlText += "</span>";

                var mTag = jQ("span[random-att='marginsave']");
                if (mTag.length > 0) {
                    mTag.remove();
                }
                mTag = jQ("span[random-att='temppnl']");
                if (mTag.length > 0) {
                    mTag.remove();
                } jQ(jQ("div.positions > section.open-positions.table-wrapper > div > div > table > tfoot > tr > td")[0]).append("<span random-att='marginsave' class='pnl randomClassToHelpHide'> " + t + " (Points: " + formatter.format(points) + ")</span>");
                jQ(jQ("div.positions > section.open-positions.table-wrapper > div > div > table > tfoot > tr > td")[0]).append(pnlText);
            }
        });
    }

}

function getPositionRowObject(row) {
    //instrument what you see in the
    //tradingsymbl what you send NIFTY21JUN15750CE
    //scrip  NIFTY21JUL
    //eg: NIFTY2140814200CE (NIFTY 8th w APR 14200 CE NFO LABELS)
    var position = {};

    position.pnl = jQ(jQ(row).find("td")[6]).text().split(",").join("");
    position.instrument = jQ(jQ(row).find("td")[2]).text();
    position.product = jQ(jQ(row).find("td")[1]).text().replace(/\s/g, '');
    position.quantity = parseFloat(jQ(jQ(row).find("td")[3]).text().split(",").join(""));
    position.avgPrice = parseFloat(jQ(jQ(row).find("td")[4]).text().split(",").join(""));

    if (position.quantity > 0) {
        position.transaction_type = 'BUY';
    } else {
        position.transaction_type = 'SELL';
    }

    var data = getMarginCalculationData(position.instrument, position.product, position.quantity, position.avgPrice);

    if (data != null) {
        position.exchange = data.exchange;
        position.pece = data.pece;
        position.strike = data.strike;
        position.optfut = data.optfut;
        position.scrip = data.scrip;
        position.tradingsymbol = data.tradingsymbol;
        position.symbol = data.symbol;
    }

    return position;
}

function checkMarginSaving() {
    tEv("kite", "checkMarginSaving", "click", "");
    debug('checkMarginSaving');
    // var selectedRows = jQ(allDOMPaths.PathForPositions+".selected");
    var selectedRows = jQ(allDOMPaths.PathForPositions + ":visible");

    var marginData = {};
    var symbols = [];
    selectedRows.each(function (rowIndex) {
        var position = getPositionRowObject(this);

        // if (position.instrument.includes('NSE') || position.instrument.includes('BSE') || (position.symbol != 'NIFTY' && position.symbol != 'BANKNIFTY')) {
        if (position.instrument.includes('NSE') || position.instrument.includes('BSE')) {
            debug('skipping ' + position.symbol);
            return;
        }

        if (!symbols.includes(position.symbol)) {
            symbols.push(position.symbol);
        }


        if (!marginData.hasOwnProperty(position.symbol + '_md')) {
            marginData[position.symbol + '_md'] = [];
            marginData[position.symbol + '_pe'] = 0;
            marginData[position.symbol + '_ce'] = 0;
            marginData[position.symbol + '_strikes'] = [];
            marginData[position.symbol + '_scrip'] = '';
        }

        if (position.pece == 'CE') {
            marginData[position.symbol + '_ce'] = marginData[position.symbol + '_ce'] + position.quantity;
        } else if (position.pece == 'PE') {
            marginData[position.symbol + '_pe'] = marginData[position.symbol + '_pe'] + position.quantity;
        }

        marginData[position.symbol + '_md'].push(position);
        marginData[position.symbol + '_strikes'].push(position.strike);
        marginData[position.symbol + '_scrip'] = position.scrip;
    });

    debug(marginData);

    symbols.forEach(function (symbol, index) {
        //debug(symbol);

        var data = marginData[symbol + '_md'];

        calculateMargin(data).then(margin1 => {
            debug(symbol + ' now ' + formatter.format(margin1));

            var increment = 0;
            if (symbol == 'NIFTY') {
                increment = g_config.get('nf_hedge');
            } else if (symbol == 'BANKNIFTY') {
                increment = g_config.get('bnf_hedge');
            } else {
                increment = g_config.get('stock_hedge');
            }
            var minStrike = Math.min(...marginData[symbol + '_strikes']) - parseInt(increment);
            var maxStrike = Math.max(...marginData[symbol + '_strikes']) + parseInt(increment);

            var dp = { 'order_type': 'MARKET', 'price': 0, 'product': 'NRML', 'exchange': 'NFO', 'transaction_type': 'BUY', 'trigger_price': 0, 'optfut': 'OPT', 'scrip': marginData[symbol + '_scrip'] };
            var dc = { 'order_type': 'MARKET', 'price': 0, 'product': 'NRML', 'exchange': 'NFO', 'transaction_type': 'BUY', 'trigger_price': 0, 'optfut': 'OPT', 'scrip': marginData[symbol + '_scrip'] };
            // d.order_type = 'MARKET';

            // d.squareoff = 0;
            // d.stoploss = 0;

            // variety = 'regular';


            if (marginData[symbol + '_pe'] < 0) {
                debug(' PE saving possible ' + minStrike);
                dp.quantity = Math.abs(marginData[symbol + '_pe']);
                dp.tradingsymbol = dp.scrip + minStrike + 'PE';
                dp.pece = 'PE';
                dp.strike = minStrike;
                data.push(dp);
            }

            if (marginData[symbol + '_ce'] < 0) {
                debug(' CE saving possible ' + maxStrike);
                dc.quantity = Math.abs(marginData[symbol + '_ce']);
                dc.tradingsymbol = dc.scrip + maxStrike + 'CE';
                dc.pece = 'CE';
                dc.strike = maxStrike;
                data.push(dc);
            }


            debug(data);


            calculateMargin(data).then(margin2 => {
                debug(symbol + ' later ' + formatter.format(margin2));
                alert(`You can potentially FREE approx ${formatter.format(margin1 - margin2)} margin by taking following hedge. BUY ${Math.abs(marginData[symbol + '_pe'])} x ${symbol} ${minStrike}PE and BUY ${symbol} ${Math.abs(marginData[symbol + '_ce'])} x ${maxStrike}CE`)
            });
        });


    });

    // Object.keys(marginData).forEach(function(symbol) {
    //     debug(symbol);
    //     if(symbol.includes('_md')) {
    //         var data = marginData[symbol];
    //         debug(data);

    //         calculateMargin(data).then(margin => {
    //             debug(symbol + ' ' + formatter.format(margin));
    //         });
    //     }
    // });


}

function resetSubFilter() {
    g_showOnlyPEPositions = false;
    g_showOnlyCEPositions = false;
    g_showOnlyMISPositions = false;
    g_showOnlyOPTPositions = false;
    g_showOnlyFUTPositions = false;
    g_subFilter = false;
    g_subFilterData = false;
}

// all behavior related actions go here.
function main() {
    GM_registerMenuCommand("Reset Data (WARNING) " + VERSION, function () {
        if (confirm('Are you sure you want to reset all tag data?')) {
            if (confirm('I am checking with you one last time, are you sure?')) {
                tEv("kite", "menu", "reset", "");

                GM_setValue(GM_HOLDINGS_NAME, {});
                GM_setValue(GMPositionsName, {});
                GM_setValue(GMRefTradeName, {});

                window.location.reload();
            }
        }

    }, "r");

    //sub filter change
    jQ(document).on('change', "#subFilterDropdownId", function () {
        tEv("kite", this.id, "click", "");
        var filterValue = this.value;
        debug(`${filterValue} selected`);

        resetSubFilter();

        // if (filterValue == 'all') {
        //     simulateSelectBoxEvent();
        //     return;
        // }

        // var allVisibleRows = jQ(allDOMPaths.PathForPositions + ":visible");

        // allVisibleRows.each(function (rowIndex) {
        //     var position = getPositionRowObject(this);
        //     var p = getSensibullZerodhaTradingSymbol(jQ(jQ(this).find('td')[2]).text());

            switch (filterValue) {
                case 'mis':
                    g_showOnlyMISPositions = true;
                    // if (position.product == 'MIS') {

                    // } else {
                    //     jQ(this).hide();
                    // }
                    break;
                case 'pe':
                    // if (position.pece == 'PE') {

                    // } else {
                    //     jQ(this).hide();
                    // }
                    g_showOnlyPEPositions = true;
                    break;
                case 'ce':
                    // if (position.pece == 'CE') {

                    // } else {
                    //     jQ(this).hide();
                    // }
                    g_showOnlyCEPositions = true;
                    break;
                case 'fut':
                    // if (position.optfut == 'FUT') {

                    // } else {
                    //     jQ(this).hide();
                    // }
                    g_showOnlyFUTPositions = true;
                    break;
                case 'opt':
                    // if (position.optfut == 'OPT') {

                    // } else {
                    //     jQ(this).hide();
                    // }
                    g_showOnlyOPTPositions = true;
                    break;
                case 'all':
                    break;
                case 'reset':
                    jQ('#subFilterDropdownId').val('all');
                    jQ('#allSubFilterId').prop('text', 'All');
                    break;
                default:
                    debug(`setting default`);
                    g_subFilter = true;
                    g_subFilterData = this.value;
                    // if (getExpiryText(p) == filterValue || position.scrip == filterValue) {
                    //     //let filter decision pass
                    // } else {
                    //     //overide filter decision and hide.
                    //     jQ(this).hide();
                    // }
                    
                // code block
            }
        // });

        // info(filterValue + g_showOnlyPEPositions);
        simulateSelectBoxEvent();
    });

    //click of mis filter
    // jQ(document).on('click', "#misFilterId", function () {
    //     tEv("kite", "misfilter", "click", "");
    //     var filterValue = this.value;
    //     g_showOnlyMISPositions = this.checked;

    //     info(filterValue + g_showOnlyMISPositions);
    //     simulateSelectBoxEvent();
    // });

    //click of CE filter
    // jQ(document).on('click', "#ceFilterId", function () {
    //     tEv("kite", "cefilter", "click", "");
    //     var filterValue = this.value;
    //     g_showOnlyCEPositions = this.checked;

    //     info(filterValue + g_showOnlyCEPositions);
    //     simulateSelectBoxEvent();
    // });

    //click of select all filter
    jQ(document).on('click', "#selectAllId", function () {
        tEv("kite", "selectAllFilter", "click", "");
        var allVisibleRows = jQ(allDOMPaths.PathForPositions + ":visible");

        debug('found visible rows: ' + allVisibleRows.length);

        jQ(document).off('change', "input.su-checkbox", onSuCheckboxSelection);

        var lastOne;
        allVisibleRows.each(function (rowIndex) {
            lastOne = jQ(this).find('input.su-checkbox');
            lastOne.click();
        });

        //lastOne.trigger('change');
        setTimeout(onSuCheckboxSelection, 10);

        jQ(document).on('change', "input.su-checkbox", onSuCheckboxSelection);

        //simulateSelectBoxEvent();
    });

    jQ(document).on('click', "#hideRestId", function () {
        tEv("kite", "hideRestFilter", "click", "");
        //var allVisibleRows = jQ(allDOMPaths.PathForPositions + ":not(.selected)").hide();
        var allVisibleRows = jQ(allDOMPaths.PathForPositions + ".selected").hide();
        jQ(jQ(allDOMPaths.PathForPositions + ".selected")).find('input.su-checkbox').click();
        setTimeout(onSuCheckboxSelection, 10);
    });

    jQ(document).on('click', "#resetRowsId", function () {
        tEv("kite", "restSubFilterFilter", "click", "");
        resetSubFilter();
        jQ('#subFilterDropdownId').val('all');
        simulateSelectBoxEvent();
    });


    //click on save margin button
    jQ(document).on('click', "#saveMarginBtnId", function () {
        tEv("kite", "saveMarginBtnId", "click", "");
        checkMarginSaving();
    });

    //click of PE filter
    // jQ(document).on('click', "#peFilterId", function () {
    //     tEv("kite", "pefilter", "click", "");
    //     var filterValue = this.value;
    //     g_showOnlyPEPositions = this.checked;

    //     info(filterValue + g_showOnlyPEPositions);
    //     simulateSelectBoxEvent();
    // });

    //click of watchlist filter
    jQ(document).on('click', "#watchlistFilterId", function () {
        tEv("kite", "watchlistfilter", "click", "");
        var h = prompt("Provide filter text. Press Esc or Click cancel to reset filter.", filterText);
        if (h == null || h == "") {
            filterText = "";
            jQ("#watchlistFilterId").text("Filter");
            filterWatchlist(filterText, "All");
            return;
        } else {
            filterText = h.toUpperCase();
            filterWatchlist(filterText, "");
            jQ("#watchlistFilterId").text("Filter *");
        }
    });

    //on click of + to assign tag to holdings
    jQ(document).on('click', "#tagAddIcon", function () {
        tEv("kite", "holdingsaddtag", "click", "");
        var stock = jQ(this).attr('value');
        var tagName = prompt('Which group do you want to put ' + stock + ' in?');

        if (tagName == null) return;
        tagName = tagName.toUpperCase();

        //get existing array, if not present create
        if (holdings[tagName]) {
            var existingArray = holdings[tagName];
            if (!existingArray.includes(stock)) {
                existingArray.push(stock);
            }
        } else {
            holdings[tagName] = [stock];
        }

        GM_setValue(GM_HOLDINGS_NAME, holdings);
        tEv("kite", "holdingsaddtag", "add", "");
        debug(holdings);
        window.location.reload();
    });

    //on click of a holding tag. ask user if they want to remove the tag
    jQ(document).on('click', "#idForTagDeleteAction", function () {
        tEv("kite", "holdingsdeletetag", "click", "");
        var stock = jQ(this).attr('stock');
        var tagName = jQ(this).attr('tag');

        if (confirm('Do you want to remove this tag?')) {
            //get existing array
            var existingArray = holdings[tagName];
            existingArray.splice(existingArray.indexOf(stock), 1);

            if (existingArray.length < 1) {
                delete (holdings[tagName]);
            }


            GM_setValue(GM_HOLDINGS_NAME, holdings);
            tEv("kite", "holdingsdeletetag", "delete", "");
            debug(holdings);
            window.location.reload();
        }
    });

    //on click of + to assign tag to positions
    jQ(document).on('click', "#positionTagAddIcon", function () {
        tEv("kite", "positionsaddtag", "click", "");
        var position = jQ(this).attr('value');
        var userTag = prompt('Please provide tag name and color. For eg: MT.red or RT.blue or BS.green');

        if (userTag == null) return;

        //get existing array, if not present create
        var existingArray = referenceTrades[userTag];
        if (existingArray) {
            if (!existingArray.includes(position)) {
                existingArray.push(position);
            }
        } else {
            referenceTrades[userTag] = [position];
        }

        GM_setValue(GMRefTradeName, referenceTrades);
        tEv("kite", "positionsaddtag", "add", "");

        jQ(this).parents()
            .map(function () {
                if (this.tagName == 'TR') {
                    var positionSpan = jQ(this).find("span.exchange.text-xxsmall.dim");
                    var color = userTag.split(".")[1];
                    var tn = userTag.split(".")[0];
                    jQ(positionSpan).append("<span random-att='tagName' class='randomClassToHelpHide'>&nbsp;</span><span id='idForPositionTagDeleteAction' tag='" + userTag + "' position='" + position + "' class='text-label " + color + " randomClassToHelpHide'>" + tn + "</span>");
                }
            });


        // window.location.reload();
    });

    //on click of a position tag. ask user if they want to remove the tag
    jQ(document).on('click', "#idForPositionTagDeleteAction", function () {
        tEv("kite", "positionsdeletetag", "click", "");
        var position = jQ(this).attr('position');
        var tagName = jQ(this).attr('tag');

        if (confirm('Do you want to remove this tag?')) {
            //get existing array
            var existingArray = referenceTrades[tagName];
            existingArray.splice(existingArray.indexOf(position), 1);

            if (existingArray.length < 1) {
                delete (referenceTrades[tagName]);
            }


            GM_setValue(GMRefTradeName, referenceTrades);
            tEv("kite", "positionsdeletetag", "delete", "");

            //window.location.reload();
            jQ(this).remove();
        }
    });

    //click of positions header
    jQ(document).on('click', allDOMPaths.positionHeader, function () {
        tEv("kite", "positions", "toggle", "");
        var currentUrl = window.location.pathname;
        if (currentUrl.includes('positions')) {
            debug('click on positions header.');
            if (jQ('#tagSelectorP').is(":visible")) {
                hideDropdown();
            } else {
                showPositionDropdown();
            }
        }
    });

    //click of Holdings header
    jQ(document).on('click', allDOMPaths.domPathMainInitiatorLabel, function () {
        tEv("kite", "holdings", "toggle", "");
        var currentUrl = window.location.pathname;
        if (currentUrl.includes('holdings')) {
            debug('click on holdings header.');
            if (jQ('#tagSelectorH').is(":visible")) {
                hideDropdown();
            } else {
                showHoldingDropdown();
            }
        }
    });


    //click of Positions row to copy pos id
    jQ(document).on('click', allDOMPaths.PathForPositions, function () {
        var dataUidInTR = this.getAttribute(allDOMPaths.attrNameForInstrumentTR);

        //var text = dataUidInTR.split(".")[1];

        var text = getSensibullZerodhaTradingSymbol(jQ(jQ(this).find('td')[2]).text());
        navigator.clipboard.writeText(text).then(function () {
            debug('Async: Copying to clipboard was successful!');
        }, function (err) {
            debug('Async: Could not copy text: ', err);
        });
    });


    //whenever selection in position row changes.
    jQ(document).on('change', "input.su-checkbox", onSuCheckboxSelection);

    //fire hide/show logic if history/url changes.
    var pushState = history.pushState;
    history.pushState = function () {
        pushState.apply(history, arguments);
        debug('pushstate call toggle');
        var currentUrl = window.location.pathname;
        toggleDropdown(currentUrl);

        // if (currentUrl.includes('funds')) {
        //     waitForKeyElements("#app > div.container.wrapper > div.container-right > div > div.margins > div.row > div:nth-child(1) > div > table > tbody > tr:nth-child(1)", showFundsHelp);
        // }
        // if (currentUrl.includes('positions')) {
        //     updatePnl(true);
        // }
    };

    //on click of watchlist tab (1-5)
    jQ(document).on('click', allDOMPaths.domPathTabToChangeWatchlist, function () {
        info("clicked on: " + jQ(this).attr("id"));
        if (jQ(this).attr("id") == "watchlistFilterId") {
            //do nothing
        } else {
            simulateSelectBoxEvent();
        }
    });

    //logic to scroll relevant stock in holding and highlight it
    jQ(document).on('click', allDOMPaths.domPathWatchlistRow, function () {
        var watchlistStock = jQ(this).find(allDOMPaths.domPathStockNameInWatchlistRow).html();
        debug("clicked on : " + watchlistStock);

        var holdingTRs = jQ(allDOMPaths.rowsFromHoldingsTable);

        jQ.expr[':'].regex = function (elem, index, match) {
            var matchParams = match[3].split(','),
                validLabels = /^(data|css):/,
                attr = {
                    method: matchParams[0].match(validLabels) ?
                        matchParams[0].split(':')[0] : 'attr',
                    property: matchParams.shift().replace(validLabels, '')
                },
                regexFlags = 'ig',
                regex = new RegExp(matchParams.join('').replace(/^\s+|\s+jQ/g, ''), regexFlags);
            return regex.test(jQ(elem)[attr.method](attr.property));
        }

        //tigadam for stocks with & in name
        if (watchlistStock.indexOf('&') >= 0) {
            watchlistStock = watchlistStock.slice(0, watchlistStock.indexOf('&amp;')) + '&' + watchlistStock.slice(watchlistStock.indexOf('&amp;') + 5, watchlistStock.length);
        }
        var holdingStockTR = jQ("tr:regex(" + allDOMPaths.attrNameForInstrumentTR + ", ^" + watchlistStock + ".*)");

        if (holdingStockTR.length > 0) {
            debug("found holding row for scrolling : " + holdingStockTR);
            var w = jQ(window);
            w.scrollTop(holdingStockTR.offset().top - (w.height() / 2));
            jQ(holdingStockTR).css("background-color", 'lightGray');
            setTimeout(function () { jQ(holdingStockTR).css("background-color", 'var(--color-bg-default)'); }, 4000);
        }
    });

    waitForKeyElements("span.margin-value", showRoiNudge);
    waitForKeyElements("div.value.final-margins-value", showBasketRoiNudge);

}

function showRoiNudge() {
    if (jQ("div.instrument > span.transaction-type").text().trim() == 'Sell') {
        updateRoiNudge();
        var target = jQ("span.margin-value")[0];
        var obs = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type == "characterData") {
                    updateRoiNudge();
                }
            });
        });

        // Configuration of the observer:
        config = {
            characterData: true,
            subtree: true
        };

        // Pass in the target node, as well as the observer options
        obs.observe(target, config);

        jQ(document).on('change', 'input[label="Price"]', function () {
            updateRoiNudge();
        });
    }
}

function updateRoiNudge() {
    var lastPrice = 0;
    var margin = jQ("span.margin-value").text().trim().split('₹').join("").split(",").join("");
    var qty = jQ('input[label="Qty."]').val();

    if (jQ('input[value="MARKET"]').prop('checked') == true) {
        lastPrice = jQ('div > span.last-price').text().trim().split('₹').join("").split(",").join("");
    }
    if (jQ('input[value="LIMIT"]').prop('checked') == true) {
        debug();
        lastPrice = jQ('input[label="Price"]').val();
    }
    debug(lastPrice);
    debug(qty);
    debug(qty * lastPrice);

    jQ('#nudgepremiumid').remove();
    jQ('footer.footer > div > div:nth-child(1)').append(`<div id="nudgepremiumid" class="row margins"><span class="label">Premium Recvd: </span> <span >${formatter.format(qty * lastPrice)} (ROI: ${(((qty * lastPrice) / margin) * 100).toFixed(2)}%)</span></div>`);

}

function showBasketRoiNudge() {
    updateBasketRoiNudge();
    var target = jQ("div.value.final-margins-value")[0];
    var obs = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type == "characterData") {
                updateBasketRoiNudge();
            }
        });
    });

    // Configuration of the observer:
    config = {
        characterData: true,
        subtree: true
    };

    // Pass in the target node, as well as the observer options
    obs.observe(target, config);

    jQ(document).on('change', 'div.value.dim', function () {
        updateBasketRoiNudge();
    });

}

function updateBasketRoiNudge() {
    var finalMargin = jQ("div.value.final-margins-value").text().trim().split('₹').join("").split(",").join("");
    var requiredMargin = jQ("div.value.dim").text().trim().split('₹').join("").split(",").join("");
    var basketPositions = jQ(allDOMPaths.PathForBasketPositions);
    var premium = 0;
    basketPositions.each(function (rowIndex) {
        var transactionType = jQ(jQ(this).find("td")[0]).text().trim();
        var qty = parseFloat(jQ(jQ(this).find("td")[4]).text().split(',').join(''));
        var price = parseFloat(jQ(jQ(this).find("td")[5]).text().split(",").join(""));
        premium += qty * price * (transactionType == 'SELL' ? 1 : -1);
    });
    debug(finalMargin);
    jQ('#basketnudgepremiumid').remove();
    jQ('div.eight.columns.margins-summary > div > div:nth-child(1)').append(`<div id="basketnudgepremiumid" class="su-checkbox-group consider-positions"><span class="su-checkbox-value">Premium Recvd: </span> <span >${formatter.format(premium)} (Max ROI: ${((premium / requiredMargin) * 100).toFixed(2)}%)</span></div>`);

}

function showFundsHelp() {
    debug('showFundsHelp');

    var helpText = ["You can use this amount to place new trades. The available margin includes the benefit of pledging collateral, the premium received from shorting options, funds added during the day, the effect of realised profits & losses, and unrealised losses.",
        "You have used this amount towards trades during the day. The used margin can be negative if you have generated some funds by selling your holdings, closing F&O positions, or making intraday gains.",
        "This is the current cash balance in your account. If your available cash balance is negative, you will be charged interest.",
        "This is the cash available in your trading account at the beginning of the day.",
        "The funds you add to your trading account during the day reflect as the payin balance.",
        "This is a part of the amount blocked for your F&O trades. You can also check SPAN on our margin calculator. ",
        "This is the margin blocked when you sell securities (20% of the value of stocks sold) from your demat or T1 holdings. As per the peak margin norms, only 80% of credit from selling your holdings will be available for new trades. The funds blocked under this field will be available from the next trading day. The delivery margin also includes additional margin blocked if you have any F&O positions due for physical delivery. ",
        "This is a part of the amount blocked for your F&O trades. You can also check the exposure margin here.",
        "The total amount you have paid to purchase options. This value will be negative if you have received funds for shorting/writing options.",
        "This amount is made available for trading against Liquidbees ETFs or liquid mutual funds you have pledged.",
        "This amount is made available for trading against stocks/ETFs you have pledged.",
        "This is the sum total of liquid funds and equity collateral."];

    var allRows = jQ("#app > div.container.wrapper > div.container-right > div > div.margins > div.row > div:nth-child(1) > div > table > tbody > tr");
    debug(allRows.length);
    allRows.each(function (rowIndex) {
        var stock = jQ(this).attr('title', helpText[rowIndex]);
        debug(jQ(this));
        debug(stock);
        debug(helpText[rowIndex]);
    });

}

function waitForKeyElements(
    selectorTxt,    /* Required: The jQuery selector string that
                        specifies the desired element(s).
                    */
    actionFunction, /* Required: The code to run when elements are
                        found. It is passed a jNode to the matched
                        element.
                    */
    bWaitOnce,      /* Optional: If false, will continue to scan for
                        new elements even after the first match is
                        found.
                    */
    iframeSelector  /* Optional: If set, identifies the iframe to
                        search.
                    */
) {
    var targetNodes, btargetsFound;

    if (typeof iframeSelector == "undefined")
        targetNodes = jQ(selectorTxt);
    else
        targetNodes = jQ(iframeSelector).contents()
            .find(selectorTxt);

    if (targetNodes && targetNodes.length > 0) {
        btargetsFound = true;
        /*--- Found target node(s).  Go through each and act if they
            are new.
        */
        targetNodes.each(function () {
            var jThis = jQ(this);
            var alreadyFound = jThis.data('alreadyFound') || false;

            if (!alreadyFound) {
                //--- Call the payload function.
                var cancelFound = actionFunction(jThis);
                if (cancelFound)
                    btargetsFound = false;
                else
                    jThis.data('alreadyFound', true);
            }
        });
    }
    else {
        btargetsFound = false;
    }

    //--- Get the timer-control variable for this selector.
    var controlObj = waitForKeyElements.controlObj || {};
    var controlKey = selectorTxt.replace(/[^\w]/g, "_");
    var timeControl = controlObj[controlKey];

    //--- Now set or clear the timer as appropriate.
    if (btargetsFound && bWaitOnce && timeControl) {
        //--- The only condition where we need to clear the timer.
        clearInterval(timeControl);
        delete controlObj[controlKey]
    }
    else {
        //--- Set a timer, if needed.
        if (!timeControl) {
            timeControl = setInterval(function () {
                waitForKeyElements(selectorTxt,
                    actionFunction,
                    bWaitOnce,
                    iframeSelector
                );
            },
                300
            );
            controlObj[controlKey] = timeControl;
        }
    }
    waitForKeyElements.controlObj = controlObj;
}

function orderInfo() {
    debug('orderInfo');

    var ts = jQ(BASE_ORDERINFO_DOM + " > div > div > div > h3.tradingsymbol").text().trim().split(' ');
    var tradingsymbol = ts[0];

    var i = document.createElement("INPUT");
    i.type = 'button';
    i.name = 'copyOrder';
    i.value = 'Copy Order (' + g_tradingBasket.length + ')'
    i.id = 'copyOrder';
    i.classList.add('button');
    i.classList.add('button-outline');

    if (JSON.stringify(g_tradingBasket).includes("\"" + tradingsymbol + "\"")) {
        i.value = 'Already Copied. Close';
        i.onclick = function () {
            var buttons = jQ("#app > div.container.wrapper > div.container-right > div > div > div > div > div > div.modal-footer > div > button");
            buttons[buttons.length - 1].click();
        };
    } else {
        i.onclick = function () {
            var ts = jQ(BASE_ORDERINFO_DOM + " > div > div > div > h3.tradingsymbol").text().trim().split(' ');
            var tradingsymbol = ts[0];
            debug(tradingsymbol);
            var exchange = ts[1];
            debug(exchange);

            var transactionType = jQ(BASE_ORDERINFO_DOM + " > div.modal-header > div > div.eight.columns.tradingsymbol-wrapper > span").text().trim();
            debug(transactionType);

            var orderType = jQ(BASE_ORDERINFO_DOM + " > div.modal-body > div > div > div.four.columns.left.mobile-modal > div:nth-child(5) > div.six.columns.text-right > div.order-type").text().trim();
            debug(orderType);

            var product = jQ(BASE_ORDERINFO_DOM + " > div.modal-body > div > div > div.four.columns.left.mobile-modal > div:nth-child(6) > div.six.columns.text-right > div.product").text().trim();
            debug(product);

            var quantity = jQ(BASE_ORDERINFO_DOM + " > div.modal-body > div > div > div.four.columns.left.mobile-modal > div:nth-child(1) > div.six.columns.text-right > div").text().trim().split('/')[0];

            var price = jQ(BASE_ORDERINFO_DOM + " > div.modal-body > div > div > div.four.columns.left.mobile-modal > div:nth-child(3) > div.six.columns.text-right > div").text().trim();
            debug(price);

            if (!JSON.stringify(g_tradingBasket).includes("\"" + tradingsymbol + "\"")) {
                g_tradingBasket.push({ "product": product, "variety": "regular", "tradingsymbol": tradingsymbol, "exchange": exchange, "transaction_type": transactionType, "order_type": orderType, "price": parseFloat(price), "quantity": parseInt(quantity), "readonly": false });

                navigator.clipboard.writeText(JSON.stringify(g_tradingBasket));


                updateOrderButtons();
                tEv("kite", "order", "copyOrder", "");
            } else {
                debug('not adding order to basket');
                debug(JSON.stringify(g_tradingBasket));
            }

            var buttons = jQ("#app > div.container.wrapper > div.container-right > div > div > div > div > div > div.modal-footer > div > button");
            buttons[buttons.length - 1].click();
        };
    }

    //#app > div.container.wrapper > div.container-right > div.page-content.orders > div > div > div > div > div.modal-footer > div > button.button.button-orange.button-outline

    jQ(BASE_ORDERINFO_DOM + " > div > div > button")[0].before(i);
}

//copy orders (not used)
jQ(document).on('click', 'section.completed-orders-wrap.table-wrapper > div > div > table > tbody > tr', function () {

    //[{"variety": "regular","tradingsymbol": "INFY","exchange": "NSE","transaction_type": "BUY","order_type": "MARKET","quantity": 1,"readonly": false}]

    var variety = jQ(this).find("td.product").html().trim();
    debug(variety);
    var tradingsymbol = jQ(this).find("td.instrument > span.tradingsymbol").text().trim();
    debug(tradingsymbol);
    var exchange = jQ(this).find("td.instrument > span.exchange").html().trim();
    debug(exchange);
    var transactionType = jQ(this).find("td.transaction-type").text().trim();
    debug(transactionType);
    var quantity = jQ(this).find("td.quantity.right").html().trim().split('/')[0];
    var price = jQ(this).find("td.average-price.right").text().trim();
    debug(price);

});

function showSendOrderButton() {
    var div = document.createElement("DIV");
    div.style = 'float:right';

    var form = document.createElement("FORM");
    form.method = 'post';
    form.id = 'bo_basket-form';
    form.action = "https://kite.zerodha.com/connect/basket";
    form.classList.add("randomClassToHelpHide");

    var i = document.createElement("INPUT");
    i.type = 'hidden';
    i.name = 'api_key';
    i.value = '4s0c0wfr478wne1s';
    i.classList.add("randomClassToHelpHide");

    jQ(form).append(i);

    i = document.createElement("INPUT");
    i.type = 'hidden';
    i.name = 'data';
    i.id = 'bobasket';
    i.classList.add("randomClassToHelpHide");

    jQ(form).append(i);

    i = document.createElement("INPUT");
    i.type = 'button';
    i.name = 'sendOrder';
    i.value = 'Send Order';
    i.classList.add("randomClassToHelpHide");
    i.classList.add('button');
    i.classList.add('button-outline');
    i.id = 'sendOrder';

    jQ(form).append(i);

    i = document.createElement("INPUT");
    i.type = 'button';
    i.name = 'resetOrder';
    i.value = 'Reset Order';
    i.classList.add("randomClassToHelpHide");
    i.classList.add('button');
    i.classList.add('button-outline');
    i.id = 'resetOrder';

    jQ(form).append(i);

    jQ(div).append(form);

    jQ(document).on('click', "#sendOrder", async function () {
        debug('submiting send ordre');
        const t = await navigator.clipboard.readText();
        jQ('#bobasket').val(t);

        //g_tradingBasket.splice(0, g_tradingBasket.length);
        //navigator.clipboard.writeText("");
        jQ("#bo_basket-form").submit();
        tEv("kite", "order", "sendOrderClick", "");
    });

    jQ(document).on('mouseenter', "#sendOrder", async function () {
        debug('refreshing mouse enter');

        updateOrderButtons();

        tEv("kite", "order", "sendOrderMouseOver", "");
    });

    jQ(document).on('click', "#resetOrder", async function () {
        debug('reset order');
        navigator.clipboard.writeText("");
        updateOrderButtons();
        tEv("kite", "order", "resetOrder", "");
    });
    if (jQ("div.container.wrapper > div.container-right > div.page-nav").length < 1) {
        debug('sleeping as couldnt find order div');

        //setTimeout(function(){ jQ("div.container.wrapper > div.container-right > div.page-nav").append(div); }, 1100);
        return;
    }

}

async function updateOrderButtons() {
    const t = await navigator.clipboard.readText();

    try {
        g_tradingBasket = JSON.parse(t);
    } catch (err) {
        g_tradingBasket.splice(0, g_tradingBasket.length);
        debug("There was error in parsing order");
    }
    jQ("#sendOrder").val('Send Order (' + g_tradingBasket.length + ')');
}

//click on order header
// var orderHeader = 'section.completed-orders-wrap.table-wrapper > header';
// jQ(document).on('click', orderHeader, function () {
//     tEv("kite","order","toggle","");

//     if (jQ('#sendOrder').is(":visible")) {
//         //do nothing

//         //g_tradingBasket = new Array();
//         g_tradingBasket.splice(0, g_tradingBasket.length);
//         navigator.clipboard.writeText("");
//         //jQ(".randomClassToHelpHide").remove();
//         jQ("#bo_basket-form").remove();
//     } else {
//         showSendOrderButton();

//     }

// });

//div holding ready-made strategies.
//div.modal-mask.positios-info-container.positions-info-modal > div.modal-wrapper > div.modal-container.layer-2
waitForKeyElements(BASE_ORDERINFO_DOM, orderInfo);

function changePnLFilter() {
    debug('changePnLFilter');
    document.getElementsByTagName('select')[0].selectedIndex = 2; //FO
    document.querySelector("input[name='date']").click();

    var today = new Date();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();

    if (mm < 10) {
        mm = '0' + mm;
    }
    var monthStart = yyyy + '-' + mm + '-01';

    document.querySelector("td[title='" + monthStart + "']").click();
    document.querySelector('#app > div.wrapper > div > div > div > form > div > div.one.columns > button').click()
    //2021-02-03 ~ 2021-03-01
}

function introducePnlFilter() {
    debug('introducePnlFilter');
    var spanForFilter = document.createElement("span");
    spanForFilter.classList.add("randomClassToHelpHide");
    //spanForFilter.style="margin: 15px 0;margin-top: 15px;margin-right: 0px;margin-bottom: 15px;margin-left: 0px;border-right: 1px solid #e0e0e0;border-right-width: 1px;border-right-style: solid;border-right-color: rgb(224, 224, 224);padding: 0 10px;"
    spanForFilter.textContent = 'F&O This Month';
    spanForFilter.id = 'customFilter';
    spanForFilter.addEventListener("click", () => changePnLFilter());

    jQ(BASE_PNL_REPORT).after(spanForFilter);

    // jQ(document).on('click', "#customPnlFilter", function () {
    // }

}

//NOT WORKING waitForKeyElements (BASE_PNL_REPORT, introducePnlFilter);

//sensibull inside kite
//watching for 'do more with strategy builder' link
waitForKeyElements("a:contains('Do more with Strategy Builder')", sensibull);

var previousArray = [];
function sensibull(firstTry = true) {
    debug('sensibull');
    tEv("kite", "positions", "sensibull", "");

    var rows = jQ(allDOMPaths.sensibullRows);
    //debug(d);
    debug(rows.length);
    if (firstTry && rows.length < 1) {
        setTimeout(function () { sensibull(false); }, 1000);
        return;
    }

    var selectBox = document.createElement("SELECT");
    selectBox.id = "toggleSelectboxID";
    selectBox.classList.add("randomClassToHelpHide");
    //selectBox.style="margin: 15px 0;margin-top: 15px;margin-right: 0px;margin-bottom: 15px;margin-left: 0px;background-color: var(--color-bg-default)"

    var option = document.createElement("option");
    option.text = "Toggle";
    option.value = "All";
    selectBox.add(option);

    var expiryArray = [];
    rows.each(function (rowIndex) {
        var exp = jQ(this).find('th > div > div:nth-child(3)').text().split(" ")[2];

        if (!expiryArray.includes(exp)) {
            expiryArray.push(exp);

            var option = document.createElement("option");
            option.text = exp;
            option.value = exp;
            selectBox.add(option);
        }
    });

    if (arrayEquals(previousArray, expiryArray)) {
        debug('ignore array set');
        return;
    } else {
        previousArray = expiryArray;
    }
    jQ('#toggleSelectboxID').remove();
    //document.querySelector("")
    jQ("span:contains('F&O Instruments')").after(selectBox);

    selectBox.addEventListener("change", function () {
        tEv("kite", "positions", "sensibull", "expiry-filter");
        var selectedItem = this.value;
        debug(selectedItem);

        var rows = jQ(allDOMPaths.sensibullRows);
        rows.each(function (rowIndex) {
            var t = jQ(this).find('th > div > div:nth-child(3)').text().split(" ")[2];

            //console.log('bs: text to cmp' + t.toUpperCase());
            debug('toggle for ' + t);
            if (selectedItem == 'All' || t.toUpperCase() == selectedItem.toUpperCase()) {
                debug('toggle : success');
                var c = jQ(this).find(allDOMPaths.sensibullRowCheckbox)[0].click();
            }
        });
    });

    var strategySelectBox = document.createElement("SELECT");
    strategySelectBox.id = "userStrategiesId";
    strategySelectBox.classList.add("randomClassToHelpHide");
    strategySelectBox.style = "margin: 15px 0;margin-top: 15px;margin-right: 0px;margin-bottom: 15px;margin-left: 0px;font-size: 12px;background-color: var(--color-bg-default)"

    //add options to the positions select drop down
    for (var key in positions) {
        option = document.createElement("option");
        option.text = key;
        option.value = key;
        strategySelectBox.add(option);
    };

    jQ('#userStrategiesId').remove();
    jQ(".style__StyledBrandLogo-t0trse-8").before(strategySelectBox);
    

    strategySelectBox.addEventListener("change", function () {
        tEv("kite", "positions", "sensibull", "strategy-filter");
        var selectedItem = this.value;
        info(selectedItem);

        var script = jQ(jQ(allDOMPaths.sensibullScriptSelected)[0]).text().split(' ')[0];

        var selectedPositions = positions[selectedItem].map(value => value.toUpperCase());
        debug(selectedPositions);

        var rows = jQ(allDOMPaths.sensibullRows);
        //rest all.
        rows.each(function (rowIndex) {
            debug(jQ(this).find(allDOMPaths.sensibullRowCheckbox)[0].checked);
            if (jQ(this).find(allDOMPaths.sensibullRowCheckbox)[0].checked == false) {
                var c = jQ(this).find(allDOMPaths.sensibullRowCheckbox)[0].click();
            }
        });
        rows.each(function (rowIndex) {
            var t = `${script} ${jQ(this).find('th > div > div:nth-child(3)').text().split(" ").slice(2).join(" ")}`;

            debug('comparing sesibull position ' + t);
            if (!selectedPositions.includes(t.toUpperCase())) {
                var c = jQ(this).find(allDOMPaths.sensibullRowCheckbox)[0].click();
            }
            // if (t.toUpperCase() == selectedItem.toUpperCase()) {
            //     debug('toggle : success');
            //     var c = jQ(this).find(allDOMPaths.sensibullRowCheckbox)[0].click();
            // }
        });
    });
}

function arrayEquals(a, b) {
    return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index]);
}

//div.InstrumentPickerSymbolWrapper
waitForKeyElements('div[role=combobox]', listenToSymbolChange);
function listenToSymbolChange() {
    debug('listenToSymbolChange');
    jQ(document).off('click', "div[role=combobox]", handleSymbolClick);
    jQ(document).on('click', "div[role=combobox]", handleSymbolClick);
}

function handleSymbolClick(event) {
    debug('listenToSymbolChange click');
    //stopImmediatePropagation
    event.stopPropagation();
    tEv("kite", "positions", "sensibull", "symbol-change");

    setTimeout(() => sensibull1(), 3000);
}

function sensibull1() {
    debug('sensbulll1');
    sensibull(false);
}

//debug(getLastThursday('Jan'));

function getLastThursday(m, year) {

    debug(MONTHS.indexOf(m.toUpperCase()));
    var month = MONTHS.indexOf(m.toUpperCase()) + 1;

    var d = new Date();
    if (year) { d.setFullYear(year); }
    d.setDate(1); // Roll to the first day of ...
    d.setMonth(month || d.getMonth() + 1); // ... the next month.
    do { // Roll the days backwards until Monday.
        d.setDate(d.getDate() - 1);
    } while (d.getDay() !== 4);

    let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
    let mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(d);
    return da + mo;
}


jQ.fn.exists = function () {
    return this.length !== 0;
}

tEv("kite", "visit", "main", VERSION);