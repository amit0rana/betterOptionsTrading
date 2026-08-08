// Every CSS selector the script uses against Kite's markup, in one place.
// When a Kite release breaks betterKite, this is almost always the file to fix.

const allDOMPaths = {
    positionRowTS: "td.instrument > a > span.tradingsymbol",
    // /html/body/div[1]/div[2]/div[2]/div/div/section/div[1]/div[3]/table/tbody/tr[1]
    // html body.app-wrapper.modal-open div#app.app.page-holdingsEq div.container.wrapper div.container-right div.page-content.holdingsEq div.holdings section.table-wrapper div#a3x9ticht9.data-table.holdings-table.fold-header.sticky.card-view div.table-wrapper table tbody tr
    // div.table-wrapper > table:nth-child(1) > tbody:nth-child(2) > tr:nth-child(1)
    rowsFromHoldingsTable: "div.holdings > section > div.holdings-table > div.table-content-wrapper > div.table-wrapper > table > tbody > tr",
    attrNameForInstrumentTR: "data-uid",
    tradingSymbol: "td.instrument > span.tradingsymbol",

    domPathWatchlistRow: "div.item > div.item-info-wrapper > div.item-info",
    // domPathWatchlistRow" "div.instruments > div > div.vddl-draggable.instrument",
    //domPathStockNameInWatchlistRow: "span.nice-name",
    domPathStockNameInWatchlistRow: "div.symbol > span.name",
    // div.marketwatch.marketwatch-wrap > div.items-wrapper > div.draggable-wrapper > div.group-wrapper() > div:nth-child(2) > div.items > div.item-wrapper.draggable-item()
    //div.item > div.item-info-wrapper > div.item-info = symbol-wrappe - div.symbol - span.name, price-wrapper
    
    domPathPendingOrdersTR: "div.pending-orders > div > div.table-wrapper > table > tbody > tr",
    domPathExecutedOrdersTR: "div.completed-orders > div > table > tbody > tr",
    domPathTradingSymbolInsideOrdersTR: "span.tradingsymbol > span",
    
    domPathMainInitiatorLabel: "h3.page-title.small > span",
    // domPathTabToChangeWatchlist: "ul.marketwatch-selector.list-flat > li",
    // domPathTabToChangeWatchlist: "div.marketwatch-selector.list-flat > a.item.selected
    domPathTabToChangeWatchlist: "div.marketwatch-selector.list-flat > a.item",
    PathForPositions: "div.positions > section.open-positions.table-wrapper > div > div > div.table-wrapper > table > tbody > tr",
    PathForBasketPositions: "div.basket-table > div > table > tbody > tr",
    domPathForPositionsDayHistory: "div.positions > section.day-positions.table-wrapper > div > div > div > table > tbody > tr",
    positionHeader: "header.row.data-table-header > h3",
    //sensibullRows: "#app > div > div > div > div > div > div > div:nth-child(1) > div:nth-child(2) > div > table > tbody > tr",
    sensibullRows: "tr.jss32.jss33",
    sensibullRowCheckbox: "th > div > span > span > input",
    sensibullScriptSelected: "#app > div > div > div > div > div > div > div:nth-child(1) > div:nth-child(1) > div > div",
    // domContextMenuButton: "span.context-menu-button",
    domContextMenuButton: "div.content > div.table-menu-content > div",
    watchlistSettingIcon: "div.marketwatch-selector.list-flat > div.settings > a.initial",
    // watchlistSettingDiv: "div.marketwatch-selector.list-flat > div.settings",
    watchlistSettingDiv: "a.open-marketwatch-selector.initial",
    domAddPositionTag: "td.open.instrument"
    // span.settings-button.icon.icon-settings
};
//sensibullScriptSelected: "#app > div > div > div > div > div > div > div:nth-child(1) > div:nth-child(1) > div > button > span.MuiButton-label"
//("#app > div > div > div > div > div > div > div.style__LeftContentWrapper-t0trse-21.kQiWSc > div.style__SearchableInstrumentWrapper-t0trse-10.duNZzV > div > button > span.MuiButton-label")

