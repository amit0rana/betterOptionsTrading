// Order window additions -- auto stop-loss, quantity-freeze override, smart limit -- and
// the XMLHttpRequest interception that lets betterKite take over an order submission.
//
// This is the code path that places real trades. Change it carefully.

var open = window.XMLHttpRequest.prototype.open,
    send = window.XMLHttpRequest.prototype.send;
const BASE_URL = "https://kite.zerodha.com";
var _newOrder;
var _overrideQtyFreeze = false, _smartLimit = false, _auto_sl_order = false;
var orderDom = "form.order-window";
// var _interceptedReq;
waitForKeyElements(orderDom, addOverrideOption);

/** True when the open order window is a buy/sell on one of the indices in INDEX_CONFIG. */
function isIndexOrderWindow() {
    const action = jQ("button.submit > span").text();
    if (action !== "Buy" && action !== "Sell") return false;
    return indexSymbolFor(jQ("span.tradingsymbol > span.name").text()) !== undefined;
}

/** Checkbox + label pair appended next to the order window's Cancel button. */
function addOrderWindowCheckbox(id, labelId, labelText, onclick) {
    const div = document.createElement("div");

    const input = document.createElement("INPUT");
    input.type = 'checkbox';
    input.name = id;
    input.value = 'true';
    input.id = id;
    input.style = 'width: 18px; height: 18px; margin-top: 2px; vertical-align : middle';
    input.onclick = onclick;

    const label = document.createElement("LABEL");
    label.id = labelId;
    label.for = id;
    label.innerHTML = labelText;
    label.classList.add('text-label');
    label.classList.add('text-label-outline');
    label.style = 'margin-top: 2px;';

    div.appendChild(input);
    div.appendChild(label);
    jQ("button.button-outline.cancel").after(div);
}

function addOverrideOption() {
    debug('addOverrideOption');

    if (gmc.get('auto_sl_order') === true && isIndexOrderWindow()) {
        addOrderWindowCheckbox('autoSlOrderCb', 'autoSlOrderLbl', 'Create SL Order', function () {
            _auto_sl_order = jQ("#autoSlOrderCb").is(':checked');
            tEv("kite", "place-order", "auto-sl-order", "");
        });
        _auto_sl_order = false;
    }

    if (gmc.get('overide_qty_freeze_check_to_enable') === true && isIndexOrderWindow()) {
        addOrderWindowCheckbox('overQtyFreezeCb', 'overrideLbl', 'Override Quantity Freeze', function () {
            debug(jQ("#overQtyFreezeCb").is(':checked'));

            var con = true;
            if (gmc.get('qty_freeze_warning') === true) {
                con = confirm(`You are placing order for ${jQ("div.quantity > div:nth-child(1) > input:nth-child(2)").val()} Quantity. Are you sure?`);
            }

            if (con === true) {
                _overrideQtyFreeze = jQ("#overQtyFreezeCb").is(':checked');
                tEv("kite", "place-order", "override-qt-freeze", "");
            } else {
                setTimeout(() => {
                    jQ("#overQtyFreezeCb").prop('checked', false);
                }, 0);
            }
        });
        _overrideQtyFreeze = false;
    }

    if (gmc.get('smart_limit_check_to_enable') === true && isIndexOrderWindow()) {
        var insert = `
    <div class="su-radio-wrap" tooltip-pos="down" data-balloon-pos="down" data-balloon="Sell/buy at a 05p betrer than first offer/bid price">
        <input type="radio" name="orderType" label="Smart Limit" class="su-radio" id="smartLimit" value="SMARTLIMIT"
        title="Sell/buy at a 05p better than first offer/bid price">
        <label class="su-radio-label" for="smartLimit">Smart Limit</label>
    </div>
    `;

        //jQ("div.su-radio-group.order-type").append(insert);
        jQ("div.four.columns.price > div.su-radio-group.order-type").append(insert);
    }

}

