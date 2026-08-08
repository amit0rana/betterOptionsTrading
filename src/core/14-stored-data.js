// Holdings categories, position strategies and reference-trade tags, persisted through
// GM_setValue, plus the Tampermonkey menu commands that edit them.

const holdings = initHoldings();

const positions = initPositions();

const referenceTrades = initReferenceTrades();

function initHoldings() {
    //Note: if script name as & then write it as &amp;
    //Note: Zerodha may either display NSE stock or BSE stock so better to mention both for the stock.

    var defaultHoldings = {
        "Dividend": ["SJVN", "VEDL"],
        "Wealth Creators": ["WHIRLPOOL", "ICICIBANK",],
        "Sell On profit": ["LUMAXIND", "RADICO"]
    };
    var holdings = GM_getValue(GM_HOLDINGS_NAME, defaultHoldings);

    if (PRO_MODE) {
        GM_registerMenuCommand("Set Holdings", function () {
            var h = GM_getValue(GM_HOLDINGS_NAME, defaultHoldings);
            h = prompt("Provide Holdings object. Eg: {'groupName 1':['INFY','RELIANCE'],'groupName 2':['M&amp;M','ICICIBANK']}", JSON.stringify(h));
            if (h == null) return;
            try {
                holdings = JSON.parse(h);
                GM_setValue(GM_HOLDINGS_NAME, holdings);
            }
            catch (err) {
                alert("There was error in your input");
                debug(err);
            }

            window.location.reload();
        }, "h");
    }

    return holdings;
}

function initPositions() {
    var defaultPositions = {
    };
    var positions = GM_getValue(GMPositionsName, defaultPositions);

    if (PRO_MODE) {
        GM_registerMenuCommand("Option Strategies", function () {
            var p = GM_getValue(GMPositionsName, defaultPositions);
            p = prompt("Provide Positions object. Eg: {'strategy 1':['12304386','12311298'],'strategy 2':['12431106']}", JSON.stringify(p));
            if (p == null) return;
            try {
                positions = JSON.parse(p);
                GM_setValue(GMPositionsName, positions);
            }
            catch (err) {
                alert("There was error in your input");
            }

            window.location.reload();
        }, "p");
    }
    GM_registerMenuCommand("Add to or Create new Strategy", function () {
        var selectedPositions = jQ(allDOMPaths.PathForPositions).filter(':has(:checkbox:checked)');
        info("selected ps " + selectedPositions.length);

        var storedStrategies = GM_getValue(GMPositionsName, defaultPositions);
        var keys = [];
        for (var k in storedStrategies) {
            keys.push(k);
        }

        var msg = '';
        if (selectedPositions.length <= 0) {
            alert('Please select atleast one position to be added to a strategy');
            return;
            //msg = 'You have selected '+selectedPositions.length+' positions. Please provide name of the strategy. \n\nNOTE: (1) If strategy name exists then position will be added to the group. \n(2) If this is new name then new strategy will be created.';
        }

        msg = 'Please tell your strategy name:\n\nNOTE: (1) If there is an existing strategy with same name then we will add selected position to same strategy. \n(2)If there is no strategy with this name then we will create a new one.\n\nYour existing strategies are: ' + keys.toString();

        var strategyName = prompt(msg);
        if (strategyName == null) return;
        strategyName = strategyName.toUpperCase();

        var confirmAdd;
        if (keys.includes(strategyName)) {
            confirmAdd = confirm("This message is to confirm that there was no typo in strategy name.\n\nYou are adding to an **EXISTING** strategy.");
        } else {
            confirmAdd = confirm("This message is to confirm that there was no typo in strategy name.\n\nYou are adding to a **NEW** strategy.");
        }
        if (confirmAdd == false) return;

        var positionArray = [];
        selectedPositions.each(function (rowIndex) {
            //var dataUidInTR = this.getAttribute(allDOMPaths.attrNameForInstrumentTR);

            var text = getSensibullZerodhaTradingSymbol(jQ(jQ(this).find('td')[2]).text());
            //return;

            //var text = dataUidInTR.split(".")[1];
            positionArray.push(text);
        });

        debug(JSON.stringify(storedStrategies));

        if (keys.includes(strategyName)) {
            storedStrategies[strategyName] = storedStrategies[strategyName].concat(positionArray);
        } else {
            storedStrategies[strategyName] = positionArray;
        }
        debug(JSON.stringify(storedStrategies));

        GM_setValue(GMPositionsName, storedStrategies);
        window.location.reload();
    }, "s");

    GM_registerMenuCommand("Delete A Strategy", function () {
        var storedStrategies = GM_getValue(GMPositionsName, defaultPositions);
        var keys = [];
        for (var k in storedStrategies) {
            keys.push(k);
        }

        var strategyToDelete = prompt("Please specify which strategy do you want to delete: " + keys.toString());
        if (strategyToDelete == null) return;
        strategyToDelete = strategyToDelete.toUpperCase();

        if (keys.includes(strategyToDelete)) {
            var confirmDelete = confirm("Deleting strategy " + strategyToDelete + "\n\nNOTE: Deletion does not have any impact on the Positions, this will simply delete strategy from the dropdown. Please confirm, name is correct?");
            if (confirmDelete == false) return;

            debug(JSON.stringify(storedStrategies));
            delete storedStrategies[strategyToDelete];
            debug(JSON.stringify(storedStrategies));
            GM_setValue(GMPositionsName, storedStrategies);

            window.location.reload();
        } else {
            alert('You do not have any custom strategy with this name. No action taken. Input you gave was: ' + strategyToDelete);
        }

    }, "d");

    return positions;
}

function initReferenceTrades() {
    var defaultRefTrades = {
        "RF.blue": ["12304386", "10397698"],
        "MT.red": ["11899650"]
    };
    var referenceTrades = GM_getValue(GMRefTradeName, defaultRefTrades);

    if (PRO_MODE) {
        GM_registerMenuCommand("Reference Trades & Martingales", function () {
            var rt = GM_getValue(GMRefTradeName, defaultRefTrades);
            rt = prompt("Provide trades object. Eg: {'RF.blue':['12304386','12311298'],'MT.red':['12431106']}", JSON.stringify(rt));
            if (rt == null) return;
            try {
                referenceTrades = JSON.parse(rt);
                GM_setValue(GMRefTradeName, referenceTrades);
            }
            catch (err) {
                alert("There was error in your input");
            }

            window.location.reload();
        }, "r");
    }

    return referenceTrades;
}
