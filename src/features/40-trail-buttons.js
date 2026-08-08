// TRAIL and Save Profit buttons on trigger-pending orders. Both adjust the stop and PUT
// the order back; only the price arithmetic differs.

function modifyPendingOrderFromButton(e, button, adjustPrices) {
    e.stopImmediatePropagation();

    var data = button.getAttribute("data");
    debug(data);
    var spl = data.split("|");
    var order = {};
    order.order_id = spl[1];
    order.price = spl[2];
    order.trigger_price = spl[3];
    var transaction_type = spl[4];

    // Anything other than a plain BUY/SELL is sent through untouched, as before.
    if (transaction_type == "SELL" || transaction_type == "BUY") {
        adjustPrices(order, transaction_type == "SELL" ? 1 : -1);
    }

    debug(order);

    jQ.ajaxSetup({
        headers: {
            'Authorization': `enctoken ${getCookie('enctoken')}`
        }
    });
    jQ.ajax({
        url: BASE_URL + `/oms/orders/regular/${order.order_id}`,
        type: 'PUT',
        data: order,
        async: false,
        cache: false,
        error: function (xhr, status, error) {
            debug(error);
            debug(xhr.responseText);
            getToast(`${status} :: ${error} :: ${xhr.responseText}`).showToast();

            throw new Error("Not able to trail. " + error);
        },
        success: function (response, status) {
            debug("Data: " + JSON.stringify(response) + "\nStatus: " + status);
            getToast(`Trail Successful. Reloading.`).showToast();
            reloadPage();
        }
    });

    return false;
}

//code for SL trail
waitForKeyElements("div.pending-orders > div > div.table-wrapper > table > tbody", trailOrderButton);

function trailOrderButton() {
    var allPendingOrderRows = jQ(allDOMPaths.domPathPendingOrdersTR);

    info("pending orders: " + allPendingOrderRows.length);

    allPendingOrderRows.each(function (rowIndex) {
        var workingRow = this;
        var status = jQ(workingRow).find("td.order-status > span.order-status-label > span").text();
        var dataUidInTR = jQ(workingRow).find("td.select-cell > div > input").attr("id");
        if (status == "TRIGGER PENDING") {
            debug('addig trail button');

            var prices = jQ(this).find("td.average-price > span").text();
            var split = prices.split('/');
            var price = split[0].trim();
            var tPrice = split[1].split("t")[0].trim();
            debug(`price : ${price}`);
            debug(`tPrice : ${tPrice}`);
            var orderId = dataUidInTR.split("NFO")[1]?dataUidInTR.split("NFO")[1]:dataUidInTR.split("BFO")[1];

            var transaction_type = jQ(this).find("td.transaction-type > span").text();
            jQ(this).find("td.average-price").append(`<span id='trailButtonId' data='${dataUidInTR}|${orderId}|${price}|${tPrice}|${transaction_type}' class='text-label small order-status-label'><span>TRAIL</span></span>`);
            tippy('#trailButtonId', {
                content: `This will change (inc. for sell, dec. for buy) the trigger price and price by ${gmc.get("auto_trail_points")} 'Auto trail points' in settings.`,
                placement: 'bottom',
            });

            jQ(this).find("td.average-price").append(`<span id='saveProfitButtonId' style="margin-left: 2px;" data='${dataUidInTR}|${orderId}|${price}|${tPrice}|${transaction_type}' class='text-label small order-status-label'><span>Save Profit</span></span>`);
            tippy('#saveProfitButtonId', {
                content: `This will change (inc. for sell, dec. for buy) the trigger price and price by ${gmc.get("auto_sl_points")} 'Auto sl points' + ${gmc.get("auto_save_profit_points")} 'Auto save profit points' in settings.`,
                placement: 'bottom',
            });
        }

    });


}

// Captured before the patching at the bottom of this file, so the replacements can
// still delegate to the originals.