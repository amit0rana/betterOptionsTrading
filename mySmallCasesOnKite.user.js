// ==UserScript==
// @name         mySmallCasesOnKite
// @namespace    http://mySmallCasesOnKite.net/
// @version      0.2
// @description  Introduces small features on top of kite app
// @author       Amit
// @match        https://kite.zerodha.com/*
// @grant        none
// @downloadURL  https://github.com/amit0rana/betterKite/raw/master/mySmallCasesOnKite.user.js
// @updateURL    https://github.com/amit0rana/betterKite/raw/master/mySmallCasesOnKite.meta.js
// ==/UserScript==

// a function that loads jQuery and calls a callback function when jQuery has finished loading
function addJQuery(callback) {

  var script = document.createElement("script");
  script.setAttribute("src", "//ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js");
    //script.setAttribute("src", "//code.jquery.com/jquery-3.5.1.min.js");
    //script.setAttribute("integrity","sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=");
    //script.setAttribute("crossorigin","anonymous");

  script.addEventListener('load', function() {
    var script = document.createElement("script");
    script.textContent = "window.jQ=jQuery.noConflict(true);(" + callback.toString() + ")();";
    document.body.appendChild(script);
  }, false);
  document.body.appendChild(script);

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

// the guts of this userscript
function main() {

  /* Fill the 'holidings' variable below with your stocks (example below)
    var holdings = {
      "Dividend" : ["SJVN","VEDL"],
      "Wealth Creators" : ["WHIRLPOOL","ICICIBANK",],
      "Sell On profit" : ["LUMAXIND","RADICO","M&amp;M"]
    };

    First part is group name that will come in dropdown, second part is the list.

    //Note: if script name as & then write it as &amp;
    //Note: Zerodha may either display NSE stock or BSE stock so better to mention both for the stock.
  */
   var holdings = {};

    /* Below step is needed ONLY IF you have multiple strategies for same stock.
    Fill the 'positions' variable below with your open positions id. (example below)
     var positions = {
      "BajajFinance" : ["12304386","12311298","12313858","12314370"],
      "Bata": ["12431106"]
     };

     First part is the 'strategy name' and second part is positions under that strategy.

     //Steps to find position IDs.
     //Once the plugin is installed, simply click on the position name/row and the id will automatically be copied in your clipboard. Now can just just paste it.
   */
    var positions = {};

    /* If you want to tag your trades separately, provide traide Ids in the array along with the tag name and color
    Example below.
     var referenceTrades = {
        "RF.blue" : ["12304386","10397698","20726530","11107330"],
        "MT.red" : ["11899650"]
    };

    //Steps to find position IDs.
    //Once the plugin is installed, simply click on the position name/row and the id will automatically be copied in your clipboard. Now can just just paste it.
   */
    var referenceTrades = {};


    var D_LEVEL_INFO = 2;
    var D_LEVEL_DEBUG = 1;

    var D_LEVEL = D_LEVEL_INFO;

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

    //crete the dropdown to filter stocks.
    var dropdown = function(){
        var selectBox = document.createElement("SELECT");
        selectBox.id = "tagSelectorH";
        selectBox.classList.add("randomClassToHelpHide");
        selectBox.style="margin: 15px 0;margin-top: 15px;margin-right: 0px;margin-bottom: 15px;margin-left: 0px;"

        var option = document.createElement("option");
        option.text = "All";
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

                    jQ("#stocksInTagCount").text("("+countHoldingsStocks+") " + pnl.toFixed(2).toLocaleString());

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
    }();

    var positionGroupdropdown = function(){
        var selectBox = document.createElement("SELECT");
        selectBox.id = "tagSelectorP";
        selectBox.classList.add("randomClassToHelpHide");
        selectBox.style="margin: 15px 0;margin-top: 15px;margin-right: 0px;margin-bottom: 15px;margin-left: 0px;"

        var option = document.createElement("option");
        option.text = "All";
        option.value= "All";
        selectBox.add(option);
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
                    var countHoldingsStocks = 0;
                    allPositionsRow.addClass("allHiddenRows");

                    var pnl = 0;
                    allPositionsRow.each(function(rowIndex) {
                        var dataUidInTR = this.getAttribute(allDOMPaths.attrNameForInstrumentTR);
                        var p = dataUidInTR.split(".")[1];
                        allPositionOnKite.push(p);

                        var matchFound = false;

                        if (selectedGroup.includes("SPECIAL")) {
                            var s = selectedGroup.substring(selectedGroup.indexOf("SPECIAL")+7);
                            var ts = jQ(this).find("td.open.instrument > span.tradingsymbol").text().split(" ")[0];
                            if (ts == s) {
                                matchFound = true;
                            }
                        } else {
                            matchFound = selectedPositions.includes(p);
                        }


                        if (matchFound) {
                            //dont do anything, let the row be shown.
                            countHoldingsStocks++;
                            var v = jQ(jQ(this).find("td")[6]).text().split(",").join("");

                            pnl += parseFloat(v);
                        } else {
                            jQ(this).hide();
                        }



                    });
                    jQ("#stocksInTagCount").text(pnl.toFixed(2).toLocaleString());
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
            selectBox.add(option);
        };

        return selectBox;
    }();

    //click of positions header
    jQ(document).on('click', allDOMPaths.positionHeader, function () {
        var currentUrl = window.location.pathname;
        if (currentUrl.includes('positions')) {
            if (jQ(".randomClassToHelpHide").length) {
                if (jQ("#randomForDeleteOptGroup")) {
                    jQ("#randomForDeleteOptGroup").remove();
                }
                jQ(".randomClassToHelpHide").remove();
                jQ(".allHiddenRows").show();
            } else {
                var lastC = positionGroupdropdown.lastChild;
                if (lastC.id == "randomForDeleteOptGroup") {
                    positionGroupdropdown.removeChild(lastC);
                }

                var optGrp = document.createElement("optgroup");
                optGrp.text = "---AUTO GENERATED---";
                optGrp.label = "---AUTO GENERATED---";
                optGrp.id = "randomForDeleteOptGroup";

                positionGroupdropdown.add(optGrp);

                var allPositionsRow = jQ(allDOMPaths.PathForPositions);
                var arrForUnique = [];
                allPositionsRow.each(function(rowIndex) {

                    var ts = jQ(this).find("td.open.instrument > span.tradingsymbol").text().split(" ")[0];
                    if (!arrForUnique.includes(ts)) {
                        var option = document.createElement("option");
                        option.text = ts;
                        option.value = "SPECIAL"+ts;
                        jQ(optGrp).append(option);
                        arrForUnique.push(ts);
                    }
                });


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
                    "<span random-att='temppnl' class='text-label green randomClassToHelpHide'>&nbsp;"+pnl+"</span>");
            } else {
                jQ("div.positions > section.open-positions.table-wrapper > div > div > table > thead > tr > th.select > div > label").append(
                    "<span random-att='temppnl' class='text-label red randomClassToHelpHide'>&nbsp;"+pnl+"</span>");
            }
        }

    });

    //dspatch tagSelector change event.
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

    //fire hide/show logic again if history/url changes.
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

addJQuery(main);
