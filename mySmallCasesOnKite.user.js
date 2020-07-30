// ==UserScript==
// @name         mySmallCasesOnKite
// @namespace    http://mySmallCasesOnKite.net/
// @version      0.6
// @description  Introduces small features on top of kite app
// @author       Amit
// @match        https://kite.zerodha.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js
// @downloadURL  https://github.com/amit0rana/betterKite/raw/master/mySmallCasesOnKite.user.js
// @updateURL    https://github.com/amit0rana/betterKite/raw/master/mySmallCasesOnKite.meta.js
// ==/UserScript==

window.jQ=jQuery.noConflict(true);
var D_LEVEL_INFO = 2;
var D_LEVEL_DEBUG = 1;
var D_LEVEL = D_LEVEL_INFO;

var log = function(level, logInfo) {
    if (level >= D_LEVEL) {
        console.log(logInfo);
    }
}
var debug = function(logInfo) {
    log( D_LEVEL_DEBUG , logInfo);
}
var info = function(logInfo) {
    log( D_LEVEL_INFO , logInfo);
}
var allDOMPaths = {
    rowsFromHoldingsTable : "div.holdings > section > div > div > table > tbody > tr",
    attrNameForInstrumentTR : "data-uid",
    domPathWatchlistRow : "div.instruments > div > div.vddl-draggable.instrument",
    domPathPendingOrdersTR : "div.pending-orders > div > table > tbody > tr",
    domPathExecutedOrdersTR : "div.completed-orders > div > table > tbody > tr",
    domPathTradingSymbolInsideOrdersTR : "span.tradingsymbol > span",
    domPathStockNameInWatchlistRow : "span.nice-name",
    domPathMainInitiatorLabel : "h3.page-title.small > span",
    domPathTabToChangeWatchlist : "ul.marketwatch-selector.list-flat > li",
    PathForPositions : "div.positions > section.open-positions.table-wrapper > div > div > table > tbody > tr",
    positionHeader: "header.row.data-table-header"
};
var holdings = initHoldings();

var positions = initPositions();

var referenceTrades = initReferenceTrades();
const formatter = Intl.NumberFormat('en-IN', { 
    style: 'currency', currency: 'INR'
});

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

    var GMHoldingsName = "BK_HOLDINGS";
    var defaultHoldings = {
      "Dividend" : ["SJVN","VEDL"],
      "Wealth Creators" : ["WHIRLPOOL","ICICIBANK",],
      "Sell On profit" : ["LUMAXIND","RADICO","M&amp;M"]
    };
    var holdings = GM_getValue(GMHoldingsName,defaultHoldings);

    GM_registerMenuCommand("Set Holdings", function() {
        var h = GM_getValue(GMHoldingsName,defaultHoldings);
        h = prompt("Provide Holdings object. Eg: {\"groupName 1\":[\"INFY\",\"RELIANCE\"],\"groupName 2\":[\"M&amp;M\",\"ICICIBANK\"]}", JSON.stringify(h));
        if (h == null) return;
        try {
            holdings = JSON.parse(h);
            GM_setValue(GMHoldingsName,holdings);
        }
        catch(err) {
            alert("There was error in your input");
        }

        window.location.reload();
    }, "h");

    return holdings;
}

function initPositions() {
    var GMPositionsName = "BK_POSITIONS";
    var defaultPositions = {
      "BajajFinance" : ["12304386","12311298"],
      "Bata": ["12431106"]
    };
    var positions = GM_getValue(GMPositionsName,defaultPositions);

    GM_registerMenuCommand("Set Positions", function() {
        var p = GM_getValue(GMPositionsName,defaultPositions);
        p = prompt("Provide Positions object. Eg: {\"strategy 1\":[\"12304386\",\"12311298\"],\"strategy 2\":[\"12431106\"]}", JSON.stringify(p));
        if (p == null) return;
        try {
            positions = JSON.parse(p);
            GM_setValue(GMPositionsName,positions);
        }
        catch(err) {
            alert("There was error in your input");
        }

        window.location.reload();
    }, "p");

    return positions;
}

