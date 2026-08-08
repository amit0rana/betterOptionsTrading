// Turns a holdings/orders/positions table row into a plain object.
//
// The only place column indices live. Anything reading `find("td")[n]` elsewhere is a bug
// waiting for Kite to add a column.

function getHoldingRowObject(row) {
    var holding = {};

    var tds = jQ(row).find("td");

    holding.instrument = jQ(jQ(tds[0]).find("span")[0]).text().trim();

    var spans = jQ(tds[1]).find("span");
    if (spans.length > 0 ) {
        //data-balloon=T1, Pledged
        let q = 0;
        holding.pledged = 0;
        if (Array.isArray(spans)) {
            spans.forEach(sp => {
                const spTxt = jQ(sp).text().trim().split(':');
                if (spTxt[0] == "T1") {
                    q = parseInt(spTxt[1]);
                } else if (spTxt[0] == "P") {
                    holding.pledged = parseInt(spTxt[1]);
                }
            });
        } else {
            const spTxt = jQ(spans).text().trim().split(':');
            holding.pledged = parseInt(spTxt[1]);
        }
        holding.quantity = parseInt(jQ(tds[1]).clone()    // Create a clone of the element
            .children()     // Select all child elements
            .remove()       // Remove all child elements
            .end()          // Go back to the cloned element
            .text()         // Get the remaining text
            .trim());
        holding.quantity = holding.quantity + q
    } else {
        holding.pledged = 0;
        holding.quantity = parseInt(jQ(tds[1]).text().trim());
    }
    

    holding.avgCost = parseFloat(jQ(tds[2]).text().split(",").join(""));
    holding.ltp = parseFloat(jQ(tds[3]).text().split(",").join(""));
    holding.pnl = parseFloat(jQ(tds[6]).text().split(",").join(""));

    
    return holding;
}

function getOrderRowObject(row) {
    var order = {};
    
    var dataUidInTR = jQ(jQ(row).find("td")[0]).find('input').attr('id');
    order.orderId = dataUidInTR.split("NFO")[1]?dataUidInTR.split("NFO")[1]:dataUidInTR.split("BFO")[1];
    order.exchange = dataUidInTR.match(new RegExp("(?:NFO|BSE|NSE)"))[0];
    order.transactionType = jQ(row).find('td.transaction-type').text().trim();
    order.symbol = jQ(row).find('td > a > span.tradingsymbol').text().trim();
    order.tradingsymbol = dataUidInTR.match(new RegExp("(?:NRML|CNC|MIS)((.[\\s\\S]*))(?:NFO|BSE|NSE)"))[1];
    order.instrument = `${order.exchange}:${order.tradingsymbol}`;
    order.price = parseFloat(jQ(jQ(row).find("td.average-price")).text().split(",").join(""));
    // order.price = 96.5;
    //parseInt(jQ(row).find('td.average-price').text().trim().replace(/\,/g, ''), 10);
    order.ltp = parseFloat(jQ(jQ(row).find("td.last-price")).text().split(",").join(""));
    order.product = jQ(row).find('td.prodduct').text().trim()
    
    debug(order);

    return order;
}

function getPositionRowObject(row) {
    //instrument what you see in the
    //tradingsymbl what you send NIFTY21JUN15750CE
    //scrip  NIFTY21JUL
    //eg: NIFTY2140814200CE (NIFTY 8th w APR 14200 CE NFO LABELS)
    var position = {};


    position.pnl = jQ(jQ(row).find("td")[6]).text().split(",").join("");
    // position.instrument = jQ(jQ(row).find("td")[2]).text();
    position.instrument = jQ(jQ(row).find("span.tradingsymbol")).text().trim();
    position.exchange = jQ(jQ(row).find("span.exchange")).text().trim();

    position.product = jQ(jQ(row).find("td")[1]).text().replace(/\s/g, '');
    position.state = jQ(jQ(row).find("td")[1]).attr("class").split(" ")[0];
    position.quantity = parseFloat(jQ(jQ(row).find("td")[3]).text().split(",").join(""));
    position.avgPrice = parseFloat(jQ(jQ(row).find("td")[4]).text().split(",").join(""));
    position.ltp = parseFloat(jQ(jQ(row).find("td")[5]).text().split(",").join(""));

    if (position.quantity > 0) {
        position.transaction_type = 'BUY';
    } else {
        position.transaction_type = 'SELL';
    }

    if (position.instrument != "") {
        var data = getMarginCalculationData(position.instrument, position.exchange, position.product, position.quantity, position.avgPrice);

        if (data != null) {
            position.exchange = data.exchange;
            position.pece = data.pece;
            position.strike = data.strike;
            position.optfut = data.optfut;
            position.scrip = data.scrip;
            position.tradingsymbol = data.tradingsymbol;
            position.symbol = data.symbol;
        }
    }
    
    return position;
}
