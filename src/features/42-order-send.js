// Sends orders betterKite has taken over: looks up the best bid/offer for smart limit,
// splits anything above the freeze quantity, and optionally places the paired SL order.

function myAjaxSetup() {
    let myAuth = `enctoken ${getCookie('enctoken')}`;
    if (gmc.get('use_api')) {
        myAuth = `token ${gmc.get('api_key')}:${gmc.get('api_access_token')}`;
    }

    jQ.ajaxSetup({
        headers: {
            'Authorization': myAuth
        }
    });
}
function sendPlaceNewOrderRequest(order) {
    debug('sendPlaceNewOrderRequest');

    // Function-scoped because the nested success callback below reads it.
    var myUrl;

    myAjaxSetup();
    if (_smartLimit === true) {
        order.order_type = "LIMIT";

        if (order.transaction_type === "SELL") {
            order.price = 10000; //on safer side, keeping a random high price
        }
        if (order.transaction_type === "BUY") {
            order.price = 0.05; //on safer side, keeping a random low price
        }

        myUrl = BASE_URL + `/oms/quote?i=${order.exchange}:${order.tradingsymbol}`;
        if (gmc.get('use_api')) {
            myUrl = `https://api.kite.trade/quote?i=${order.exchange}:${order.tradingsymbol}`;
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
                debug(order);
                var newPrice = response.data[`${order.exchange}:${order.tradingsymbol}`].depth[order.transaction_type.toString().toLowerCase()][0].price;
                if (order.transaction_type === 'BUY') {
                    newPrice = newPrice + 0.05;
                } else if (order.transaction_type === 'SELL') {
                    newPrice = newPrice - 0.05;
                }

                order.price = newPrice;
            },
            complete: function () {
                debug("33333");
            }
        });
    }
    debug("44444");


    var qty = order.quantity;
    var remainigQty = qty;

    // Orders bigger than the exchange freeze quantity go out as several smaller ones.
    // Anything without a configured freeze quantity (stocks) is sent in one piece.
    var freezeLimits = _overrideQtyFreeze === true ? indexLimitsFor(order.tradingsymbol) : undefined;
    var limit = freezeLimits ? freezeLimits.freezeQty : qty;

    for (let index = 0; index < (qty / limit); index++) {

        var q = limit;
        if (parseInt(q) > parseInt(remainigQty)) {
            q = remainigQty;
        }
        order.quantity = q;

        debug(`placing order for ${q}`);

        myAjaxSetup();
        myUrl = BASE_URL + "/oms/orders/regular";
        if (gmc.get('use_api')) {
            myUrl = `https://api.kite.trade/orders/regular`;
        }

        jQ.post(myUrl,
            order,
            function (data, status) {
                debug("5555");

                debug("Data: " + data + "\nStatus: " + status);
                getToast(`${status}`).showToast();

                //place SL order
                if (_auto_sl_order == true) {
                    debug('placing SL order');
                    debug(order);
                    if (order.transaction_type == "SELL") {
                        order.transaction_type = "BUY";
                        order.price = (parseFloat(order.price) + parseFloat(gmc.get("auto_sl_points"))).toString();
                        order.trigger_price = order.price;
                        order.trailing_stoploss = (gmc.get("auto_trail_points")).toString();
                    } else if (order.transaction_type == "BUY") {
                        order.transaction_type = "SELL";
                        order.price = (parseFloat(order.price) - parseFloat(gmc.get("auto_sl_points"))).toString();
                        order.trigger_price = order.price;
                        order.trailing_stoploss = (gmc.get("auto_trail_points")).toString();
                    }

                    order.order_type = "SL";
                    debug(order);

                    jQ.post(myUrl,
                        order,
                        function (data, status) {
                            debug("AAAAAA");

                            debug("Data: " + data + "\nStatus: " + status);
                            getToast(`SL Order ${status}`).showToast();
                        })
                        .fail(function (xhr, status, error) {
                            debug("BBBB");
                            var resp = JSON.parse(xhr.responseText);

                            getToast(`SL Order ${status} :: ${resp.message}`).showToast();

                        });

                }


            })
            .fail(function (xhr, status, error) {
                debug("666");
                var resp = JSON.parse(xhr.responseText);

                getToast(`${status} :: ${resp.message}`).showToast();

            });

        remainigQty = remainigQty - q;

    }

    debug("99999");
}

