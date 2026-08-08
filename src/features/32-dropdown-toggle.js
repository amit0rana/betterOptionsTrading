// Decides which dropdown belongs on the current route and swaps between them as Kite
// navigates, since it is a single-page app and the script is only injected once.

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
        // showSendOrderButton();
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
                setTimeout(function () { simulateSelectBoxEvent(); }, 1000);
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
                tagSelectorP.dispatchEvent(new CustomEvent('change', { 'detail': { 'simulated': true } }));

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

