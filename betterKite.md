# betterKite

This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.

In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to [<https://unlicense.org>](https://unlicense.org)

Very simple "userscript" which adds several features to kite.zerodha.com ui (screenshots below)
* See P&L and current value 'including' pledged stocks
* Automatically create SL order, then 'trail' and 'save profit' by just one click.
* 'Smart Limit' Place LIMIT orders at best offer/bid price.
* See quantities in lots
* See real profit based on currently holding quantity
* See possible Nifty monthly and weekly range based on INDIA VIX
* See realised p&l for the day
* Avoid quantity freeze limitation, breaks bigger order into multiple orders
* Group positions under strategies
* For a strategy, check how much margin can be freed by taking hedge buy positions
* See P&L for each strategy
* See margin utilised for each position or for a strategy
* Mark trades as reference trade or martingale 
* See your ROI 
* Get explanation of various rows in funds page 
* Filter trades by expiry in sensibull pop-up 
* Auto group strategy by scrip and expiry 
* Auto filter Watch list for scrip in positions 
* Highlight position when you click on scrip in Watch list 
* Filter mis only, pe online or CE only positions
* For a strategy, see potentially how much margin can be released by buying hedge positions
![savemargin](https://dl.dropbox.com/s/aiacmoefjxdb35l/saveMargin.png?dl=0)
* Margin calculation is done by 2 methods. If you use 'baseket' method (this is default) then no further action needed but if youw ant to use 'Margin Calculator' method then you need to enable CORS. Choosing which method is available in settings. 
* Check this image on enabling CORS:
![corsusage](https://dl.dropbox.com/s/mbktrw9dkqu4wl0/corsToggle.png?dl=0)

------
Contributors
- Amit
- Yuva (@rbcdev)

------

# Installation

Follow below mentioned steps
* Install [Tempermonkey](https://www.tampermonkey.net/) for your browser (works on all browsers. Tested on Chrome, Vivaldi, Edge). [Chrome extension link](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
* Open [this link](https://github.com/sidonkar/betterOptionsTrading/raw/master/betterKite.user.js) in a new tab. Or copy paste <https://github.com/sidonkar/betterOptionsTrading/raw/master/betterKite.user.js>
* Tampermonkey will automatically identify the file as userscript and give you option to install. (sell image below)
* ![tampermonkey install](https://dl.dropbox.com/s/khs3itzctu13ayw/tampermonkeyInstall.png?dl=0)
* Click on 'Install' button.
* You can verify the installation by clicking on Tampermonkey icon (next to address bar) and then go to 'Dashboard'. You should see 'betterKite' installed. (see below)
* ![dashboard menu](https://dl.dropbox.com/s/dv1reqb84mz00bm/dashboardmenuoption.png?dl=0)
* ![dashboard sample](https://dl.dropbox.com/s/blv2j9t8e6iohkt/dashboardSample.png?dl=0)
* Now just go to <https://kite.zerodha.com> (refresh the page if its already open) and start using.
* Verify that your version should be more than v2.00. Click on Tempermonkey icon, you will see version in the 'Reset Data (WARNING) menu item.
* Below plugin is required only if you want to use Margin Calculator methods* Install CORS plugin for your browser.
  * Firefox: https://addons.mozilla.org/en-US/firefox/addon/access-control-allow-origin/
  * Edge: https://microsoftedge.microsoft.com/addons/detail/allow-cors-accesscontro/bhjepjpgngghppolkjdhckmnfphffdag?hl=en-GB
  * chrome: https://chrome.google.com/webstore/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf 

------
# https://kite.zerodha.com/positions page
* Enable 'Auto SL order' feature from settings. You will get option to auto create SL order when placing a new order. Once SL order is placed, in pending order section you will get button to 'trali' or 'save profit'. Trail simply increases or decreases trigger price for 'trail points'. Save profit is used when market has moved in your favor and you want to protect profit, in this case trigger price of SL trigger pending order is moved to make atleast 'save profit points'.
![OrderScreen](https://dl.dropbox.com/s/x9kaheg26hdsuc0/sl_create_sl_order.png?dl=0)
![pendingORder](https://dl.dropbox.com/s/11vrrzch6bi9ysd/sl_trail_save_profit_btn.png?dl=0)
![settings](https://dl.dropbox.com/s/sbuqqclaerljpva/sl_order_settings.png?dl=0)
![help1](https://dl.dropbox.com/s/u83bs5ec9gdl2t8/sl_save_profit_help.png?dl=0)
![help2](https://dl.dropbox.com/s/ot3rjkhnvid0fee/sl_trail_help.png?dl=0)
* 'Smart Limit' Finds the best offer/bid price then ether adds or subtracts 0.05p (depending on buy or sell order) and places a LIMIT order.
![SmartLimit](https://dl.dropbox.com/s/b02kq0vjxscw3p2/smartLimit.png?dl=0)
* You can easily execute/exit quantities higher than freeze quantity. To enable quantity freeze go to settings. Once enabled, checkbox will show below 'Sell' or 'Buy' button, enable it and place orders
![QuantityFeeze](https://dl.dropbox.com/s/h55i2gkk6gj5y6j/qtyFreeze.png?dl=0)
![QuantityFeeze1](https://dl.dropbox.com/s/n4jd45bpzl6dh1p/qtySetings.png?dl=0)
![QuantityFeeze2](https://dl.dropbox.com/s/sc4xd7wsofz9zdp/qtySettings-2.png?dl=0)
* Click on quanity to see it in lots, click again to remove it ![lots](https://dl.dropbox.com/s/9p7sxvuu2kguqly/seeQuantityInLots.png?dl=0)
* Click on any of the pnl to enable/disable this feature ![pnl](https://dl.dropbox.com/s/7oql0zgzihvjsw4/seeRealProfit.png?dl=0)
* Step 1: Add Nifty 50 to Pin 1, click on Nifty value to see monthly range, click on change value to see weekly range 
![Monthly](https://dl.dropbox.com/s/vr1x6b8llju46ng/monthlyRangeVix.png?dl=0)
![Weekly](https://dl.dropbox.com/s/l28p58dc2dr2w4u/WeeklyRangeVix.png?dl=0)
* Click on Total P&L to start seeting 'Realised P&L' ![realised](https://dl.dropbox.com/s/b6q7b6zn5jimkvd/realisedPnlForTheDay.png?dl=0)
* Strategies are grouped in 3 ways.
  * (1) Strategies are auto grouped by script name. So all INFY strategies will be auto grouped under 'INFY'
  * (2) Strategies are auto grouped by expiry.
  * (3) Manual / custom strategies.
* Once you select a strategy from the dropdown, only relevant positions will be shown.
![strategies](https://dl.dropbox.com/s/414mh3oqvx4ppf2/strategies.png?dl=0)

* ![strategies2](https://dl.dropbox.com/s/qjyok361dk9jo6c/strategies2.png?dl=0)
* You can also see strategy's P&L on the right side of dropdown.
* You can see MARGIN required for the 'group of positions' along with P&L on top.
* You can also see margin required for individual position at the bottom of the table.
* ![marginUsage](https://dl.dropbox.com/s/8cii9hr27ctqebc/marginCalculationUsage.png?dl=0)
* Tag your reference trades and martingales for easier identification. You can give custom name and color for easy identification
![referenceTags](https://dl.dropbox.com/s/i18bklcdebtagia/referenceTags.png?dl=0)
* Quickly see total P&L of 'selected' positions.
![addPositions](https://dl.dropbox.com/s/mvavj8njmt2xvtp/pnlAddition.png?dl=0)
* "Filter" button is added next to 1,2,3,4,5 watchlist. You can use this to filter your watchlist.
![watchlistFilter](https://dl.dropbox.com/s/5gf2paw5pk9you6/watchlistFilter.png?dl=0)
* Filter positions within the sensibull interface.
![zerodaSensibullAnalyze](https://dl.dropbox.com/s/rqzpo214j961x1u/zerodaSensibullAnalyze.png?dl=0)
![zerodhaSensibullFilters](https://dl.dropbox.com/s/1s91foyuaewkfed/zerodhaSensibullFilters.png?dl=0)

------
# https://kite.zerodha.com/holdings page
* See P&L and current value 'including' pledged stocks
![pledged](https://dl.dropbox.com/s/mnhx9efdjpo5d2m/pledgedPnl.png?dl=0)
* Group your holdings in 'categories' or 'tags'
* Small tag is shown next to your stock name indicating which category it belongs to.
![tags](https://dl.dropbox.com/s/ygk9id8c21b3mi8/HoldingsWithTags.png?dl=0)
* Filter stocks based on category. Once filter is applied only stocks in that category will be shown in 'watchlist' or 'orders' or 'holdings' screen
![header](https://dl.dropbox.com/s/zvefkb2pis0ygq4/headerWithTagSelector.png?dl=0)
* One stock can be in multiple categories.
* When you click on a stock in watchlist, if same stock is present in 'holdings', screen will be scrolled automatically bringing the stock in the middle and it will be highlighted for a few seconds.

------
# [Click on this link to learn how to use the tool to copy orders from one zerodha account to another.](https://github.com/amit0rana/betterOptionsTrading/blob/master/betterKiteCopyOrders.md)

------
# https://console.zerodha.com/reports/pnl page
Introduces a convenence link to see "current month's" F&O P&L
![usage](https://dl.dropbox.com/s/vhrh6qqf775kg9y/foThisMonth.png?dl=0)

------
# https://kite.zerodha.com/funds page
Introduced help text on each row explaining what different rows mean.
![usage](https://dl.dropbox.com/s/cjo8y462vxpp7iw/usageFundsHelpText.png?dl=0)

------
# Installation

Follow below mentioned steps
* Install [Tempermonkey](https://www.tampermonkey.net/) for your browser (works on all browsers. Tested on Chrome, Vivaldi, Edge). [Chrome extension link](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
* Open [this link](https://github.com/sidonkar/betterOptionsTrading/raw/master/betterKite.user.js) in a new tab. Or copy paste <https://github.com/sidonkar/betterOptionsTrading/raw/master/betterKite.user.js>
* Tampermonkey will automatically identify the file as userscript and give you option to install. (sell image below)
* ![tampermonkey install](https://dl.dropbox.com/s/khs3itzctu13ayw/tampermonkeyInstall.png?dl=0)
* Click on 'Install' button.
* You can verify the installation by clicking on Tampermonkey icon (next to address bar) and then go to 'Dashboard'. You should see 'betterKite' installed. (see below)
* ![dashboard menu](https://dl.dropbox.com/s/dv1reqb84mz00bm/dashboardmenuoption.png?dl=0)
* ![dashboard sample](https://dl.dropbox.com/s/blv2j9t8e6iohkt/dashboardSample.png?dl=0)
* Now just go to <https://kite.zerodha.com> (refresh the page if its already open) and start using.
* Verify that your version should be more than v2.00. Click on Tempermonkey icon, you will see version in the 'Reset Data (WARNING) menu item.

------
# How to use
* Once installation is done, go to 'holdings' page and you will see a dropdown next to the logo listing all your groups.
  * On holding pages, dropdown will show all the groups under which you want to keep your holding stocks
  * On Positions page, dropdown will show all the strategies.
* you can now filter 'positions' screen and 'holdings' screen based on your selection. Watchlist will also be filtered. 
* When you click on watchlist row, if same stock is present in your holdings list, it will be highlighted and brought to focus.
* You can enabled/disable the filter dropdown by clicking on 'Position()' or 'Holdings()' heading.

------
# Steps for grouping your Holdings
* Refer to images below on how to use.
* Adding tag : Go to holdings section, click on + icon next to the stock name to add tags.
* Removing tag: Click on tag to remove it.
* Filtering stocks: Use the dropdown for filtering.
* ![how to use](https://dl.dropbox.com/s/tllta7nzcfl145a/holdingsHowToUse.gif?dl=0)
* ![add remove tags](https://dl.dropbox.com/s/nbjuxiu7yh9p51i/addingRemovingTags.gif?dl=0)

------
# Steps for marking trades as reference trades or base trade or martingales
* On the positions screen, each position has a + button, click on the button to add a tag. Important thing to keep in mind is the format of the tag.
* Tag should be formated as tagName.color for example: RT.red or BS.blue etc. 

------
# Steps for custom strategies.
* Please see the animated gif below
![addingDeletingStrategies](https://dl.dropbox.com/s/23mec9h3zd8iolw/AddingDeletingStrategy.gif?dl=0)
(if you can't see the image above see this video: https://dl.dropbox.com/s/iay4ld2ibdx3t91/AddingDeletingStrategy.mp4?dl=0)

------
TODOs
* Instructions for [Violentmonkey](https://openuserjs.org/about/Violentmonkey-for-Chrome)
* Filtering on order page
* Let users disable analytics

Note
This script tracks following events for analytics. No data is passed/stored/tracked. This only tells that action was taken.
* Script loaded
* Script enabled/disabled
* Watchlist filter used
* Tag added
* Tag deleted
* Filter applied

[//]: # (SEBI MANDATORY DISCLAIMER AS REQUIRED BY SEBI)

[//]: # (KIND ATTENTION TO ALL USERS)

[//]: # (Disclaimer from Developers as per SEBI norms: Equity Investment are subject to 100%)
[//]: # (market risks. Refer your financial consultant advice before Investing. This code is)
[//]: # (only for Educational and Learning, Knowledge Purposes. Developers have no)
[//]: # (responsibility for your intended decision & financial losses. Keep calculated & always)
[//]: # (analyzed your cash osition and risk bearing capacity before following any advise.)
[//]: # (Stock market investments and using this script are VERY RISKY and using ths code, you )
[//]: # (agree that you understand the Market risks involved. Profits and Losses are part of Share market.)
[//]: # (Kindly understand and act wisely.)

[//]: # (Disclaimer/ disclosure)

[//]: # (👉This script does not provide any tips/recommendations/advice)
[//]: # (👉All features are only for education and learning purpose.)
[//]: # (👉Do Consult your financial advisor before taking trades or investment decisions)
[//]: # (👉Developers are not responsible for any financial losses)
[//]: # (👉Disclaimer/disclosure/terms and conditions applicable to all users of this script)

[//]: # (All the features are for education and learning purpose only👍)