    // ==UserScript==
    // @name         betterTradingeconomics
    // @namespace    https://github.com/amit0rana/betterTradingeconomics
    // @version      0.03
    // @description  Introduces small features on top of betterTradingeconomics site
    // @author       Amit
    // @match        https://tradingeconomics.com/*
    // @match        https://in.investing.com/*
    // @grant        GM_addStyle
    // @require      https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js
    // @require      https://raw.githubusercontent.com/amit0rana/MonkeyConfig/master/monkeyconfig.js
    // @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
    // @require      https://raw.githubusercontent.com/amit0rana/betterOptionsTrading/master/betterCommon.js
    // @downloadURL  https://github.com/amit0rana/betterOptionsTrading/raw/master/betterTradingeconomics.user.js
    // @updateURL    https://github.com/amit0rana/betterOptionsTrading/raw/master/betterTradingeconomics.meta.js
    // ==/UserScript==

    var currentUrl = window.location.pathname;
    info(currentUrl);

//tradingeconomics.com
    function stockFilter() {
        if (currentUrl.includes('stocks')) {
            const domForAdPanel = '[data-ad=ad-below-menu]';
            //$('div#ctl00_ctl07_AdPanel').hide();
            $(domForAdPanel).hide();

            //jQ(allDOMPaths.PathForPositions).filter(':has(:checkbox:checked)');

            var statuses = [];
            var selectBox = document.createElement("SELECT");
            selectBox.id = "toggleSelectboxID";
            selectBox.classList.add("randomClassToHelpHide");
            //selectBox.style="margin: 15px 0;margin-top: 15px;margin-right: 0px;margin-bottom: 15px;margin-left: 0px;background-color: var(--color-bg-default)"

            var option = document.createElement("option");
            option.text = "Show All";
            option.value= "All";
            selectBox.add(option);

            var statusesRows = $('td#session > span');
            debug(statusesRows.length);
            statusesRows.each(function(rowIndex) {
                var title = $(this).attr('title');
                if (!statuses.includes(title)) {
                    statuses.push(title);

                    var option = document.createElement("option");
                    option.text = title;
                    option.value = title;
                    selectBox.add(option);
                }

            });
            debug(statuses);

            selectBox.addEventListener("change", function() {
                var selectedItem = this.value;

                var allRows = $('tr');

                allRows.each(function(rowIndex) {
                    if ($(this).find('th').length > 0) {
                        return;
                    }
                    var session = $(this).find(`[title='${selectedItem}']`);
                    if (selectedItem === 'All' ) {
                        $(this).show();
                    } else if (session.length > 0) {
                        $(this).show();
                    } else {
                        $(this).hide();
                    }

                });

            });

            $('#toggleSelectboxID').remove();
            $(domForAdPanel).after(selectBox);

            var refreshBtn = document.createElement("button");
            refreshBtn.id = "refreshID";
            refreshBtn.type = "button";
            refreshBtn.innerHTML = "Refresh";
            refreshBtn.addEventListener("click", function() {
                stockFilter();
            });
            $('#refreshID').remove();
            $(domForAdPanel).after(refreshBtn);
        }
    }

    stockFilter();

//investing.in
function hideAds() {
    $('div.ads').hide();
}

hideAds();