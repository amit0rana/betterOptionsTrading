# betterKite

Very simple "userscript" which adds following features to kite.zerodha.com ui

* Group your holdings in 'categories'
* Only view stocks in a particular category
* See a small tag next to your stock name indicating which category does the stock belong to.
* When a specific category is selected, only stocks in that category is shown in watchlist

TODO
* Save tags/categories
* Proper presentation of tags
* Multiple tag support
* Instructions for [Violentmonkey](https://openuserjs.org/about/Violentmonkey-for-Chrome)

# Installation

For now installation of script is intentionally kept manual.
* Install [Tempermonkey](https://www.tampermonkey.net/) for your browser. [Chrome extension link](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
* ![Create a new script](https://dl.dropbox.com/s/k13sxt4wl6kfb4w/createNewScript.gif?dl=0)
* Copy and paste content of the script file from ...
* Create your categories, replace it in the script and save it.
* Format of the list
```
var holdings = {
  "Dividend" : ["SJVN","VEDL"],
  "Wealth Creators" : ["WHIRLPOOL","ICICIBANK",],
  "Sell On profit" : ["LUMAXIND","RADICO"]
};
```
* Search for <<< REPLACE >>> and replace it with your list.
