// Positions page: strategy grouping (manual, by scrip, by expiry), the sub-filter row,
// per-strategy P&L and margin, and the observers that keep them current.
//
// The largest feature module -- a good candidate for splitting further.

function assignPositionTags() {
    jQ(allDOMPaths.PathForPositions).hover(
        function () {
            if (jQ(this).find("span[random-att='tagAddBtn']").length < 1) {
                //var dataUidInTR = this.getAttribute(allDOMPaths.attrNameForInstrumentTR);
                //var p = dataUidInTR.split(".")[1];
                var positionRow = getPositionRowObject(this);
                var p = positionRow.instrument;
                if (p == "") return;
                jQ(this).find(allDOMPaths.domAddPositionTag).append("<span random-att='tagAddBtn' title='Add tag' class='randomClassToHelpHide'><span class='randomClassToHelpHide'>&nbsp;</span><span id='positionTagAddIcon' class='text-label grey randomClassToHelpHide' value='" + p + "'>+</span></span>");
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
            var positionRow = getPositionRowObject(this);
            var p = positionRow.instrument;
            if (p == "") return;

            //var dataUidInTR = this.getAttribute(allDOMPaths.attrNameForInstrumentTR);
            //var p = dataUidInTR.split(".")[1];

            var positionSpan = jQ(this).find(allDOMPaths.domAddPositionTag);

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
            var exitedCount = 0;
            var nrmlCount = 0;

            //logic to hide the rows in positions table not in our list
            var countPositionsDisplaying = 0;
            allPositionsRow.addClass("allHiddenRows");

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
                //var dataUidInTR = this.getAttribute(allDOMPaths.attrNameForInstrumentTR);
                //var p = dataUidInTR.split(".")[1];

                var position = getPositionRowObject(this);
                if (position.instrument == "") return;

                debug("STATE : " + position.state);
                var p = getSensibullZerodhaTradingSymbol(jQ(jQ(this).find('td')[2]).text());

                var matchFound = false;
                // var tradingSymbolText = jQ(this).find(allDOMPaths.tradingSymbol).text();
                var productType = jQ(this).find("td.product > span").text().trim();
                var instrument = jQ(jQ(this).find("td")[2]).text();
                var tradingSymbolText = instrument;
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
                            stocksInList.push(WATCHLIST_NAME_BY_SCRIP[ts] || ts);
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

                if (g_showOnlyEXITEDPositions) {
                    if (qty == 0) {
                        //let filter decision pass
                    } else {
                        //overide filter decision and hide.
                        matchFound = false;
                    }
                }
                if (g_showOnlyNRMLPositions) {
                    if (productType == "NRML") {
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
                    if (qty == 0) {
                        exitedCount++;
                    }
                    if (productType == "NRML") {
                        nrmlCount++;
                    }

                    var data = getMarginCalculationData(instrument,position.exchange,  product, qty, price);
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
                        const expiry = getExpiryText(p);
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
                //var dataUidInTR = this.getAttribute(allDOMPaths.attrNameForInstrumentTR);
                //var p = dataUidInTR.split(".")[1];
                debug('3');
                // var tsym = jQ(jQ(this).find('td')[1]).text();
                var tradingSymbolText = jQ(this).find("td.instrument > span.tradingsymbol").text();

                if (tradingSymbolText == "") return;

                var p = getSensibullZerodhaTradingSymbol(tradingSymbolText);

                var matchFound = false;

                var productType = jQ(this).find("td.product > span").text().trim();
                var qty = parseFloat(jQ(jQ(this).find("td")[2]).text().split(",").join(""));

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

                if (g_showOnlyEXITEDPositions) {
                    if (qty == 0) {
                        //let filter decision pass
                    } else {
                        //overide filter decision and hide.
                        matchFound = false;
                    }
                }
                if (g_showOnlyNRMLPositions) {
                    if (productType == "NRML") {
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
            jQ("#exitedFilterId").text("EXITED (" + exitedCount + ")");
            jQ("#nrmlFilterId").text("NRML (" + nrmlCount + ")");

            if (selectedType == 'scrip' && uniqueExpiryArray.length > 1) {
                jQ('#subFilterDropdownId').append(optGrpExpiry);
            }
            if (selectedType == 'expiry' && arrForUnique.length > 1) {
                jQ('#subFilterDropdownId').append(optGrp);
            }

            if (selectedType == 'scrip') {
                jQ('#spanBuyCountId').attr('data-balloon', 'Zerodha allows same number of longs as shorts irrespective of calls or puts. So, if you have 4 PUT shorts, you can buy 4 CALL long even though buying CALL is not a hedge position for 4 lots of PUT shorts, so one need to add all shorts across CE and PE and add all longs across CE and PE to find the difference (allowed hedges)');
                if (buyCount < sellCount) {
                    jQ('#spanBuyCountId').addClass("green");
                    jQ('#spanBuyCountId').html("Can BUY : " + (sellCount - buyCount));
                } else {
                    jQ('#spanBuyCountId').addClass("red");
                    jQ('#spanBuyCountId').html("BUY : Not Possible");
                }
            } else {
                jQ('#spanBuyCountId').attr('data-balloon', 'Select a Scrip from the strategy filter dropdown.');
                jQ('#spanBuyCountId').html("");
            }

            if (g_subFilter) {
                jQ("#misFilterId").hide();
                jQ("#peFilterId").hide();
                jQ("#ceFilterId").hide();
                jQ("#optFilterId").hide();
                jQ("#futFilterId").hide();
                jQ("#exitedFilterId").hide();
                jQ("#nrmlFilterId").hide();
                jQ("#resetSubId").show();
                jQ('#allSubFilterId').prop('text', g_subFilterData);

            } else {
                jQ("#misFilterId").show();
                jQ("#peFilterId").show();
                jQ("#ceFilterId").show();
                jQ("#optFilterId").show();
                jQ("#futFilterId").show();
                jQ("#exitedFilterId").show();
                jQ("#nrmlFilterId").show();
                jQ("#resetSubId").hide();
            }

            calculateMargin(selection).then(margin => {
                updatePositionInfo(countPositionsDisplaying, pnl, margin);
            });

            debug(stocksInList);
            if (gmc.get('filter_watchlist')) {
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

    option = document.createElement("option");
    option.text = "EXITED";
    option.id = 'exitedFilterId';
    option.value = "exited";
    jQ(dropDown).append(option);

    option = document.createElement("option");
    option.text = "NRML";
    option.id = 'nrmlFilterId';
    option.value = "nrml";
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
    var t = jQ("<span id='spanselectAllId' class='text-label red randomClassToHelpHide'>|</span>");
    var i = document.createElement("Button");
    i.style = 'margin: 2px; padding: 2px;';
    i.type = 'button';
    i.id = "selectAllId";
    i.name = 'selectAllId';
    i.innerHTML = 'TS';
    i.setAttribute('data-balloon', 'Toggle Selection of Positions');
    i.setAttribute('data-balloon-pos', 'up');
    i.setAttribute('data-balloon-length', 'medium');
    i.setAttribute("class", "button-small button-grey");

    //jQ(s).append(t);
    jQ(s).append(i);

    //savings button
    i = document.createElement("Button");
    i.style = 'margin: 2px; padding: 2px;';
    i.type = 'button';
    i.id = "saveMarginBtnId";
    i.name = 'saveMarginBtnId';
    i.innerHTML = 'SM';
    i.setAttribute('data-balloon', 'Save Margin');
    i.setAttribute('data-balloon-pos', 'up');
    i.setAttribute('data-balloon-length', 'small');
    i.setAttribute("class", "button-small button-grey");

    jQ(s).append(i);

    i = document.createElement("Button");
    i.style = 'margin: 2px; padding: 2px;';
    i.type = 'button';
    i.id = "hideRestId";
    i.name = 'hideRestId';
    i.innerHTML = 'HS';
    i.setAttribute('data-balloon', 'Hide Selected Positions');
    i.setAttribute('data-balloon-pos', 'up');
    i.setAttribute('data-balloon-length', 'small');
    i.setAttribute("class", "button-small button-grey");
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
    jQ(".randomClassholdingToHelpHide").remove();
    
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

        // debug('before calling getSensibullZerodhaTradingSymbol ' + jQ(jQ(this).find('td')[2]).text())
        // debug('before calling getSensibullZerodhaTradingSymbol ' + jQ(jQ(this).find('span.tradingsymbol')).text())
        // var text = getSensibullZerodhaTradingSymbol(jQ(jQ(this).find('span.tradingsymbol')).text());
        // var text = getSensibullZerodhaTradingSymbol(jQ(jQ(this).find('td')[2]).text());
        var tradingSymbol = jQ(this).find(allDOMPaths.positionRowTS).text();
        if (tradingSymbol == "") return;
        var text = getSensibullZerodhaTradingSymbol(tradingSymbol);

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
    var target = jQ("div.positions > section.open-positions.table-wrapper > div > div > div > table > tbody")[0];

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

    if (gmc.get('auto_refresh_PnL') === true) {
        debug('going to observe pnl change');
        target = jQ("div.positions > section.open-positions.table-wrapper > div > div > div > table > tfoot > tr > td")[3];

        debug("**********" + jQ(target).text());
        g_positionsPnlObserver = new MutationObserver(function (mutations) {
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
