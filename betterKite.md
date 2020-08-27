# betterKite

Very simple "userscript" which adds following features to kite.zerodha.com ui

# https://kite.zerodha.com/positions page
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
* "Filter" button is added next to 1,2,3,4,5 watchlist. You can use this to filter your watchlist.

# https://kite.zerodha.com/holdings page
* Group your holdings in 'categories' or 'tags'
* Small tag is shown next to your stock name indicating which category it belongs to.
![tags](https://dl.dropbox.com/s/ygk9id8c21b3mi8/HoldingsWithTags.png?dl=0)
* Filter stocks based on category. Once filter is applied only stocks in that category will be shown in 'watchlist' or 'orders' or 'holdings' screen
![header](https://dl.dropbox.com/s/zvefkb2pis0ygq4/headerWithTagSelector.png?dl=0)
* One stock can be in multiple categories.
* When you click on a stock in watchlist, if same stock is present in 'holdings', screen will be scrolled automatically bringing the stock in the middle and it will be highlighted for a few seconds.



# How to use
* Once installation is done, go to 'holdings' page and you will see a dropdown next to the logo listing all your groups.
  * On holding pages, dropdown will show all the groups under which you want to keep your holding stocks
  * On Positions page, dropdown will show all the strategies.
* you can now filter 'positions' screen and 'holdings' screen based on your selection. Watchlist will also be filtered. 
* When you click on watchlist row, if same stock is present in your holdings list, it will be highlighted and brought to focus.
* You can enabled/disable the filter dropdown by clicking on 'Position()' or 'Holdings()' heading.

# Installation

Follow below mentioned steps
* Install [Tempermonkey](https://www.tampermonkey.net/) for your browser (works on all browsers. Tested on Chrome, Vivaldi, Edge). [Chrome extension link](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
* Open [this link](https://github.com/amit0rana/betterKite/raw/master/betterKite.user.js) in a new tab. Or copy paste <https://github.com/amit0rana/betterKite/raw/master/betterKite.user.js>
* Tampermonkey will automatically identify the file as userscript and give you option to install. (sell image below)
* ![tampermonkey install](https://dl.dropbox.com/s/khs3itzctu13ayw/tampermonkeyInstall.png?dl=0)
* Click on 'Install' button.
* You can verify the installation by clicking on Tampermonkey icon (next to address bar) and then go to 'Dashboard'. You should see 'betterKite' installed. (see below)
* ![dashboard menu](https://dl.dropbox.com/s/dv1reqb84mz00bm/dashboardmenuoption.png?dl=0)
* ![dashboard sample](https://dl.dropbox.com/s/blv2j9t8e6iohkt/dashboardSample.png?dl=0)
* Now just go to <https://kite.zerodha.com> (refresh the page if its already open) and start using.
* Verify that your version should be more than v2.00. Click on Tempermonkey icon, you will see version in the 'Reset Data (WARNING) menu item.

# Steps for grouping your Holdings
* Refer to images below on how to use.
* Go to holdings section
* click on + icon next to the stock name to add tags, click on tag to remove it, use the dropdown for filtering.
* ![how to use](https://dl.dropbox.com/s/tllta7nzcfl145a/holdingsHowToUse.gif?dl=0)
* ![add remove tags](https://dl.dropbox.com/s/nbjuxiu7yh9p51i/addingRemovingTags.gif?dl=0)

# Steps for marking trades as reference trades or base trade or martingales
* Process is same as taging holdings, important thing to keep in mind is the format of the tag.
* Tag should be formated as tagName.color for example: RT.red or BS.blue etc. 

# Steps for custom Positions. You don't need below step if auto grouping by script name works for you
* Please see the animated gif below
![addingDeletingStrategies](https://dl.dropbox.com/s/23mec9h3zd8iolw/AddingDeletingStrategy.gif?dl=0)
(if you can't see the image above see this video: https://dl.dropbox.com/s/iay4ld2ibdx3t91/AddingDeletingStrategy.mp4?dl=0)

TODOs
* Instructions for [Violentmonkey](https://openuserjs.org/about/Violentmonkey-for-Chrome)
* Bug. selection doesn't reflect on order screen in one situation.
