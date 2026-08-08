// Shows premium received and ROI in the order window and the basket window, recalculating
// whenever Kite rewrites the margin figures.

function onTextChange(target, onChange) {
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type == "characterData") {
                onChange();
            }
        });
    });
    observer.observe(target, { characterData: true, subtree: true });
    return observer;
}

function showRoiNudge() {
    if (jQ("div.instrument > span.transaction-type").text().trim() == 'Sell') {
        updateRoiNudge();
        onTextChange(jQ("span.value")[0], updateRoiNudge);

        jQ(document).on('change', 'input[label="Price"]', function () {
            updateRoiNudge();
        });
    }
}

function updateRoiNudge() {
    var lastPrice = 0;
    var margin = jQ("span.value").text().trim().split('₹').join("").split(",").join("");
    var qty = jQ('input[label="Qty."]').val();

    if (jQ('input[value="MARKET"]').prop('checked') == true) {
        lastPrice = parseFloat(jQ('div > span.last-price').text().trim().split('₹').pop().split(",").join(""));
    }
    if (jQ('input[value="LIMIT"]').prop('checked') == true) {
        debug();
        lastPrice = parseFloat(jQ('input[label="Price"]').val());
    }
    debug(lastPrice);
    debug(qty);
    debug(qty * lastPrice);
    debug(margin);

    jQ('#nudgepremiumid').remove();
    jQ('footer.footer > div > div:nth-child(1)').append(`<div id="nudgepremiumid" class="row margins"><span class="label">Premium Recvd: </span> <span >${formatter.format(qty * lastPrice)} (ROI: ${(((qty * lastPrice) / margin) * 100).toFixed(2)}%)</span></div>`);

}

function showBasketRoiNudge() {
    updateBasketRoiNudge();
    onTextChange(jQ("div.value.final-margins-value")[0], updateBasketRoiNudge);

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
