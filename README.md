# betterKite

Very simple "userscript" which adds following features to kite.zerodha.com ui

#### https://kite.zerodha.com/positions page
* Strategies are grouped in 3 ways.
  * (1) Strategies are auto grouped by script name. So all INFY strategies will be auto grouped under 'INFY'
  * (2) Strategies are auto grouped by expiry.
  * (3) Manual groups can be created by modifying 'positions array'.
* Once you select a strategy from the dropdown, only relevant positions will be shown.
![strategies](https://dl.dropbox.com/s/414mh3oqvx4ppf2/strategies.png?dl=0)

* ![strategies2](https://dl.dropbox.com/s/qjyok361dk9jo6c/strategies2.png?dl=0)
* You can also see strategy's P&L on the right side of dropdown.
* Tag your reference trades and martingales for easier identification. You can give custom name and color for easy identification
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

Follow below mentioned steps
* Install [Tempermonkey](https://www.tampermonkey.net/) for your browser (works on all browsers). [Chrome extension link](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
* Follow steps as show in the image to create a new script.
  * Open [this link](https://github.com/amit0rana/betterKite/raw/master/mySmallCasesOnKite.user.js) in a new tab. <https://github.com/amit0rana/betterKite/raw/master/mySmallCasesOnKite.user.js>
  * Tampermonkey will automatically identify the file as userscript and give you option to install.
  * You can verify the installation by click on Tampermonkey icon (next to address bar) and then go to 'Dashboard'. You should see 'mySmallCasesOnKite' installed.
  * Now just go to <https://kite.zerodha.com> and start using.

# Steps for Holdings
* Format of the list
```
{
  "Dividend" : ["SJVN","VEDL"],
  "Wealth Creators" : ["WHIRLPOOL","ICICIBANK",],
  "Sell On profit" : ["LUMAXIND","RADICO"]
}
```
* Group your holdings as shown in the example above.
* Click on tempermonkey icon -> Set Holidings, and then copy paste your json object.
![Video on How to update holdings](https://dl.dropbox.com/s/xogmrtxr5mrl072/SetHoldings.gif?dl=0)
* Once you save, page should auto refresh and you should see a red (1) badge next to Tempermonkey icon as shown in the image.
* Go to holdings section and click on 'Holdings(xx)' text.
![Using Script](https://dl.dropbox.com/s/blxec4q9nop1jmo/usageScript.gif?dl=0)
location of dropdown has changed. refer to image below:
![header](https://dl.dropbox.com/s/zvefkb2pis0ygq4/headerWithTagSelector.png?dl=0)

# Steps for custom Positions. You don't need below step if auto grouping by script name works for you
* Format of the list
```
{
 "BajajFinanceStraddle" : ["12304386","12311298"],
 "BataRatioSpread": ["12431106"]
}
```
* Create a JSON object as shown above. Left side is the 'stragety name' that will show in dropdown and right side is list of trades.
* See below on how to get position ids. The image also shows how to quickly check P&L
![copypaste](https://dl.dropbox.com/s/nkfaa2mrtfu8jvz/copyPastingPosId.gif?dl=0)
* ![position](https://dl.dropbox.com/s/58bv2iz95c9yryv/setPositionsOption.png?dl=0)
* ![rtmt](https://dl.dropbox.com/s/7qfdx8efdtzb015/setRTMTOption.png?dl=0)
* Go to Positions section and click on 'Positions' text.
* if you want to tag your reference trades and martingales separately then you can use below array.
```
{
    "RF.blue" : ["12304386","10397698"],
    "MT.red" : ["10397698"]
}
```
* ![addingRT](https://dl.dropbox.com/s/2izfa0y5u6ny22v/addingReferenceTrade.gif?dl=0)

TODOs
* Instructions for [Violentmonkey](https://openuserjs.org/about/Violentmonkey-for-Chrome)
* Bug. selection doesn't reflect on order screen in one situation.
