// NOT PART OF THE BUILD -- this file is absent from build/manifest.json.
//
// The "funds help" feature adds a tooltip to each row of the Funds page explaining what
// that row means. It is documented in betterKite.md, but its only entry point was
// commented out (inside main(), on the history.pushState hook), so the code has not run
// for some time. It was moved here during the v5.08 cleanup rather than deleted.
//
// To re-enable: add this file to build/manifest.json and restore the call that used to
// live in main()'s pushState handler:
//
//     if (currentUrl.includes('funds')) {
//         waitForKeyElements(
//             "#app > div.container.wrapper > div.container-right > div > div.margins > div.row > div:nth-child(1) > div > table > tbody > tr:nth-child(1)",
//             showFundsHelp);
//     }
//
// Before doing so, check the selector and the row order still match the Funds page --
// helpText is positional, so a reordered table silently mislabels every row.

function showFundsHelp() {
    debug('showFundsHelp');

    var helpText = ["You can use this amount to place new trades. The available margin includes the benefit of pledging collateral, the premium received from shorting options, funds added during the day, the effect of realised profits & losses, and unrealised losses.",
        "You have used this amount towards trades during the day. The used margin can be negative if you have generated some funds by selling your holdings, closing F&O positions, or making intraday gains.",
        "This is the current cash balance in your account. If your available cash balance is negative, you will be charged interest.",
        "This is the cash available in your trading account at the beginning of the day.",
        "The funds you add to your trading account during the day reflect as the payin balance.",
        "This is a part of the amount blocked for your F&O trades. You can also check SPAN on our margin calculator. ",
        "This is the margin blocked when you sell securities (20% of the value of stocks sold) from your demat or T1 holdings. As per the peak margin norms, only 80% of credit from selling your holdings will be available for new trades. The funds blocked under this field will be available from the next trading day. The delivery margin also includes additional margin blocked if you have any F&O positions due for physical delivery. ",
        "This is a part of the amount blocked for your F&O trades. You can also check the exposure margin here.",
        "The total amount you have paid to purchase options. This value will be negative if you have received funds for shorting/writing options.",
        "This amount is made available for trading against Liquidbees ETFs or liquid mutual funds you have pledged.",
        "This amount is made available for trading against stocks/ETFs you have pledged.",
        "This is the sum total of liquid funds and equity collateral."];

    var allRows = jQ("#app > div.container.wrapper > div.container-right > div > div.margins > div.row > div:nth-child(1) > div > table > tbody > tr");
    debug(allRows.length);
    allRows.each(function (rowIndex) {
        var stock = jQ(this).attr('title', helpText[rowIndex]);
        debug(jQ(this));
        debug(stock);
        debug(helpText[rowIndex]);
    });

}