function initReferenceTrades() {
    var GMRefTradeName = "BK_REF_TRADES";
    var defaultRefTrades = {
      "RF.blue" : ["12304386","10397698"],
      "MT.red" : ["11899650"]
    };
    var referenceTrades = GM_getValue(GMRefTradeName,defaultRefTrades);


    GM_registerMenuCommand("Reference Trades & Martingales", function() {
        var rt = GM_getValue(GMRefTradeName,defaultRefTrades);
        rt = prompt("Provide trades object. Eg: {\"RF.blue\":[\"12304386\",\"12311298\"],\"MT.red\":[\"12431106\"]}", JSON.stringify(rt));
        if (rt == null) return;
        try {
            referenceTrades = JSON.parse(rt);
            GM_setValue(GMRefTradeName,referenceTrades);
        }
        catch(err) {
            alert("There was error in your input");
        }

        window.location.reload();
    }, "r");

    return referenceTrades;
}

function createHoldingsDropdown() {
    var selectBox = document.createElement("SELECT");
    selectBox.id = "tagSelectorH";
    selectBox.classList.add("randomClassToHelpHide");
    selectBox.style="margin: 15px 0;margin-top: 15px;margin-right: 0px;margin-bottom: 15px;margin-left: 0px;"

    var option = document.createElement("option");
    option.text = "All Holdings";
    option.value= "All";
    selectBox.add(option);
    selectBox.addEventListener("change", function() {
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
                allHoldingrows.each(function(rowIndex) {
                    var dataUidInTR = this.getAttribute(allDOMPaths.attrNameForInstrumentTR);
                    if (dataUidInTR.includes("-BE")) {
                        dataUidInTR = dataUidInTR.split("-BE")[0];
                    } else if (dataUidInTR.includes("NSE")) {
                        dataUidInTR = dataUidInTR.split("NSE")[0];
                    } else if (dataUidInTR.includes("BSE")) {
                        dataUidInTR = dataUidInTR.split("BSE")[0];
                    }

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

                jQ("#stocksInTagCount").text("("+countHoldingsStocks+") " + formatter.format(pnl));

            }

            //check if tags are present
            var tagNameSpans = jQ("span[random-att='tagName']");
            info('no of tags found: ' + tagNameSpans.length);
            if (tagNameSpans.length < 1) {

                //add label indicating category of stock
                jQ("td.instrument.right-border > span").each(function(rowIndex){

                    var displayedStockName = this.innerHTML;

                    for(var categoryName in holdings){
                        if (displayedStockName.includes("-BE")) {
                            displayedStockName = displayedStockName.split("-BE")[0];
                        }

                        debug("stock name trying to tag: " + displayedStockName);
                        if (holdings[categoryName].includes(displayedStockName)) {
                            jQ(this).append("<span random-att='tagName' class='randomClassToHelpHide'>&nbsp;</span><span class='text-label blue randomClassToHelpHide'>"+categoryName+"</span>");
                        }
                    };

                });
            } else {debug('tags found');}
            //END work on Holdings AREA
        } else if (currentUrl.includes('orders')) {
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
                allPendingOrderRows.each(function(rowIndex){
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

                jQ("#stocksInTagCount").text("("+countPendingOrdersStocks+") ");

                allExecutedOrderRows.addClass("allHiddenRows");
                allExecutedOrderRows.each(function(rowIndex){
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
        }

        //START work on watchlist AREA
        var allWatchlistRows = jQ(allDOMPaths.domPathWatchlistRow);
        allWatchlistRows.show();
        if (selectedCat === "All") {
            //don't do anything
        } else {
            allWatchlistRows.addClass("allHiddenRows");

            allWatchlistRows.each(function(rowIndex){
                var watchlistRowDiv = this;
                var stockName = jQ(watchlistRowDiv).find(allDOMPaths.domPathStockNameInWatchlistRow);
                var watchlistStock = stockName.html();
                if (watchlistStock.includes("-BE")) {
                    watchlistStock = watchlistStock.split("-BE")[0];
                }
                var matchFound = false;
                matchFound = selectedStocks.includes(watchlistStock);

                if (matchFound) {
                    //do nothing
                } else {
                    jQ(watchlistRowDiv).hide();
                }
            });
        }
        //END work on watchlist AREA

        return this;
    });

    for(var key in holdings){
        option = document.createElement("option");
        option.text = key;
        option.value = key;
        selectBox.add(option);
    };
    return selectBox;
}

function createPositionsDropdown() {
    var selectBox = document.createElement("SELECT");
    selectBox.id = "tagSelectorP";
    selectBox.classList.add("randomClassToHelpHide");
    selectBox.style="margin: 15px 0;margin-top: 15px;margin-right: 0px;margin-bottom: 15px;margin-left: 0px;"

    var option = document.createElement("option");
    option.text = "All Positions";
    option.value= "All";
    selectBox.add(option);

    var userGeneratedGroups = document.createElement("optgroup");
    userGeneratedGroups.text = "---USER GROUPS---";
    userGeneratedGroups.label = "---USER GROUPS---";

    selectBox.addEventListener("change", function() {
        var selectedGroup = this.value;

        info("Group selected: " + selectedGroup);
        var selectedPositions = positions[selectedGroup];

        var currentUrl = window.location.pathname;
        info(currentUrl);
        if (currentUrl.includes('positions')) {


            //START work on Positions AREA
            var allPositionsRow = jQ(allDOMPaths.PathForPositions);
            info('found positions row: ' + allPositionsRow.length);
            allPositionsRow.show();

            //check if tags are present
            var tagNameSpans = jQ("span[random-att='tagName']");
            info('no of tags found: ' + tagNameSpans.length);
            if (tagNameSpans.length < 1) {

                allPositionsRow.each(function(rowIndex) {
                    var dataUidInTR = this.getAttribute(allDOMPaths.attrNameForInstrumentTR);
                    var p = dataUidInTR.split(".")[1];

                    for(var tradeTag in referenceTrades){
                        if (referenceTrades[tradeTag].includes(p)) {
                            var color = tradeTag.split(".")[1];
                            var tn = tradeTag.split(".")[0];
                            jQ(this).find("span.exchange.text-xxsmall.dim").append("<span random-att='tagName' class='randomClassToHelpHide'>&nbsp;</span><span class='text-label "+ color +" randomClassToHelpHide'>"+tn+"</span>");
                        }
                    };
                });
            } else {debug('tags found');}

            var allPositionOnKite = [];

            if (selectedGroup === "All") {
                jQ("#stocksInTagCount").text("");
                //don't do anything
            } else {
                //logic to hide the rows in positions table not in our list
                var countPositionsDisplaying = 0;
                allPositionsRow.addClass("allHiddenRows");

                var pnl = 0;
                allPositionsRow.each(function(rowIndex) {
                    var dataUidInTR = this.getAttribute(allDOMPaths.attrNameForInstrumentTR);
                    var p = dataUidInTR.split(".")[1];
                    allPositionOnKite.push(p);

                    var matchFound = false;

                    if (selectedGroup.includes("SPECIAL")) {
                        var lengthOfSpecial = 7;
                        var s = selectedGroup.substring(selectedGroup.indexOf("SPECIAL")+lengthOfSpecial);
                        var tradingSymbolText = jQ(this).find("td.open.instrument > span.tradingsymbol").text();
                        var ts = tradingSymbolText.split(" ")[0];
                        if (ts == s) {
                            matchFound = true;
                        } else if (tradingSymbolText.includes(" " + s + " ")) {
                            matchFound = true;
                        }
                    } else {
                        matchFound = selectedPositions.includes(p);
                    }


                    if (matchFound) {
                        //dont do anything, let the row be shown.
                        countPositionsDisplaying++;
                        var v = jQ(jQ(this).find("td")[6]).text().split(",").join("");

                        pnl += parseFloat(v);
                    } else {
                        jQ(this).hide();
                    }



                });
                
                jQ("#stocksInTagCount").text("("+countPositionsDisplaying+") " + formatter.format(pnl));
            }

            //marking positions part of a group
            debug('missing positions are: ');
            var arrPositionsInOurArray = [];
            for(var strategies in positions){
                arrPositionsInOurArray.push(...positions[strategies]);
            };
            var t = allPositionOnKite.filter(function(x) {
                return !arrPositionsInOurArray.includes(x);
            })
            debug(t);

            //END work on Positions AREA
        }

        return this;
    });

    //add options to the positions select drop down
    for(var key in positions){
        option = document.createElement("option");
        option.text = key;
        option.value = key;
        jQ(userGeneratedGroups).append(option);
    };

    selectBox.add(userGeneratedGroups);
    return selectBox;
}

// the guts of this userscript
function main() {
    //crete the dropdown to filter stocks.
    var dropdown = createHoldingsDropdown();

    var positionGroupdropdown = createPositionsDropdown();

    //click of positions header
    jQ(document).on('click', allDOMPaths.positionHeader, function () {
        var currentUrl = window.location.pathname;
        if (currentUrl.includes('positions')) {
            if (jQ(".randomClassToHelpHide").length) {
                if (jQ("#randomForDeleteOptGroup")) {
                    jQ("#randomForDeleteOptGroup").remove();
                }
                if (jQ("#randomForDeleteOptGroupE")) {
                    jQ("#randomForDeleteOptGroupE").remove();
                }
                jQ(".randomClassToHelpHide").remove();
                jQ(".allHiddenRows").show();
            } else {
                var lastC = positionGroupdropdown.lastChild;
                if (lastC.id == "randomForDeleteOptGroupE") {
                    positionGroupdropdown.removeChild(lastC);
                }

                lastC = positionGroupdropdown.lastChild;
                if (lastC.id == "randomForDeleteOptGroup") {
                    positionGroupdropdown.removeChild(lastC);
                }

                var optGrp = document.createElement("optgroup");
                optGrp.text = "---SCRIPT WISE---";
                optGrp.label = "---SCRIPT WISE---";
                optGrp.id = "randomForDeleteOptGroup";

                var optGrpExpiry = document.createElement("optgroup");
                optGrpExpiry.text = "---EXPIRY WISE---";
                optGrpExpiry.label = "---EXPIRY WISE---";
                optGrpExpiry.id = "randomForDeleteOptGroupE";


                var allPositionsRow = jQ(allDOMPaths.PathForPositions);
                var arrForUnique = [];
                var uniqueExpiryArray = [];
                allPositionsRow.each(function(rowIndex) {

                    var tradingSymbol = jQ(this).find("td.open.instrument > span.tradingsymbol").text();

                    //creating auto generated script wise grouping
                    var ts = tradingSymbol.split(" ")[0];
                    if (!arrForUnique.includes(ts)) {
                        var option = document.createElement("option");
                        option.text = ts;
                        option.value = "SPECIAL"+ts;
                        jQ(optGrp).append(option);
                        arrForUnique.push(ts);
                    }

                    //creating auto generated expiry wise grouping
                    var arr = tradingSymbol.split(" ");
                    var ex = "";
                    var len = arr.length-2;
                    //for futures AXISBANK JUL FUT
                    if (arr.length == 3) {
                        len = arr.length-1;
                    }
                    for (var i=1 ; i < len ; i++) {
                        ex = ex + " " + arr[i];
                    }
                    ex = ex.trim();
                    if (!uniqueExpiryArray.includes(ex)) {
                        var option2 = document.createElement("option");
                        option2.text = ex;
                        option2.value = "SPECIAL"+ex;
                        jQ(optGrpExpiry).append(option2);
                        uniqueExpiryArray.push(ex);
                    }
                });

                positionGroupdropdown.add(optGrp);
                positionGroupdropdown.add(optGrpExpiry);


                jQ("a.logo")[0].after(positionGroupdropdown);

                var spanForCount = document.createElement("span");
                spanForCount.classList.add("randomClassToHelpHide");
                spanForCount.classList.add("tagSelectorStyle");
                spanForCount.style="margin: 15px 0;margin-top: 15px;margin-right: 0px;margin-bottom: 15px;margin-left: 0px;border-right: 1px solid #e0e0e0;border-right-width: 1px;border-right-style: solid;border-right-color: rgb(224, 224, 224);padding: 0 10px;"

                spanForCount.id ='stocksInTagCount';
                jQ(positionGroupdropdown).after(spanForCount);

                simulateSelectBoxEvent();
            }
        }
    });

    //click of Positions row to copy pos id
    jQ(document).on('click',allDOMPaths.PathForPositions, function() {
        var dataUidInTR = this.getAttribute(allDOMPaths.attrNameForInstrumentTR);

        var text = dataUidInTR.split(".")[1];
        navigator.clipboard.writeText(text).then(function() {
            debug('Async: Copying to clipboard was successful!');
        }, function(err) {
            debug('Async: Could not copy text: ', err);
        });
    });

    //click of Holdings header
    jQ(document).on('click', allDOMPaths.domPathMainInitiatorLabel, function () {
        // jQuery methods go here...
        if (jQ(".randomClassToHelpHide").length) {
            jQ(".randomClassToHelpHide").remove();
            jQ(".allHiddenRows").show();
        } else {
            //jQ("h3.page-title.small")[0].before(dropdown);
            jQ("a.logo")[0].after(dropdown);

            var spanForCount = document.createElement("span");
            spanForCount.classList.add("randomClassToHelpHide");
            spanForCount.classList.add("tagSelectorStyle");
            spanForCount.style="margin: 15px 0;margin-top: 15px;margin-right: 0px;margin-bottom: 15px;margin-left: 0px;border-right: 1px solid #e0e0e0;border-right-width: 1px;border-right-style: solid;border-right-color: rgb(224, 224, 224);padding: 0 10px;"

            spanForCount.id ='stocksInTagCount';
            jQ(dropdown).after(spanForCount);

            simulateSelectBoxEvent();
        }
    });

    //whenever selection in position row changes.
    jQ(document).on('change', "input.su-checkbox", function () {

        var selectedRows = jQ("div.positions > section.open-positions.table-wrapper > div > div > table > tbody > tr.selected");

        var pnl = 0;
        selectedRows.each(function(rowIndex) {
            var v = jQ(jQ(this).find("td")[6]).text().split(",").join("");

            pnl += parseFloat(v);
        });

        var pnlTag = jQ("span[random-att='temppnl']");
        if (pnlTag.length > 0) {
            pnlTag.remove();
        }
        if (selectedRows.length>0) {
            if (pnl > 0) {
                jQ("div.positions > section.open-positions.table-wrapper > div > div > table > thead > tr > th.select > div > label").append(
                    "<span random-att='temppnl' class='text-label green randomClassToHelpHide'>&nbsp;"+formatter.format(pnl)+"</span>");
            } else {
                jQ("div.positions > section.open-positions.table-wrapper > div > div > table > thead > tr > th.select > div > label").append(
                    "<span random-att='temppnl' class='text-label red randomClassToHelpHide'>&nbsp;"+formatter.format(pnl)+"</span>");
            }
        }

    });

    //dispatch tagSelector change event.
    var simulateSelectBoxEvent = function() {
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
                    setTimeout(function(){ simulateSelectBoxEvent(); }, 1000);
                }
            }
        } else if (currentUrl.includes('positions')) {
            //if (tagSelectorH) {tagSelectorH.style.display = "none";}
            if (tagSelectorP) {
                //tagSelectorP.style.display = "block";
                var allPositionsRows = jQ(allDOMPaths.PathForPositions);
                if (allPositionsRows.length > 0) {
                    debug('initiating change event found holdings');
                    tagSelectorP.dispatchEvent(new Event("change"));
                } else {
                    debug('sleeping as couldnt find positions');
                    setTimeout(function(){ simulateSelectBoxEvent(); }, 2000);
                    //setTimeout(function(){tagSelectorP.dispatchEvent(new Event("change")); }, 2000);
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
    };

    //fire hide/show logic if history/url changes.
    var pushState = history.pushState;
    history.pushState = function () {
        pushState.apply(history, arguments);
        simulateSelectBoxEvent();
    };

    //on click of watchlist tab (1-5)
    jQ(document).on('click', allDOMPaths.domPathTabToChangeWatchlist,simulateSelectBoxEvent);

    //logic to scroll relevant stock in holding and highlight it
    jQ(document).on('click', allDOMPaths.domPathWatchlistRow, function () {
        var watchlistStock = jQ(this).find(allDOMPaths.domPathStockNameInWatchlistRow).html();
        debug("clicked on : " + watchlistStock);

        var holdingTRs = jQ(allDOMPaths.rowsFromHoldingsTable);

        jQ.expr[':'].regex = function(elem, index, match) {
            var matchParams = match[3].split(','),
                validLabels = /^(data|css):/,
                attr = {
                    method: matchParams[0].match(validLabels) ?
                    matchParams[0].split(':')[0] : 'attr',
                    property: matchParams.shift().replace(validLabels,'')
                },
                regexFlags = 'ig',
                regex = new RegExp(matchParams.join('').replace(/^\s+|\s+jQ/g,''), regexFlags);
            return regex.test(jQ(elem)[attr.method](attr.property));
        }

        //tigadam for stocks with & in name
        if (watchlistStock.indexOf('&') >= 0) {
            watchlistStock = watchlistStock.slice(0,watchlistStock.indexOf('&amp;'))+'&'+watchlistStock.slice(watchlistStock.indexOf('&amp;')+5,watchlistStock.length);
        }
        var holdingStockTR = jQ("tr:regex("+allDOMPaths.attrNameForInstrumentTR+", ^"+watchlistStock+".*)");

        if (holdingStockTR.length > 0) {
            debug("found holding row for scrolling : " + holdingStockTR);
            var w = jQ(window);
            w.scrollTop( holdingStockTR.offset().top - (w.height()/2) );
            jQ(holdingStockTR).css("background-color", 'lightGray');
            setTimeout(function(){ jQ(holdingStockTR).css("background-color", 'white'); }, 4000);
        }
    });

}

