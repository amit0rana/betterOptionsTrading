// Pure helpers with no Kite state: strike rounding, expiry/symbol parsing, date maths,
// query-string parsing, and waitForKeyElements (the SPA polling helper).
//
// These are the functions covered by test/pure-functions.test.js.

function closestStrike(a, b = 50) {
    var c1 = a - (a % b);
    var c2 = (a + b) - (a % b);
    if (a - c1 > c2 - a) {
        return c2;
    } else {
        return c1;
    }
}

function getExpiryText(fullText) {
    //debug('getExpiryText ' + fullText);
    var expiry = fullText.split(' ');
    if (expiry.length == 1) return "";
    var t = expiry[1];

    return t;
}

function getLastThursday(m, year) {

    debug(MONTHS.indexOf(m.toUpperCase()));
    var month = MONTHS.indexOf(m.toUpperCase()) + 1;

    var d = new Date();
    if (year) { d.setFullYear(year); }
    d.setDate(1); // Roll to the first day of ...
    d.setMonth(month || d.getMonth() + 1); // ... the next month.
    do { // Roll the days backwards until Monday.
        d.setDate(d.getDate() - 1);
    } while (d.getDay() !== 4);

    let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
    let mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(d);
    return da + mo;
}

function getSensibullZerodhaTradingSymbol(original) {
    //BANKNIFTY JUN 30000 PE NFO
    //BHARTIARTL JUN FUT NFO
    debug(`getSensibullZerodhaTradingSymbol ${original}`)
    var ts = original.split(" ");
    debug(`count ${ts.length}`)

    if (ts.length == 1) return original;

    if (ts[2] == 'FUT') {
        debug('FUT');
        return `${ts[0]} ${getLastThursday(ts[1])} ${ts[2]}`;
    } else if (ts[2] == "w") {
        debug('weekly');
        return `${ts[0]} ${ts[1].match(/\d+/)[0].padStart(2, 0)}${ts[3]} ${ts[4]} ${ts[5]}`;
    } else {
        debug('monthly');
        if (ts[1].match(/^\d/)) {
            return `${ts[0]} ${ts[1]} ${ts[2]} ${ts[3]}`;
        } else {
            return `${ts[0]} ${getLastThursday(ts[1])} ${ts[2]} ${ts[3]}`;
        }
    }
}

function isLastDay(weekDay) { //1 monday
    var tdy = new Date();
    var dt = new Date()
    // console.log("isLastDay " + tdy);
    dt.setDate(1)
    dt.setMonth(dt.getMonth() + 1)
    dt.setDate(dt.getDate() - 1);
    // console.log("start Date " + dt);

    while (dt.getDay() !== weekDay) {
        dt.setDate(dt.getDate() - 1);
        // console.log(dt.toDateString())
        // console.log( dt.toDateString() == tdy.toDateString())
    }

    return (dt.toDateString() === tdy.toDateString());
}

function queryStringToJSON(qs) {
    var pairs = qs.split('&');
    var result = {};
    pairs.forEach(function (p) {
        var pair = p.split('=');
        var key = pair[0];
        var value = decodeURIComponent(pair[1] || '');

        if (result[key]) {
            if (Object.prototype.toString.call(result[key]) === '[object Array]') {
                result[key].push(value);
            } else {
                result[key] = [result[key], value];
            }
        } else {
            result[key] = value;
        }
    });

    return JSON.parse(JSON.stringify(result));
}

// Polls for elements that Kite's SPA renders after page load, and runs a callback on
// each new match. Other variants worth comparing against if this ever needs replacing:
//   https://gitee.com/snpeilcode/wait-for-key-elements/blob/master/waitForKeyElements.js
//   https://github.com/CoeJoder/waitForKeyElements.js
function waitForKeyElements(
    selectorTxt,    /* Required: The jQuery selector string that
                        specifies the desired element(s).
                    */
    actionFunction, /* Required: The code to run when elements are
                        found. It is passed a jNode to the matched
                        element.
                    */
    bWaitOnce,      /* Optional: If false, will continue to scan for
                        new elements even after the first match is
                        found.
                    */
    iframeSelector  /* Optional: If set, identifies the iframe to
                        search.
                    */
) {
    var targetNodes, btargetsFound;

    if (typeof iframeSelector == "undefined")
        targetNodes = jQ(selectorTxt);
    else
        targetNodes = jQ(iframeSelector).contents()
            .find(selectorTxt);

    if (targetNodes && targetNodes.length > 0) {
        btargetsFound = true;
        /*--- Found target node(s).  Go through each and act if they
            are new.
        */
        targetNodes.each(function () {
            var jThis = jQ(this);
            var alreadyFound = jThis.data('alreadyFound') || false;

            if (!alreadyFound) {
                //--- Call the payload function.
                var cancelFound = actionFunction(jThis);
                if (cancelFound)
                    btargetsFound = false;
                else
                    jThis.data('alreadyFound', true);
            }
        });
    }
    else {
        btargetsFound = false;
    }

    //--- Get the timer-control variable for this selector.
    var controlObj = waitForKeyElements.controlObj || {};
    var controlKey = selectorTxt.replace(/[^\w]/g, "_");
    var timeControl = controlObj[controlKey];

    //--- Now set or clear the timer as appropriate.
    if (btargetsFound && bWaitOnce && timeControl) {
        //--- The only condition where we need to clear the timer.
        clearInterval(timeControl);
        delete controlObj[controlKey]
    }
    else {
        //--- Set a timer, if needed.
        if (!timeControl) {
            timeControl = setInterval(function () {
                waitForKeyElements(selectorTxt,
                    actionFunction,
                    bWaitOnce,
                    iframeSelector
                );
            },
                300
            );
            controlObj[controlKey] = timeControl;
        }
    }
    waitForKeyElements.controlObj = controlObj;
}
