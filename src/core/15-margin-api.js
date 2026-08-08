// Margin lookups, either through Kite's own basket endpoint (default) or the public SPAN
// calculator (needs a CORS extension), plus the payload builder both share.

const calculateMargin = async (selection) => {
    if (MARGIN_METHOD == MM_BASKET) {
        return calculateMarginUsingBasket(selection);
    } else {
        return calculateMarginUsingMarginCalculator(selection);
    }
}

const calculateMarginUsingMarginCalculator = async (selection) => {
    let margin = 0
    var payload = qs.stringify({
        'action': 'calculate'
    });
    selection.forEach(data => {
        var d = qs.stringify({
            'exchange[]': data.exchange,
            'product[]': data.optfut,
            'scrip[]': data.scrip,
            'option_type[]': data.pece,
            'strike_price[]': `${data.strike}`,
            'qty[]': `${Math.abs(data.quantity)}`,
            'trade[]': data.transaction_type.toLowerCase()
        });
        payload = `${payload}&${d}`
    });

    var config = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    };
    let response = await axios.post("https://zerodha.com/margin-calculator/SPAN/", payload, config);
    margin = response.data.total != null && response.data.total !== undefined ? response.data.total.total : 0;
    debug('calculateMarginUsingMarginCalculator');
    return margin;
}

const calculateMarginUsingBasket = async (selection) => {
    let margin = 0
    var payload = []

    selection.forEach(data => {
        var orderType = 'LIMIT'
        if (data.hasOwnProperty('order_type')) {
            orderType = data.order_type;
        }
        var d = {
            'exchange': data.exchange,
            'order_type': orderType,
            'price': data.price,
            'product': data.product,
            'quantity': Math.abs(data.quantity),
            'squareoff': 0,
            'stoploss': 0,
            'tradingsymbol': data.tradingsymbol,
            'transaction_type': data.transaction_type,
            'trigger_price': 0,
            'variety': 'regular'
        };
        payload.push(d)
    });

    var config = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `enctoken ${getCookie('enctoken')}`
        }
    };
    // debug(`config: ${config} payload: ${payload}`)
    return await axios.post(`/oms/margins/basket?consider_positions=${gmc.get('include_existing_positions')}&mode=compact`, payload, config)
        .then(function (response) {
            //margin = response.data.data.initial!=null && response.data.data.initial!==undefined?response.data.data.initial.total:0;
            margin = response.data.data.final != null && response.data.data.final !== undefined ? response.data.data.final.total : 0;
            return margin;
        }
        )
        .catch(function (error) {
            debug(error); return -1;
        }
        );

}

const getMarginCalculationData = (instrument, exchange , product, q, price) => {

    if (instrument == "") return null;
    // frame payload for SPAN calculation
    var tokens = instrument.replace(/\s+/g, ' ').split(" ");
    //debug(tokens);
    var data = {};
    data.exchange = exchange;
    if (exchange === "NSE" || exchange === "BSE") { //buy: OAL BSE HOLDING, sell: OAL NSE SOLD HOLDING
        return null;
    }
    data.symbol = tokens[0];
    
    data.product = product.replace(/\s/g, '');
    //data.product = product.replace(/\n/g, '').replace(/\t/g, '').trim();
    if (tokens[2] === "FUT") {
        //NIFTY APR FUT NFO
        data.tradingsymbol = `${tokens[0]}${moment(new Date()).format("YY")}${tokens[1]}FUT`;
        // data.exchange = `${tokens[3]}`;
        data.pece = 'PE';
        data.strike = '';
        data.optfut = 'FUT';
        data.scrip = `${tokens[0]}${moment(new Date()).format("YY")}${tokens[1]}`;
    } else {
        data.optfut = 'OPT';
        if (tokens[2] === "w") {
            //eg: NIFTY2140814200CE (NIFTY 8th w APR 14200 CE NFO LABELS)
            const MONTHS_FOR_WEEKLY = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "O", "N", "D"];

            data.tradingsymbol = `${tokens[0]}${moment(new Date()).format("YY")}${MONTHS_FOR_WEEKLY[MONTHS.indexOf(tokens[3])]}${tokens[1].match(/\d+/)[0].padStart(2, 0)}${tokens[4]}${tokens[5]}`;
            // data.exchange = `${tokens[6]}`;
            data.pece = `${tokens[5]}`;
            data.strike = `${tokens[4]}`;
            data.scrip = `${tokens[0]}${moment(new Date()).format("YY")}${MONTHS_FOR_WEEKLY[MONTHS.indexOf(tokens[3])]}${tokens[1].replace(/\D/g, "")}`
        } else {
            //eg: NIFTY21APR14200PE (NIFTY APR 14200 PE NFO LABELS)
            if (tokens[1].match(/^\d/)) {
                data.tradingsymbol = `${tokens[0]}${tokens[1]}${tokens[2]}${tokens[3]}`;
            } else {
                data.tradingsymbol = `${tokens[0]}${moment(new Date()).format("YY")}${tokens[1]}${tokens[2]}${tokens[3]}`;
            }

            // data.exchange = `${tokens[4]}`;
            data.pece = `${tokens[3]}`;
            data.strike = `${tokens[2]}`;
            data.scrip = `${tokens[0]}${moment(new Date()).format("YY")}${tokens[1]}`;
        }
    }

    data.quantity = q > 0 ? q : q * -1;
    data.price = price;
    data.transaction_type = q > 0 ? 'BUY' : 'SELL';
    return data;
}
