// Wires up every event handler and menu command. Called once, after settings finish
// loading. Feature logic lives in the feature modules; this file connects it to the DOM.

function main() {
    if (gmc.get('full_width')) {
        fullWidth();
    }

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


    GM_registerMenuCommand("Create AT " , function () {
        window.open("https://kite.zerodha.com/connect/login?v=3&api_key=" + gmc.get('api_key'), "_self");

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
        jQ(document).off('click', allDOMPaths.PathForPositions, onSuCheckboxSelection);

        var lastOne;
        allVisibleRows.each(function (rowIndex) {
            lastOne = jQ(this).find('input.su-checkbox');
            lastOne.click();
        });

        //lastOne.trigger('change');
        setTimeout(onSuCheckboxSelection, 10);

        jQ(document).on('change', "input.su-checkbox", onSuCheckboxSelection);
        jQ(document).on('click', allDOMPaths.PathForPositions, onSuCheckboxSelection);

        //simulateSelectBoxEvent();
    });

    jQ(document).on('click', "#trailButtonId", function (e) {
        tEv("kite", "trail", "click", "");
        return modifyPendingOrderFromButton(e, this, function (order, direction) {
            const points = direction * parseFloat(gmc.get('auto_trail_points'));
            order.price = parseFloat(order.price) + points;
            order.trigger_price = parseFloat(order.trigger_price) + points;
        });
    });

    jQ(document).on('click', "#saveProfitButtonId", function (e) {
        tEv("kite", "saveProfit", "click", "");
        return modifyPendingOrderFromButton(e, this, function (order, direction) {
            const points =
                direction *
                (parseFloat(gmc.get('auto_save_profit_points')) + parseFloat(gmc.get('auto_sl_points')));
            order.price = parseFloat(order.price) + points;
            order.trigger_price = order.price;
        });
    });

    jQ(document).on('click', "td.quantity.right", function () {
        tEv("kite", "showLots", "click", "");

        if (lotsTippyInstances.length > 0) {
            lotsTippyInstances.forEach((instance) => {
                instance.destroy();
            });

        } else {
            showLotsTippy("td.quantity.right", "test");
        }
    });

    jQ(document).on('click', "section.open-positions.table-wrapper > div > div > div > table > tfoot > tr > td:nth-child(4)", function () {
        tEv("kite", "showRealisedPnL", "click", "");

        debug('clicked');
        tippy("section.open-positions.table-wrapper > div > div > div > table > tfoot > tr > td:nth-child(4)", {
            content: "",
            allowHTML: true,
            offset: [0, -8],
            showOnCreate: true,
            // plugins: [lotsGlobalStore],
            onShow(instance) {
                var allClosed = jQ(allDOMPaths.PathForPositions).filter(':has("td.closed")');
                var pnl = 0;
                allClosed.each(function (rowIndex) {
                    var row = getPositionRowObject(this);

                    if (row.instrument == "") return;

                    // debug(row.pnl);
                    pnl = parseFloat(pnl) + parseFloat(row.pnl);
                    // debug(pnl);

                });
                var allOpen = jQ(allDOMPaths.PathForPositions).filter(':has("td.open")');
                debug(allOpen.length);
                debug(allOpen);
                var realPnl = 0;
                allOpen.each(function (rowIndex) {
                    var row = getPositionRowObject(this);
                    if (row.instrument == "") return;
                    // debug(row.quantity);
                    // realPnl = parseFloat(realPnl) +  parseFloat(row.pnl - (row.quantity * (row.avgPrice - row.ltp)));
                    // realPnl = parseFloat(realPnl) +  parseFloat(row.pnl - (-(row.quantity * (row.avgPrice - row.ltp))));

                    realPnl = parseFloat(row.pnl).toFixed(2) - parseFloat((row.quantity * (row.ltp - row.avgPrice))).toFixed(2);
                    // debug(parseFloat(row.pnl).toFixed(2));
                    // debug(parseFloat(realPnl).toFixed(2));
                    pnl = pnl + realPnl;

                    // debug(parseFloat(row.pnl - (-(row.quantity * (row.avgPrice - row.ltp)))));
                    // debug(realPnl);
                    // pnl = parseFloat(pnl) + parseFloat(realPnl);
                    // debug(pnl);

                });
                instance.setContent(`Realised P&L ${formatter.format(pnl)}`);
            },
        });

    });


    jQ(document).on('click', "td.open.pnl.right", function () {
        tEv("kite", "showActualProit", "click", "");

        if (pnlTippyInstances.length > 0) {
            pnlTippyInstances.forEach((instance) => {
                instance.destroy();
            });

        } else {
            showPnlTippy("td.open.pnl.right", "test");
        }

        // var attr = jQ(this).attr('data-balloon');

        // if (typeof attr !== 'undefined' && attr !== false) {
        //     jQ(this).removeAttr('tooltip');
        //     jQ(this).removeAttr('data-balloon-pos');
        //     jQ(this).removeAttr('data-balloon');
        // } else {
        //     var q = jQ(this).find("span").text().trim();
        //     var tr = jQ(this).closest('tr');
        //     var pos = getPositionRowObject(tr);
        //     var pnl = -(pos.quantity * (pos.avgPrice - pos.ltp));
        //     jQ(this).attr('tooltip', 'down');
        //     jQ(this).attr('data-balloon-pos', 'down');
        //     jQ(this).attr('data-balloon', `${formatter.format(pnl)}`);

        // }

    });


    const PIN1_TARGET = 'div.pinned-instruments > div.instrument-widget:nth-child(1) > span.wrap span.last-price';
    jQ(document).on('click', PIN1_TARGET, function () {

        if (gmc.get('enable_nifty_monthly_weekly_range') == true) {
            tEv("kite", "showVixRangeMonthly", "click", "");

            var symbol = jQ(this).closest("div").find("span.tradingsymbol.link-chart").text().trim();

            if (symbol == "NIFTY 50") {
                // if (typeof attr !== 'undefined' && attr !== false) {
                //     jQ(this).removeAttr('tooltip');
                //     jQ(this).removeAttr('data-balloon-pos');
                //     jQ(this).removeAttr('data-balloon');
                // } else {
                var iv = jQ("div.symbol > span.nice-name:contains('INDIA VIX')");
                debug(iv.length);
                if (iv.length > 0) {
                    var strike = jQ(this).text().trim();
                    //jQ("div.vddl-draggable:nth-child(1) > div:nth-child(1) > div:nth-child(1) > span:nth-child(2) > span:nth-child(3)")
                    var vix = jQ(iv).closest("div.info").find("div.price > span.last-price").text().trim();
                    debug(vix);
                    var chg = vix / Math.sqrt(gmc.get('nifty_vix_range_monthly_sqroot')); //;
                    var range = strike * chg / 100;
                    var lNift = strike - range;
                    var uNift = parseFloat(strike) + parseFloat(range);
                    // jQ(this).attr('tooltip', 'down');
                    // jQ(this).attr('data-balloon-pos', 'down');
                    // jQ(this).attr('data-balloon', `(M) ${lNift.toFixed(2)} - ${uNift.toFixed(2)}`);

                    chg = vix / Math.sqrt(gmc.get('nifty_vix_range_weekly_sqroot')); ////;
                    range = strike * chg / 100;
                    var wlNift = strike - range;
                    var wuNift = parseFloat(strike) + parseFloat(range);

                    chg = vix / Math.sqrt(gmc.get('nifty_vix_range_daily_sqroot')); ////;
                    range = strike * chg / 100;
                    debug(range);
                    var dlNift = strike - range;
                    var duNift = parseFloat(strike) + parseFloat(range);

                    showTippy(PIN1_TARGET, `(M) ${lNift.toFixed(2)} - ${uNift.toFixed(2)}<br>(W) ${wlNift.toFixed(2)} - ${wuNift.toFixed(2)}<br>(D) ${dlNift.toFixed(2)} - ${duNift.toFixed(2)}`);
                    //debug(jQ("div.vddl-draggable:nth-child(1) > div:nth-child(1) > div:nth-child(1) > span:nth-child(2) > span:nth-child(3)"));
                } else {
                    // getToast('Cannot find INDIA VIX in watchlist. Please add it.').showToast();
                    // showErrorToast('Cannot find INDIA VIX in watchlist. Please add it.');
                    showTippy(PIN1_TARGET, 'Cannot find INDIA VIX in watchlist. Please add it.');
                }
                // }
            } else {
                // getToast('Works only on NIFTY 50.').showToast();
                showTippy(PIN1_TARGET, 'Works only on NIFTY 50.');
            }
        }


    });

    jQ(document).on('click', "#hideRestId", function () {
        tEv("kite", "hideRestFilter", "click", "");
        jQ(allDOMPaths.PathForPositions + ".selected").hide();
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

    //click on clear Option Chain
    jQ(document).on('click', "#clearOptionChain", function () {
        tEv("kite", "clearOptionChain", "click", "");
        var response = window.confirm("This will clear the current watchlist, Do you want to continue?")
        if(response==false)
            return;
        const mouseoverEvent = new Event('mouseenter');
        var optionChainLength = jQ(".vddl-draggable").length-1;
        var i=1;
        removeRow(i,optionChainLength);
        function removeRow(i,optionChainLength){
            if(optionChainLength>i)
            {
                jQ(jQ(".vddl-draggable")[optionChainLength]).find(".info-wrapper")[0].dispatchEvent(mouseoverEvent);
                setTimeout(function (){
                    jQ(jQ(jQ(".vddl-draggable")[optionChainLength]).find(".info-wrapper .actions>span")[4]).find("button")[0].click()
                    removeRow(i,--optionChainLength);
                },0)
            }
        }
    });


    //click on addAltOptionChain
    jQ(document).on('click', "#addAltOptionChain", function () {
        tEv("kite", "addAltOptionChain", "click", "");
        // var h = prompt("Provide Symbol", "NIFTY");
        var dt = new Date()
        var expiry = `${dt.getFullYear() % 100}${dt.getMonth() + 1}${dt.getDate().toString().padStart(2, "0")}`;

        let da = new Intl.DateTimeFormat('en', { year: '2-digit' }).format(dt);
        let mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(dt);

        var d = dt.getDay();
        debug("dat " + d);
        // Whichever index expires today pre-fills the prompt, e.g. BANKEX24JUN58400PE.
        var todayExpirySymbol = indexExpiringOnWeekday(d);
        var isLstD = isLastDay(d);

        debug('last day ' + isLstD);
        if (isLstD) {
            expiry = da + mo.toUpperCase();
        }

        var h = prompt("Provide Symbol with Expiry w:NIFTYyymdd m:NIFTY24JUL", todayExpirySymbol + expiry);
        if (h == null || h == "") {
            return;
        }
        var sym = h.match("^[a-zA-Z]*")[0]
        var iSym = "";
        const indexMatch = OPTION_CHAIN_INDEX_PREFIXES.find(([prefix]) => sym.startsWith(prefix));
        if (indexMatch) {
            sym = indexMatch[1];
            iSym = indexMatch[2];
        }
        var spotPrice = 0;
        myAjaxSetup();
        var myUrl = BASE_URL + `/oms/quote?i=${sym}`;
        if (gmc.get('use_api')) {
            myUrl = `https://api.kite.trade/quote?i=${sym}`;
        }


        jQ.ajax({
            url: myUrl,
            type: 'GET',
            async: false,
            cache: false,
            error: function (xhr, status, error) {
                debug(error);
                debug(xhr.responseText);
                getToast(`${status} :: ${error} :: ${xhr.responseText}`).showToast();

                throw new Error("Not able to get best offer/bid price. " + error);
            },
            success: function (response, status) {
                debug("22222");
                debug("Data: " + JSON.stringify(response) + "\nStatus: " + status);

                spotPrice = response.data[sym].last_price;

                // if (order.transaction_type === 'BUY') {
                //     newPrice = newPrice + 0.05;
                // } else if (order.transaction_type === 'SELL') {
                //     newPrice = newPrice - 0.05;
                // }
            },
            complete: function () {
                debug("33333");
            }
        });
        var strikeCount = gmc.get('marketlist_number_of_strikes');
        var strikeStep = INDEX_CONFIG[indexSymbolFor(h)]?.strikeStep ?? 50;
        debug(spotPrice);
        var atm = closestStrike(spotPrice, strikeStep);
        var weight = 3;
        var data;

        // Strikes below ATM as puts, the index itself, then strikes above ATM as calls,
        // so the watchlist ends up ordered like an option chain.
        for (let offset = strikeCount; offset >= 0; offset--) {
            data = buildWatchlistEntry(h + (atm - offset * strikeStep) + 'PE', ++weight);
            addToWatchListCall(data);
        }

        data = {};
        data.tradingsymbol = iSym;
        weight++;
        data.weight = weight
        data.segment = "INDICES"
        addToWatchListCall(data);

        for (let offset = 0; offset <= strikeCount; offset++) {
            data = buildWatchlistEntry(h + (atm + offset * strikeStep) + 'CE', ++weight);
            addToWatchListCall(data);
        }

        // var e = prompt("Provide expiry (w:yymdd, m:YYMMM", "NIFTY");
        setTimeout(() => {
            window.location.reload();
        }, 3000);
        // 
    });

    // Key order matters: it becomes the form-encoded field order of the POST below.
    function buildWatchlistEntry(tradingsymbol, weight) {
        return {
            tradingsymbol: tradingsymbol,
            weight: weight,
            segment: INDEX_CONFIG[indexSymbolFor(tradingsymbol)]?.optionSegment ?? 'NFO-OPT',
        };
    }

    function addToWatchListCall(data) {
        //segment=INDICES&tradingsymbol=NIFTY%2050&watch_id=4&weight=14

        var mitem = jQ(allDOMPaths.domPathTabToChangeWatchlist + ".selected").text().trim();
        data.watch_id = mitem

        jQ.post(BASE_URL + `/api/marketwatch/${mitem}/items`,
            data,
            function (data, status) {
                debug("5555");

                debug("Data: " + data + "\nStatus: " + status);
                getToast(`${status}`).showToast();
            })
            .fail(function (xhr, status, error) {
                debug("666");
                var resp = JSON.parse(xhr.responseText);

                getToast(`${status} :: ${resp.message}`).showToast();

            });
    }

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
                    var positionSpan = jQ(this).find(allDOMPaths.domAddPositionTag);
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

    //click of Holdings/position header allDOMPaths.positionHeader
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
        } else if (currentUrl.includes('positions')) {
            debug('click on positions header.');
            if (jQ('#tagSelectorP').is(":visible")) {
                hideDropdown();
            } else {
                showPositionDropdown();
            }
        }
    });


    //click of Positions row to copy pos id
    jQ(document).on('click', allDOMPaths.PathForPositions, onSuCheckboxSelection);


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
        info("clicked on: " + jQ(this).attr("data-balloon"));
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
        // var holdingStockTR = jQ("tr:regex(" + allDOMPaths.attrNameForInstrumentTR + ", ^" + watchlistStock + ".*)");
        var holdingStockTR = jQ("tr:contains('" + watchlistStock + "')");

        if (holdingStockTR.length > 0) {
            debug("found holding row for scrolling : " + holdingStockTR);
            var w = jQ(window);
            w.scrollTop(holdingStockTR.offset().top - (w.height() / 2));
            jQ(holdingStockTR).css("box-shadow", '0px 0px 5px 0px gray');
            setTimeout(function () { jQ(holdingStockTR).css("box-shadow", 'none'); }, 4000);
        }
    });

    waitForKeyElements("span.value", showRoiNudge);
    waitForKeyElements("div.value.final-margins-value", showBasketRoiNudge);

}
