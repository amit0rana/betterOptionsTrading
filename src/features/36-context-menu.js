// Adds a betterKite entry to Kite's row context menu.

var _currentContextMenuRow;
waitForKeyElements(allDOMPaths.domContextMenuButton, saveContextMenuRow);
//to capture click on context menu
/**
 *{
  "variety": "regular",
  "exchange": "NFO",
  "tradingsymbol": "NIFTY25FEB23800CE",
  "transaction_type": "SELL",
  "order_type": "MARKET",
  "quantity": "75",
  "price": "0",
  "product": "NRML",
  "validity": "DAY",
  "disclosed_quantity": "0",
  "trigger_price": "0",
  "squareoff": "0",
  "stoploss": "0",
  "trailing_stoploss": "0",
  "user_id": "TY2691",
  "": ""
}
 *
 */
function saveContextMenuRow() {
    debug('saveContextMenuRow');
    
    jQ(allDOMPaths.domContextMenuButton).append('<li class="addon-menu separator"><ul class="list-flat"><li><a href="javascript:void(0)" class="icon icon-console"><span class="shift-span">Shift<span class="text-lightest"> / betterKite</span></span></a></li></ul></li>');
    // jQ(document).on('click', "span.shift-span", function() {processShift();});
    jQ('.shift-span').click(function(e) {
        e.preventDefault();
        _currentContextMenuRow = jQ(allDOMPaths.domContextMenuButton).closest('tr');
        debug(getPositionRowObject(_currentContextMenuRow));
    });

    

}


/** Runs `onChange` whenever the text inside `target` changes -- Kite rewrites these
 *  margin figures in place rather than replacing the element. */