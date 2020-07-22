# betterKite

Very simple "userscript" which adds following features to kite.zerodha.com ui

#### https://kite.zerodha.com/positions page
* There are two ways to group strategies
** (1) Strategies are auto grouped by script name. So all INFY strategies will be auto grouped under 'INFY'
** (2) Manual groups can be created by modifying 'positions array' in the code.
* Once you select a strategy only relevant positions will be shown.
![strategies](https://dl.dropbox.com/s/414mh3oqvx4ppf2/strategies.png?dl=0)
* You can also see strategy's P&L on the right side of dropdown.
* Tag your reference trades for easier identification. You can give custom name and color for easy identification
![referenceTags](https://dl.dropbox.com/s/i18bklcdebtagia/referenceTags.png?dl=0)
* Quickly see total P&L of 'selected' positions.
![addPositions](https://dl.dropbox.com/s/mvavj8njmt2xvtp/pnlAddition.png?dl=0)

#### https://kite.zerodha.com/holdings page
* Group your holdings in 'categories' or 'tags'
* Small tag is shown next to your stock name indicating which category it belongs to.
![tags](https://dl.dropbox.com/s/ygk9id8c21b3mi8/HoldingsWithTags.png?dl=0)
* Filter stocks based on category. Once filter is applied only stocks in that category will be shown in 'watchlist' or 'orders' or 'holdings' screen
![header](https://dl.dropbox.com/s/zvefkb2pis0ygq4/headerWithTagSelector.png?dl=0)
* One stock can be in multiple categories.
* When you click on a stock in watchlist, if same stock is present in 'holdings', screen will be scrolled automatically bringing the stock in the middle and it will be highlighted for a few seconds.



# How to use (below instruction is for holdings page, similar thing works on positions page as well)
* Once installation is done, go to 'holdings' page and click on 'Holdings (..)' text.
* Once you click you will see a dropdown (select box) next to kite logo on the header row. Between the logo and 'Dashboard' link.
* you can now filter 'orders' screen and 'holdings' screen based on your selection. Watchlist will also be filtered. Also when you click on watchlist row, if same stock is present in your holdings list, it will be highlighted and brought to focus.

# Installation

(Note: Screenshots below are old)

For now installation of script is intentionally kept manual.
* Install [Tempermonkey](https://www.tampermonkey.net/) for your browser. [Chrome extension link](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
* Follow steps as show in the image to create a new script.
* ![Create a new script](https://dl.dropbox.com/s/k13sxt4wl6kfb4w/createNewScript.gif?dl=0)
* Copy and paste content of the script from [this file](https://github.com/amit0rana/betterKite/raw/master/mySmallCasesOnKite.user.js)
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
* Add your categories and stocks in the 'holdings' array.
![Updating](https://dl.dropbox.com/s/olxz1lubi7aeebp/initialSetup.gif?dl=0)
* After saving, go to your kite screen and refresh. After refreshing you should see a red (1) badge next to Tempermonkey icon as shown in the image.
* Go to holdings section and click on 'Holdings(xx)' text.
![Using Script](https://dl.dropbox.com/s/blxec4q9nop1jmo/usageScript.gif?dl=0)
location of dropdown has changed. refer to image below:
![header](https://dl.dropbox.com/s/zvefkb2pis0ygq4/headerWithTagSelector.png?dl=0)

# Steps for custom Positions. You don't need below step if auto grouping by script name works for you
* Format of the list
```
var positions = {
 "BajajFinanceStraddle" : ["12304386","12311298","12313858","12314370"],
 "BataRatioSpread": ["12431106"]
};
```
* Add your position ids and strategies in the 'positions' variable.
* See below on how to get position ids. The image also shows how to quickly check P&L
![copypaste](https://dl.dropbox.com/s/nkfaa2mrtfu8jvz/copyPastingPosId.gif?dl=0)
* Go to Positions section and click on 'Positions' text.
* if you want to tag your reference trades separately then you can use below array.
```
var referenceTrades = {
    "RF.blue" : ["12304386","10397698","20726530","11107330"],
    "MT.red" : []
};
```

TODOs
* Save tags/categories instead of using array
* Instructions for [Violentmonkey](https://openuserjs.org/about/Violentmonkey-for-Chrome)
* Bug. selection doesn't reflect on order screen in one situation.
