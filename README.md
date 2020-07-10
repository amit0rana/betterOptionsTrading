# betterKite

Very simple "userscript" which adds following features to kite.zerodha.com ui

* Group your holdings in 'categories' or 'tags'
* See a small tag next to your stock name indicating which category does the stock belong to.
![tags](https://dl.dropbox.com/s/ygk9id8c21b3mi8/HoldingsWithTags.png?dl=0)
* When a specific category is selected, only stocks in that category is shown in 'watchlist' or 'orders' or 'holdings' screen
![header](https://dl.dropbox.com/s/zvefkb2pis0ygq4/headerWithTagSelector.png?dl=0)
* One stock can have multiple tags.
* When you click on a stock in watchlist, if same stock is present in 'holdings', screen will be scrolled bringing the stock in the middle and it will be highlighted for few seconds.


# How to use
* Once installation is done, go to 'holdings' page and click on 'Holdings (..)' text.
* Once you click you will see a dropdown (select box) next to kite logo on the header row. Between the logo and 'Dashboard' link.
* you can now filter 'orders' screen and 'holdings' screen based on your selection. Watchlist will also be filtered. Also when you click on watchlist row, if same stock is present in your holdings list, it will be highlighted and brought to focus.

TODO
* Save tags/categories instead of using array
* Instructions for [Violentmonkey](https://openuserjs.org/about/Violentmonkey-for-Chrome)
* Bug. selection doesn't reflect on order screen in one situation.

# Installation

(Note: Screenshots below are old)

For now installation of script is intentionally kept manual.
* Install [Tempermonkey](https://www.tampermonkey.net/) for your browser. [Chrome extension link](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
* Follow steps as show in the image to create a new script.
* ![Create a new script](https://dl.dropbox.com/s/k13sxt4wl6kfb4w/createNewScript.gif?dl=0)
* Copy and paste content of the script from [this file](https://raw.githubusercontent.com/amit0rana/betterKite/master/mySmallCasesOnKite.js)
* Create your categories, replace it in the script and save it.

# Steps for Holdings
* Format of the list
```
var holdings = {
  "Dividend" : ["SJVN","VEDL"],
  "Wealth Creators" : ["WHIRLPOOL","ICICIBANK",],
  "Sell On profit" : ["LUMAXIND","RADICO"]
};
```
* Search for <<< REPLACE HOLDINGS>>> and replace it with your list.
![Saving Script](https://dl.dropbox.com/s/geseihxqwzhmhe2/pasteAndSaveScript.gif?dl=0)
* After saving, go to your kite screen and refresh. After refreshing you should see a red (1) badge next to Tempermonkey icon as shown in the image.
* Go to holdings section and click on 'Holdings(xx)' text.
![Using Script](https://dl.dropbox.com/s/blxec4q9nop1jmo/usageScript.gif?dl=0)
location of dropdown has changed. refer to image below:
![header](https://dl.dropbox.com/s/zvefkb2pis0ygq4/headerWithTagSelector.png?dl=0)

# Steps for Positions
* Format of the list
```
var positions = {
 "BajajFinance" : ["12304386","12311298","12313858","12314370"],
 "Bata": ["12431106"]
};
```
* Search for <<< REPLACE POSITIONS>>> and replace it with your list.
* Go to Positions section and click on 'Positions' text.
