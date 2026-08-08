// Works out how much margin a set of short positions would free up if hedged, by pricing
// the basket again with the hedge legs added.

function checkMarginSaving() {
    tEv("kite", "checkMarginSaving", "click", "");
    debug('checkMarginSaving');
    // var selectedRows = jQ(allDOMPaths.PathForPositions+".selected");
    var selectedRows = jQ(allDOMPaths.PathForPositions + ":visible");

    var marginData = {};
    var symbols = [];
    selectedRows.each(function (rowIndex) {
        var position = getPositionRowObject(this);

        // if (position.instrument.includes('NSE') || position.instrument.includes('BSE') || (position.symbol != 'NIFTY' && position.symbol != 'BANKNIFTY')) {
        if (position.instrument == "" || position.instrument.includes('NSE') || position.instrument.includes('BSE')) {
            debug('skipping ' + position.symbol);
            return;
        }

        if (!symbols.includes(position.symbol)) {
            symbols.push(position.symbol);
        }


        if (!marginData.hasOwnProperty(position.symbol + '_md')) {
            marginData[position.symbol + '_md'] = [];
            marginData[position.symbol + '_pe'] = 0;
            marginData[position.symbol + '_ce'] = 0;
            marginData[position.symbol + '_strikes'] = [];
            marginData[position.symbol + '_scrip'] = '';
        }

        if (position.pece == 'CE') {
            marginData[position.symbol + '_ce'] = marginData[position.symbol + '_ce'] + position.quantity;
        } else if (position.pece == 'PE') {
            marginData[position.symbol + '_pe'] = marginData[position.symbol + '_pe'] + position.quantity;
        }

        marginData[position.symbol + '_md'].push(position);
        marginData[position.symbol + '_strikes'].push(position.strike);
        marginData[position.symbol + '_scrip'] = position.scrip;
    });

    debug(marginData);

    symbols.forEach(function (symbol, index) {
        //debug(symbol);

        var data = marginData[symbol + '_md'];

        calculateMargin(data).then(margin1 => {
            debug(symbol + ' now ' + formatter.format(margin1));

            // Plain stocks have no INDEX_CONFIG row and fall back to the stock offset.
            var increment = gmc.get(INDEX_CONFIG[symbol]?.hedgeSetting ?? 'stock_hedge');
            var minStrike = Math.min(...marginData[symbol + '_strikes']) - parseInt(increment);
            var maxStrike = Math.max(...marginData[symbol + '_strikes']) + parseInt(increment);

            var dp = { 'order_type': 'MARKET', 'price': 0, 'product': 'NRML', 'exchange': 'NFO', 'transaction_type': 'BUY', 'trigger_price': 0, 'optfut': 'OPT', 'scrip': marginData[symbol + '_scrip'] };
            var dc = { 'order_type': 'MARKET', 'price': 0, 'product': 'NRML', 'exchange': 'NFO', 'transaction_type': 'BUY', 'trigger_price': 0, 'optfut': 'OPT', 'scrip': marginData[symbol + '_scrip'] };
            // d.order_type = 'MARKET';

            // d.squareoff = 0;
            // d.stoploss = 0;

            // variety = 'regular';


            if (marginData[symbol + '_pe'] < 0) {
                debug(' PE saving possible ' + minStrike);
                dp.quantity = Math.abs(marginData[symbol + '_pe']);
                dp.tradingsymbol = dp.scrip + minStrike + 'PE';
                dp.pece = 'PE';
                dp.strike = minStrike;
                data.push(dp);
            }

            if (marginData[symbol + '_ce'] < 0) {
                debug(' CE saving possible ' + maxStrike);
                dc.quantity = Math.abs(marginData[symbol + '_ce']);
                dc.tradingsymbol = dc.scrip + maxStrike + 'CE';
                dc.pece = 'CE';
                dc.strike = maxStrike;
                data.push(dc);
            }


            debug(data);


            calculateMargin(data).then(margin2 => {
                debug(symbol + ' later ' + formatter.format(margin2));
                alert(`You can potentially FREE approx ${formatter.format(margin1 - margin2)} margin by taking following hedge. BUY ${Math.abs(marginData[symbol + '_pe'])} x ${symbol} ${minStrike}PE and BUY ${symbol} ${Math.abs(marginData[symbol + '_ce'])} x ${maxStrike}CE`)
            });
        });


    });

    // Object.keys(marginData).forEach(function(symbol) {
    //     debug(symbol);
    //     if(symbol.includes('_md')) {
    //         var data = marginData[symbol];
    //         debug(data);

    //         calculateMargin(data).then(margin => {
    //             debug(symbol + ' ' + formatter.format(margin));
    //         });
    //     }
    // });


}

function resetSubFilter() {
    g_showOnlyPEPositions = false;
    g_showOnlyCEPositions = false;
    g_showOnlyMISPositions = false;
    g_showOnlyOPTPositions = false;
    g_showOnlyFUTPositions = false;
    g_subFilter = false;
    g_subFilterData = false;
}

// all behavior related actions go here.
