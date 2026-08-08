// NOT PART OF THE BUILD -- this file is absent from build/manifest.json.
//
// The "copy orders between Zerodha accounts" feature, documented in
// betterKiteCopyOrders.md. Its two entry points were already commented out before the
// v5.08 cleanup:
//
//     waitForKeyElements(BASE_ORDERINFO_DOM, orderInfo);   // opened the Copy Order button
//     jQ(document).on('click', orderHeader, ...)           // toggled the Send Order form
//
// so none of it ran. Moved here rather than deleted, since the feature is still
// described in the docs.
//
// To re-enable: add this file to build/manifest.json and restore those two entry points.
// Note the hardcoded api_key in showSendOrderButton() below -- that should move into
// GM_config settings before this is used again.

const BASE_ORDERINFO_DOM = "div.modal-mask.order-info-modal > div.modal-wrapper > div.modal-container.layer-2";
var g_tradingBasket = new Array();

function orderInfo() {
    debug('orderInfo');

    var ts = jQ(BASE_ORDERINFO_DOM + " > div > div > div > h3.tradingsymbol").text().trim().split(' ');
    var tradingsymbol = ts[0];

    var i = document.createElement("INPUT");
    i.type = 'button';
    i.name = 'copyOrder';
    i.value = 'Copy Order (' + g_tradingBasket.length + ')'
    i.id = 'copyOrder';
    i.classList.add('button');
    i.classList.add('button-outline');

    if (JSON.stringify(g_tradingBasket).includes("\"" + tradingsymbol + "\"")) {
        i.value = 'Already Copied. Close';
        i.onclick = function () {
            var buttons = jQ("#app > div.container.wrapper > div.container-right > div > div > div > div > div > div.modal-footer > div > button");
            buttons[buttons.length - 1].click();
        };
    } else {
        i.onclick = function () {
            var ts = jQ(BASE_ORDERINFO_DOM + " > div > div > div > h3.tradingsymbol").text().trim().split(' ');
            var tradingsymbol = ts[0];
            debug(tradingsymbol);
            var exchange = ts[1];
            debug(exchange);

            var transactionType = jQ(BASE_ORDERINFO_DOM + " > div.modal-header > div > div.eight.columns.tradingsymbol-wrapper > span").text().trim();
            debug(transactionType);

            var orderType = jQ(BASE_ORDERINFO_DOM + " > div.modal-body > div > div > div.four.columns.left.mobile-modal > div:nth-child(5) > div.six.columns.text-right > div.order-type").text().trim();
            debug(orderType);

            var product = jQ(BASE_ORDERINFO_DOM + " > div.modal-body > div > div > div.four.columns.left.mobile-modal > div:nth-child(6) > div.six.columns.text-right > div.product").text().trim();
            debug(product);

            var quantity = jQ(BASE_ORDERINFO_DOM + " > div.modal-body > div > div > div.four.columns.left.mobile-modal > div:nth-child(1) > div.six.columns.text-right > div").text().trim().split('/')[0];

            var price = jQ(BASE_ORDERINFO_DOM + " > div.modal-body > div > div > div.four.columns.left.mobile-modal > div:nth-child(3) > div.six.columns.text-right > div").text().trim();
            debug(price);

            if (!JSON.stringify(g_tradingBasket).includes("\"" + tradingsymbol + "\"")) {
                g_tradingBasket.push({ "product": product, "variety": "regular", "tradingsymbol": tradingsymbol, "exchange": exchange, "transaction_type": transactionType, "order_type": orderType, "price": parseFloat(price), "quantity": parseInt(quantity), "readonly": false });

                navigator.clipboard.writeText(JSON.stringify(g_tradingBasket));


                updateOrderButtons();
                tEv("kite", "order", "copyOrder", "");
            } else {
                debug('not adding order to basket');
                debug(JSON.stringify(g_tradingBasket));
            }

            var buttons = jQ("#app > div.container.wrapper > div.container-right > div > div > div > div > div > div.modal-footer > div > button");
            buttons[buttons.length - 1].click();
        };
    }

    //#app > div.container.wrapper > div.container-right > div.page-content.orders > div > div > div > div > div.modal-footer > div > button.button.button-orange.button-outline

    jQ(BASE_ORDERINFO_DOM + " > div > div > button")[0].before(i);
}

function showSendOrderButton() {
    var div = document.createElement("DIV");
    div.style = 'float:right';
    div.id = 'bkSendOrderDiv';

    var form = document.createElement("FORM");
    form.method = 'post';
    form.id = 'bo_basket-form';
    form.action = "https://kite.zerodha.com/connect/basket";
    form.classList.add("randomClassToHelpHide");

    var i = document.createElement("INPUT");
    i.type = 'hidden';
    i.name = 'api_key';
    i.value = '4s0c0wfr478wne1s';
    i.classList.add("randomClassToHelpHide");

    jQ(form).append(i);

    i = document.createElement("INPUT");
    i.type = 'hidden';
    i.name = 'data';
    i.id = 'bobasket';
    i.classList.add("randomClassToHelpHide");

    jQ(form).append(i);

    i = document.createElement("INPUT");
    i.type = 'button';
    i.name = 'sendOrder';
    i.value = 'Send Order';
    i.classList.add("randomClassToHelpHide");
    i.classList.add('button');
    i.classList.add('button-outline');
    i.id = 'sendOrder';

    jQ(form).append(i);

    i = document.createElement("INPUT");
    i.type = 'button';
    i.name = 'resetOrder';
    i.value = 'Reset Order';
    i.classList.add("randomClassToHelpHide");
    i.classList.add('button');
    i.classList.add('button-outline');
    i.id = 'resetOrder';

    jQ(form).append(i);

    jQ(div).append(form);

    jQ(document).on('click', "#sendOrder", async function () {
        debug('submiting send ordre');
        const t = await navigator.clipboard.readText();
        jQ('#bobasket').val(t);

        //g_tradingBasket.splice(0, g_tradingBasket.length);
        //navigator.clipboard.writeText("");
        jQ("#bo_basket-form").submit();
        tEv("kite", "order", "sendOrderClick", "");
    });

    jQ(document).on('mouseenter', "#sendOrder", async function () {
        debug('refreshing mouse enter');

        updateOrderButtons();

        tEv("kite", "order", "sendOrderMouseOver", "");
    });

    jQ(document).on('click', "#resetOrder", async function () {
        debug('reset order');
        navigator.clipboard.writeText("");
        updateOrderButtons();
        tEv("kite", "order", "resetOrder", "");
    });
    jQ('#bkSendOrderDiv').remove();
    jQ(".page-nav").append(div);
    if (jQ("div.container.wrapper > div.container-right > div.page-nav").length < 1) {
        debug('sleeping as couldnt find order div');

        //setTimeout(function(){ jQ("div.container.wrapper > div.container-right > div.page-nav").append(div); }, 1100);
        return;
    }

}

async function updateOrderButtons() {
    const t = await navigator.clipboard.readText();

    try {
        g_tradingBasket = JSON.parse(t);
    } catch (err) {
        g_tradingBasket.splice(0, g_tradingBasket.length);
        debug("There was error in parsing order");
    }
    jQ("#sendOrder").val('Send Order (' + g_tradingBasket.length + ')');
}
