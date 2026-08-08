// Holdings page: category tags on each row, the category dropdown, and the watchlist
// filtering that follows from a category selection.

function assignHoldingTags() {
    debug('assignHoldingTags');
    jQ(allDOMPaths.rowsFromHoldingsTable).hover(
        function () {
            if (jQ(this).find("span[random-att='tagAddBtn']").length < 1) {
                var holdingRow = getHoldingRowObject(this);
                //var displayedStockName = removeExtraCharsFromStockName(this.getAttribute(allDOMPaths.attrNameForInstrumentTR));
                var displayedStockName = holdingRow.instrument;
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
            //var displayedStockName = removeExtraCharsFromStockName(this.getAttribute(allDOMPaths.attrNameForInstrumentTR));
            var holdingRow = getHoldingRowObject(this);
            
            var displayedStockName = holdingRow.instrument;

            for (var categoryName in holdings) {
                // debug(displayedStockName + ' ading tag: ' + categoryName);
                if (holdings[categoryName].includes(displayedStockName)) {
                    // debug(displayedStockName + ' ading tag: ' + categoryName);
                    jQ(this).find("td.instrument.right-border").append("<span random-att='tagName' class='randomClassToHelpHide'>&nbsp;</span><span id='idForTagDeleteAction' class='text-label blue randomClassToHelpHide' tag='" + categoryName + "' stock='" + displayedStockName + "'>" + categoryName + "</span>");
                }
            }

            var tds = jQ(this).find("td");
            var totalQ = holdingRow.quantity + holdingRow.pledged;
            jQ(tds[2]).find("div.randomClassholdingToHelpHide").remove();
            jQ(tds[2]).append(`<div class="text-label grey randomClassholdingToHelpHide">${formatter.format(totalQ * holdingRow.avgCost)}</div>`);
            if (holdingRow.pledged > 0) {
                // jQ(tds[0]).append(`<div class="randomClassholdingToHelpHide">&nbsp;</div>`);
                jQ(tds[1]).append(`<div class="text-label grey randomClassholdingToHelpHide">${totalQ}</div>`);
                // jQ(tds[2]).append(`<div class="randomClassholdingToHelpHide">&nbsp;</div>`);
                // jQ(tds[3]).append(`<div class="randomClassholdingToHelpHide">&nbsp;</div>`);
                // jQ(tds[4]).append(`<div class="text-label grey randomClassholdingToHelpHide">${formatter.format(holdingRow.quantity * holdingRow.ltp)}</div>`);
                // jQ(tds[5]).append(`<div class="text-label grey randomClassholdingToHelpHide">${formatter.format((holdingRow.ltp - holdingRow.avgCost) * holdingRow.quantity)}</div>`);
                // jQ(tds[6]).append(`<div class="randomClassholdingToHelpHide">&nbsp;</div>`);
                // jQ(tds[7]).append(`<div class="randomClassholdingToHelpHide">&nbsp;</div>`);
            }

        });


    } else { debug('tags found'); }
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
                filterWatchlist("", "All");
                jQ("#totalCostIdH4").remove();
                jQ("#totalCurrentValueIdH4").remove();
                jQ("#totalPnlIdH4").remove();
                //don't do anything
            } else if (selectedCat === "Watchlist") {
                jQ("#stocksInTagCount").text("");

                var wlStocks = [];
                var allWatchlistRows = jQ(allDOMPaths.domPathWatchlistRow);
                allWatchlistRows.show();
                allWatchlistRows.each(function (rowIndex) {
                    var watchlistRowDiv = this;
                    var stockName = jQ(watchlistRowDiv).find(allDOMPaths.domPathStockNameInWatchlistRow);
                    var watchlistStock = stockName.text();
                    // if (watchlistStock.includes("-BE")) {
                    //     watchlistStock = watchlistStock.split("-BE")[0];
                    // }
                    wlStocks.push(watchlistStock);
                });
                console.log(wlStocks);

                var countHoldingsStocks = 0;
                allHoldingrows.addClass("allHiddenRows");

                var pnl = 0;
                var totalCost = 0;
                var totalCurrentValue = 0;
                allHoldingrows.each(function (rowIndex) {
                    //var dataUidInTR = removeExtraCharsFromStockName(this.getAttribute(allDOMPaths.attrNameForInstrumentTR));
                    var holdingRow = getHoldingRowObject(this);
                    var displayedStockName = holdingRow.instrument;

                    var matchFound = wlStocks.includes(displayedStockName);

                    if (matchFound) {
                        //dont do anything, let the row be shown.
                        countHoldingsStocks++;
                        pnl += parseFloat(jQ(jQ(this).find("td")[5]).text().split(",").join(""));

                        var totalQ = holdingRow.quantity + holdingRow.pledged;
                        totalCost += (totalQ * holdingRow.avgCost);
                        totalCurrentValue += (totalQ * holdingRow.ltp);
                        //pnl = formatter.format((holdingRow.ltp - holdingRow.avgCost)*totalQ);
                    } else {
                        jQ(this).hide();
                    }
                });

                jQ("#stocksInTagCount").text("(" + countHoldingsStocks + ") " + formatter.format(pnl));
                jQ("div.stats.row").find(".randomClassToHelpHide").remove();
                var divs = jQ("div.stats.row > div");
                jQ(divs[0]).find("div").append(`<h4  id="totalCostIdH4" class="randomClassToHelpHide value"> (${formatter.format(totalCost)})</h4>`);
                jQ(divs[1]).find("div").append(`<h4 id="totalCurrentValueIdH4" class="randomClassToHelpHide value"> (${formatter.format(totalCurrentValue)})</h4>`);
                var cls = 'text-green';
                if (pnl < 0) {
                    cls = 'text-red';
                }
                jQ(divs[3]).find("div").append(`<h4 id="totalPnlIdH4" class="randomClassToHelpHide value text-xxsmall ${cls}"> (${formatter.format(pnl)})</h4>`);
                //don't do anything
            } else {
                //logic to hide the rows in Holdings table not in our list
                let countHoldingsStocks = 0;
                allHoldingrows.addClass("allHiddenRows");

                let pnl = 0;
                let totalCost = 0;
                let totalCurrentValue = 0;
                allHoldingrows.each(function (rowIndex) {
                    //var dataUidInTR = removeExtraCharsFromStockName(this.getAttribute(allDOMPaths.attrNameForInstrumentTR));
                    var holdingRow = getHoldingRowObject(this);
                    
                    var displayedStockName = holdingRow.instrument;

                    var matchFound = false;
                    matchFound = selectedStocks.includes(displayedStockName);

                    if (matchFound) {
                        //dont do anything, let the row be shown.
                        countHoldingsStocks++;
                        pnl += parseFloat(jQ(jQ(this).find("td")[5]).text().split(",").join(""));
                        var totalQ = holdingRow.quantity + holdingRow.pledged;
                        totalCost += (totalQ * holdingRow.avgCost);
                        totalCurrentValue += (totalQ * holdingRow.ltp);
                    } else {
                        jQ(this).hide();
                    }
                });

                jQ("#stocksInTagCount").text("(" + countHoldingsStocks + ") " + formatter.format(pnl));
                jQ("div.stats.row").find(".randomClassToHelpHide").remove();
                let divs = jQ("div.stats.row > div");
                jQ(divs[0]).append(`<h4 id="totalCostIdH4" class="randomClassToHelpHide value"> (${formatter.format(totalCost)})</h4>`);
                jQ(divs[1]).append(`<h4 id="totalCurrentValueIdH4" class="randomClassToHelpHide value"> (${formatter.format(totalCurrentValue)})</h4>`);
                let cls = 'text-green';
                if (pnl < 0) {
                    cls = 'text-red';
                }
                jQ(divs[3]).append(`<h4 id="totalPnlIdH4" class="randomClassToHelpHide value text-bold text-pagetitle ${cls}"> (${formatter.format(pnl)})</h4>`);

                //START work on watchlist AREA
                filterWatchlist(selectedStocks, selectedCat);
                //END work on watchlist AREA

            }

            assignHoldingTags();

            //END work on Holdings AREA
        }

        //filterwatchlist was here

        return this;
    });

    for (var key in holdings) {
        option = document.createElement("option");
        option.text = key;
        option.value = key;
        selectBox.add(option);
    };

    option = document.createElement("option");
    option.text = "Watchlist";
    option.value = "Watchlist";
    selectBox.add(option);

    return selectBox;
}
