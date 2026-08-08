// Re-prices selected pending orders in bulk, to LTP or by a fixed delta.

function showBumpButton() {
    debug('showBumpButton');
    jQ("#bumpOrder").remove();
    var i = document.createElement("BUTTON");
    i.type = 'button';
    i.name = 'bumpOrder';
    i.value = 'Bump by betterKite';
    i.innerHTML = 'Bump by betterKite';
    i.id = 'bumpOrder';
    i.style = 'margin: 0px 2px;';
    i.classList.add('button-small');
    i.classList.add('button-green');


    i.onclick = function () {
        var orders = [];

        var selectedOrders = jQ("tr.selected");
        // var selectedOrders = $("#app > div.container.wrapper > div.container-right > div.page-content.orders > div > section.pending-orders-wrap.table-wrapper > div > div > table > tbody > tr.selected");
        selectedOrders.each(function (rowIndex) {
            var o = getOrderRowObject(this);

            switch (gmc.get('bump_method')) {
                case 'LTP':
                    o.price = o.ltp;
                    orders.push(o);
                    break;
                case 'Delta':
                    if (o.transactionType == "SELL") {
                        o.price = o.price - gmc.get('bump_delta')
                    }
                    if (o.transactionType == "BUY") {
                        o.price = o.price + gmc.get('bump_delta')
                    }
                    orders.push(o);
                    break;
                case 'Best Price':
                    getToast(`Best price not implemented yet.`).showToast();
                    break;
                default:
                    break;
            }
        });

        debug(orders);
        bumpOrders(orders);
    };

    // $(document).on('mouseenter', "#bumpOrder", function () {
    //     if (encKey.length <= 0) {
    //         $("#bumpOrder").prop('disabled', true);
    //         $("#bumpOrder").html(`Bump Disabled (${encKey.length})`);
    //     } else {
    //         $("#bumpOrder").prop('disabled', false);
    //         $("#bumpOrder").html(`Synch Bump (${encKey.length})`);
    //     }
    // });
    //document.querySelector("#app > div.container.wrapper > div.container-right > div.page-content.orders > div > section.pending-orders-wrap.table-wrapper > div > div > table > tfoot > tr > td:nth-child(1)")

    jQ("#app > div.container.wrapper > div.container-right > div.page-content.orders > div > section.pending-orders-wrap.table-wrapper > div > div > table > tfoot > tr > td:nth-child(1)").attr('colspan', '4');
    // $("#app > div.container.wrapper > div.container-right > div.page-content.orders > div > section.pending-orders-wrap.table-wrapper > div > div > table > tfoot > tr > td:nth-child(1) > button").after(i);
    jQ("button:contains('Cancel')").after(i);
}

function bumpOrders(orders) {
    debug('bump order');

    for (const order of orders) {
    // orders.each(function (order) {
        // jQ.post(BASE_URL + "/bumpOrders",
        //     { 'data': orders, 'key': encKey, 'by_user': $('span.user-id').text().trim() },
        //     function (data, status) {
        //         debug("Data: " + data + "\nStatus: " + status);
        //     });

            jQ.ajaxSetup({
                headers: {
                    'Authorization': `enctoken ${getCookie('enctoken')}`
                }
            });
            jQ.ajax({
                url: BASE_URL + `/oms/orders/regular/${order.orderId}`,
                type: 'PUT',
                data: order,
                async: false,
                cache: false,
                error: function (xhr, status, error) {
                    debug(error);
                    debug(xhr.responseText);
                    getToast(`${status} :: ${error} :: ${xhr.responseText}`).showToast();

                    throw new Error("Not able to modify order. " + error);
                },
                success: function (response, status) {
                    debug("22222");
                    debug("Data: " + JSON.stringify(response) + "\nStatus: " + status);
                    getToast(`Order modification Successful.`).showToast();
                },
                complete: function () {
                    debug("33333");
                }
            });
        };
}

jQ(document).on('change', "input.su-checkbox", function () {
    showBumpButton();
});

