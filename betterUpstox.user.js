// ==UserScript==
// @name         betterUpstox
// @namespace    https://github.com/amit0rana/betterUpstox
// @version      0.02
// @description  Introduces small features on top of pro.upstox app
// @author       Amit
// @match        https://pro.upstox.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js
// @require      https://raw.githubusercontent.com/amit0rana/betterOptionsTrading/master/betterCommon.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @downloadURL  https://github.com/amit0rana/betterKite/raw/master/betterUpstox.user.js
// @updateURL    https://github.com/amit0rana/betterKite/raw/master/betterUpstox.meta.js
// ==/UserScript==

//window.jQ=jQuery.noConflict(true);

const D_LEVEL = D_LEVEL_INFO;

waitForKeyElements ("div._headerLinks_12987", main);
//main();

function init() {
    debug('initialising');
    var toggleLink = document.createElement("a");
    toggleLink.classList.add("randomClassToDelete");
    toggleLink.classList.add("_link_12987");
    toggleLink.id = "toggleLinkId";

    toggleLink.innerText = "Filter";
    var tag = $("#root > div > div > div._header_12987 > div._headerLinks_12987");
    debug(tag);

    tag.append(toggleLink);

    var spanForCount = document.createElement("span");
    spanForCount.classList.add("randomClassToDelete");
    spanForCount.classList.add("_link_12987");
    spanForCount.id = "positionText";
    //spanForCount.style="margin: 15px 0;margin-top: 15px;margin-right: 0px;margin-bottom: 15px;margin-left: 0px;border-right: 1px solid #e0e0e0;border-right-width: 1px;border-right-style: solid;border-right-color: rgb(224, 224, 224);padding: 0 10px;"

    tag.append(spanForCount);
}

function toggleFilter() {
    if (filterActive) {
        filterActive = false;
        $("#toggleLinkId").text("Filter");
    } else {
        filterActive = true;
        $("#toggleLinkId").text("Reset");
    }
}

var filterActive = false;

function main() {
    init();

    $(document).on('click', "#toggleLinkId", function () {
        debug('click');
        $(".allHiddenRows").show();
        if (filterActive) {
            debug('deactivating filter');
            toggleFilter();
            //jQ(".randomClassToDelete").remove();
            $("#positionText").text("");
        } else {
            debug('activating filter');
            var watchlistRowsDom = $("#watchlistTestId > div > div");
            debug("number " + watchlistRowsDom.length);
            if (watchlistRowsDom.length > 0) {
                var watchlistArray = [];
                watchlistRowsDom.each(function(rowIndex) {
                    var name = $(this).find("div._name_6136e").text();
                    if (name != "") {
                        var symbol = $(this).find("div._symbol_6136e").text()

                        watchlistArray.push(name+symbol);
                        debug(name + " " + symbol);
                    }

                });

                var pnl = 0;
                var positionRowsDom = $("#books > div > div > div > div > div > div > div > table > tbody > tr");
                debug("number " + positionRowsDom.length);
                if (positionRowsDom.length > 0) {
                    positionRowsDom.addClass("allHiddenRows");
                    var numberOfPositions = 0;
                    positionRowsDom.each(function(rowIndex) {
                        var name = $(this).find("div._symbolName_2f3f1").text();
                        if (name != "") {
                            var symbol = $(this).find("div._category_2f3f1").text()

                            var workingItem = name+symbol;
                            if (watchlistArray.includes(workingItem)) {
                                //all good show.
                                var p = $(this).find("[data-id=booksOverallPnL]").text().split(",").join("");
                                pnl += parseFloat(p);
                                debug(p);
                                numberOfPositions++;
                                debug(workingItem);
                            } else {
                                $(this).hide();
                            }
                        }

                    });
                    if (numberOfPositions > 0 ) {
                        $("#positionText").text("("+numberOfPositions+") " + formatter.format(pnl));
                    }
                }

            }
            toggleFilter();
        }
    });

}