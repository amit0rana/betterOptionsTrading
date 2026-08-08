// P&L totals: for the rows currently visible, and for the rows the user has ticked.

function updatePnl(forPositions = true) {
    var allVisibleRows;
    var pnlCol;
    if (forPositions) {
        allVisibleRows = jQ(allDOMPaths.PathForPositions + ":visible");
        pnlCol = 6;
    } else {
        pnlCol = 5;
        allVisibleRows = jQ(allDOMPaths.rowsFromHoldingsTable + ":visible");
    }

    debug('found visible rows: ' + allVisibleRows.length);

    var pnl = 0;

    var selection = [];
    allVisibleRows.each(function (rowIndex) {
        var v = jQ(jQ(this).find("td")[pnlCol]).text().split(",").join("");

        if (v == "") return;
        pnl += parseFloat(v);

        if (forPositions) {
            var pos = getPositionRowObject(this);
            // var instrument = jQ(jQ(this).find("td")[2]).text();
            var instrument = pos.instrument
            if (instrument == "") return;

            // var qty = parseFloat(jQ(jQ(this).find("td")[3]).text().split(",").join(""));
            // var price = parseFloat(jQ(jQ(this).find("td")[4]).text().split(",").join(""));
            // var product = jQ(jQ(this).find("td")[1]).text();
            var data = getMarginCalculationData(instrument, pos.exchange, pos.product, pos.quantity, pos.avgPrice);
            if (data != null) {
                selection.push(data);
            }
        }
    });

    if (allVisibleRows.length > 0) {
        calculateMargin(selection).then(margin => {
            updatePositionInfo(allVisibleRows.length, pnl, margin);
        });
    }
}

function onSuCheckboxSelection() {
    tEv("kite", "positionscheckbox", "click", "");
    debug('select su-checkbox changed');
    var selectedRows = jQ(`${allDOMPaths.PathForPositions}.selected`);

    var pnl = 0;
    var realPnl = 0;
    var maxPnl = 0;
    var peQ = 0;
    var ceQ = 0;
    var points = 0;
    var selection = [];
    debug(`su- selected rows: ${selectedRows.length}`);
    selectedRows.each(function (rowIndex) {
        var positionRow = getPositionRowObject(this);
        if (positionRow.instrument == "") return;

        realPnl = realPnl - (positionRow.quantity * (positionRow.avgPrice - positionRow.ltp));

        // var v = jQ(jQ(this).find("td")[6]).text().split(",").join("");


        pnl += parseFloat(positionRow.pnl);

        // var instrument = jQ(jQ(this).find("td")[2]).text();
        // debug('here' + instrument);
        if (positionRow.exchange.trim().endsWith('NSE') || positionRow.exchange.trim().endsWith('BSE')) {
            return;
        }
        // var q = parseFloat(jQ(jQ(this).find("td")[3]).text().split(",").join(""));
        if (positionRow.pece == 'CE') {
            ceQ = ceQ + positionRow.quantity;
        } else if (positionRow.pece == 'PE') {
            peQ = peQ + positionRow.quantity;
        }

        // var avgPrice = parseFloat(jQ(jQ(this).find("td")[4]).text().split(",").join(""));
        var avgPrice = positionRow.avgPrice;
        // debug('a')
        // debug(positionRow.avgPrice)
        // debug('b')
        // debug(avgPrice)

        var value = positionRow.quantity * avgPrice;
        maxPnl = maxPnl - value;

        if (positionRow.quantity > 0) {
            points = points + avgPrice;
        } else {
            points = points - avgPrice;
        }

        // var product = jQ(jQ(this).find("td")[1]).text();
        var data = getMarginCalculationData(positionRow.instrument, positionRow.exchange, positionRow.product, positionRow.quantity, positionRow.avgPrice);
        if (data != null) {
            selection.push(data);
        }
    });

    var mTag = jQ("section[random-att='betterKite']");
    debug(`found section ${mTag.length}`);
    if (mTag.length > 0) {
        mTag.remove();
    }

    if (selectedRows.length > 0) {
        calculateMargin(selection).then(margin => {
            if (selectedRows.length > 0) {
                var t = ceQ + "CE & " + peQ + "PE";

                var printText = `<section class="table-wrapper" id="betterKiteSectionId" random-att='betterKite'>
                    <header class="row data-table-header"><h3 class="page-title small">betterKite</h3></header>
                    <div>
                        <div class="data-table fold-header">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Using P&L shown by Zerodha</th>
                                        <th>Using P&L calculated based on actual quantity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colspan="2">
                                            ${t} (Points: ${formatter.format(points)})
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>${createPnlText(pnl, maxPnl, margin)}</td>
                                        <td>${createPnlText(realPnl, maxPnl, margin)}</td>
                                    </tr>
                                </tbody>
                                <tfoot></tfoot>
                            </table>
                        </div>
                    </div>
                </section>`;
                //jQ(jQ("div.positions > section.open-positions.table-wrapper > div > div > table > tfoot")[0]).append(`<tr random-att='marginsave'><td colspan='9'><span  class='pnl randomClassToHelpHide'> ${t} (Points: ${formatter.format(points)})</span></td></tr>`);
                //jQ(jQ("div.positions > section.open-positions.table-wrapper > div > div > table > tfoot")[0]).append(`<tr random-att='marginsave'><td colspan='4'>Using P&L shown by Zerodha: ${createPnlText(pnl, maxPnl, margin)}</td><td colspan='4'>Using P&L calculated based on actual quantity: ${createPnlText(realPnl, maxPnl, margin)}</td></tr>`);
                jQ("section#betterKiteSectionId").remove();
                jQ(jQ("div.positions > section.open-positions.table-wrapper")[0]).after(printText);
            }
        });
    }

}

function createPnlText(pnl, maxPnl, margin) {
    var pnlText = "<br>";
    if (pnl > 0) {
        pnlText = "<span random-att='temppnl' class='text-green open pnl randomClassToHelpHide'>P&L: " + formatter.format(pnl);
        // pnlText = "<span random-att='temppnl' class='text-green open pnl randomClassToHelpHide'>P&L: " + formatter.format(pnl) + " Real: " + formatter.format(realPnl);
    } else {
        pnlText = "<span random-att='temppnl' class='text-red open pnl randomClassToHelpHide'>P&L: " + formatter.format(pnl);
        // pnlText = "<span random-att='temppnl' class='text-red open pnl randomClassToHelpHide'>P&L: " + formatter.format(pnl) + " Real: " + formatter.format(realPnl);

    }
    pnlText += "<br><span class='text-label randomClassToHelpHide'>Prem Taken: " + formatter.format(maxPnl) + " / " + (maxPnl / margin * 100).toFixed(2) + "%</span>";
    pnlText += "<br><span class='text-label randomClassToHelpHide'>Current Prem: " + formatter.format(maxPnl - pnl) + " </span>";
    if (margin >= 0) {
        pnlText += "<br><span class='text-label randomClassToHelpHide'>Margin: " + formatter.format(margin) + "</span>";
        pnlText += "<br><span class='text-label randomClassToHelpHide'>Current ROI: " + (pnl / margin * 100).toFixed(2) + "% </span>";
    }
    pnlText += "</span>";

    return pnlText;
}