function openReplacement(method, url, async, user, password) {
    debug("openReplacement " + url);
    
    if (method === 'POST' && url.includes('/orders/regular')) {
        _newOrder = true;
    } else {
        _newOrder = false;
    }
    return open.apply(this, arguments);
}

window.addEventListener('load', function() {
    debug('onload');
    debug(window.location.href)
    if (window.location.href.includes('request_token')) {
        var q = qs.parse(window.location.href);
        debug(q.status);
        if (q.status == 'success') {
            jQ.post('https://api.kite.trade/session/token',
                {'api_key':gmc.get('api_key') , 'request_token':q.request_token, 'checksum':sha256(gmc.get('api_key') + q.request_token + gmc.get('api_secret'))},
                function (data, status) {
                    debug("AAAAAA");
                    
                    debug("Data: " + data + "\nStatus: " + status);
                    window.location.href="https://kite.zerodha.com";
                    getToast(`AT status ${status}`).showToast();
                    gmc.set('api_access_token',data.data.access_token);
                    gmc.save(false);
                    // setTimeout(() => {
                    //     window.open("https://kite.zerodha.com", "_self");
                    // }, 1000);
                    
                })
                .fail(function (xhr, status, error) {
                    debug("BBBB");
                    var resp = JSON.parse(xhr.responseText);

                    getToast(`AT Status ${status} :: ${resp.message}`).showToast();

                });
        } else {
            getToast('Unable to get Request Token').showToast();
        }
        
    }
}, false);

/**
 * Whether this order needs splitting because it exceeds the exchange's freeze quantity
 * for its index. Stocks have no configured freeze quantity and are never split.
 */
function exceedsQtyFreeze(order) {
    const limits = indexLimitsFor(order.tradingsymbol);
    return limits !== undefined && order.quantity > limits.freezeQty;
}

function sendReplacement(data) {
    debug("sendReplacement");

    if (_newOrder === true) {
        var order = queryStringToJSON(data);
        debug(order);
        debug(`smartLimit ${jQ("#smartLimit").is(":checked")}`);
        debug(`overQtyFreezeCb ${jQ("#overQtyFreezeCb").is(':checked')}`);
        debug(`${order.tradingsymbol} qty ${order.quantity} exceeds freeze: ${exceedsQtyFreeze(order)}`);

        const splitForQtyFreeze = jQ("#overQtyFreezeCb").is(':checked') && exceedsQtyFreeze(order);

        if (jQ("#autoSlOrderCb").is(":checked") || jQ("#smartLimit").is(":checked") || splitForQtyFreeze) {
            setTimeout(() => {
                var button = jQ("button:contains('Cancel')");
                button.click();
            }, 0);

            debug('aborting send ');

            this.abort();

            if (jQ("#smartLimit").is(":checked")) {
                _smartLimit = true;
                jQ("#smartLimit").prop('checked', false);
                tEv("kite", "place-order", "smart-limit", "");
                // throw new Error("Smart Limit Order is executed in the background, Check orders. Check betterKite message");
            } else {
                _smartLimit = false;
            }

            if (splitForQtyFreeze) {
                _overrideQtyFreeze = true;
                jQ("#overQtyFreezeCb").prop('checked', false);
            } else {
                debug('setting qty freeze to false');
                _overrideQtyFreeze = false;
            }

            if (jQ("#autoSlOrderCb").is(":checked")) {
                _auto_sl_order = true;
                jQ("#autoSlOrderCb").prop('checked', false);
            }

            if (_smartLimit === true || _overrideQtyFreeze == true || _auto_sl_order == true) {
                sendPlaceNewOrderRequest(order);

                throw new Error("Zerodha order stopped. betterKite order sent. Check orders / betterKite message");
            }

        } else {
            debug('order didnt fulfil condition');
            debug(`${order.tradingsymbol} ${order.quantity}`);
        }
    }

    return send.apply(this, arguments);

}

window.XMLHttpRequest.prototype.open = openReplacement;
window.XMLHttpRequest.prototype.send = sendReplacement;
