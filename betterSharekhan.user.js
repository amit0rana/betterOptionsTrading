// ==UserScript==
// @name         betterSharekhan
// @namespace    https://github.com/amit0rana/betterSharekhan
// @version      0.03
// @description  Introduces small features on top of newtrade.sharekhan.com
// @author       Amit
// @match        https://newtrade.sharekhan.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @require      https://raw.githubusercontent.com/amit0rana/betterOptionsTrading/master/betterCommon.js
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js
// @require      https://raw.githubusercontent.com/amit0rana/MonkeyConfig/master/monkeyconfig.js
// @require      https://cdn.jsdelivr.net/npm/js-cookie@rc/dist/js.cookie.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/axios/0.21.1/axios.min.js
// @require      https://raw.githubusercontent.com/kawanet/qs-lite/master/dist/qs-lite.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.27.0/moment.min.js
// @downloadURL  https://github.com/amit0rana/betterOptionsTrading/raw/master/betterSharekhan.user.js
// @updateURL    https://github.com/amit0rana/betterOptionsTrading/raw/master/betterSharekhan.meta.js
// ==/UserScript==

var context=window,options="{    anonymizeIp: true,    colorDepth: true,    characterSet: true,    screenSize: true,    language: true}";const hhistory=context.history,doc=document,nav=navigator||{},storage=localStorage,encode=encodeURIComponent,pushState=hhistory.pushState,typeException="exception",generateId=()=>Math.random().toString(36),getId=()=>(storage.cid||(storage.cid=generateId()),storage.cid),serialize=e=>{var t=[];for(var o in e)e.hasOwnProperty(o)&&void 0!==e[o]&&t.push(encode(o)+"="+encode(e[o]));return t.join("&")},track=(e,t,o,n,i,a,r)=>{const c="https://www.google-analytics.com/collect",s=serialize({v:"1",ds:"web",aip:options.anonymizeIp?1:void 0,tid:"UA-176741575-1",cid:getId(),t:e||"pageview",sd:options.colorDepth&&screen.colorDepth?`${screen.colorDepth}-bits`:void 0,dr:doc.referrer||void 0,dt:doc.title,dl:doc.location.origin+doc.location.pathname+doc.location.search,ul:options.language?(nav.language||"").toLowerCase():void 0,de:options.characterSet?doc.characterSet:void 0,sr:options.screenSize?`${(context.screen||{}).width}x${(context.screen||{}).height}`:void 0,vp:options.screenSize&&context.visualViewport?`${(context.visualViewport||{}).width}x${(context.visualViewport||{}).height}`:void 0,ec:t||void 0,ea:o||void 0,el:n||void 0,ev:i||void 0,exd:a||void 0,exf:void 0!==r&&!1==!!r?0:void 0});if(nav.sendBeacon)nav.sendBeacon(c,s);else{var d=new XMLHttpRequest;d.open("POST",c,!0),d.send(s)}},tEv=(e,t,o,n)=>track("event",e,t,o,n),tEx=(e,t)=>track(typeException,null,null,null,null,e,t);hhistory.pushState=function(e){return"function"==typeof history.onpushstate&&hhistory.onpushstate({state:e}),setTimeout(track,options.delay||10),pushState.apply(hhistory,arguments)},track(),context.ma={tEv:tEv,tEx:tEx};

window.jQ=jQuery.noConflict(true);
const VERSION = "v0.03";
const GMPositionsName = "BK_POSITIONS";
const D_LEVEL = D_LEVEL_INFO;

const allDOMPaths = {
    //document.querySelector("#sort > tbody > tr:nth-child(2)")
    PathForPositions : "#sort > tbody > tr"
};

const positions = initPositions();

//main();

function initPositions() {
    var defaultPositions = {
    };
    var positions = GM_getValue(GMPositionsName,defaultPositions);

    GM_registerMenuCommand("Add to or Create new Strategy", function() {
        var selectedPositions = jQ(allDOMPaths.PathForPositions).filter(':has(:checkbox:checked)');
        info("selected ps "+ selectedPositions.length);

        var storedStrategies = GM_getValue(GMPositionsName,defaultPositions);
        var keys = [];
        for (var k in storedStrategies) {
            keys.push(k);
        }

        var msg = '';
        if (selectedPositions.length <= 0) {
            alert('Please select atleast one position to be added to a strategy');
            return;
            //msg = 'You have selected '+selectedPositions.length+' positions. Please provide name of the strategy. \n\nNOTE: (1) If strategy name exists then position will be added to the group. \n(2) If this is new name then new strategy will be created.';
        }

        msg = 'Please tell your strategy name:\n\nNOTE: (1) If there is an existing strategy with same name then we will add selected position to same strategy. \n(2)If there is no strategy with this name then we will create a new one.\n\nYour existing strategies are: '+keys.toString();

        var strategyName = prompt(msg);
        if (strategyName == null) return;
        strategyName = strategyName.toUpperCase();

        if(keys.includes(strategyName)) {
            var confirmAdd = confirm("This message is to confirm that there was no typo in strategy name.\n\nYou are adding to an **EXISTING** strategy.");
            if (confirmAdd == false) return;
        } else {
            var confirmAdd = confirm("This message is to confirm that there was no typo in strategy name.\n\nYou are adding to a **NEW** strategy.");
            if (confirmAdd == false) return;
        }

        var positionArray = [];
        selectedPositions.each(function(rowIndex) {

            var span = jQ(this).find("td:nth-child(2) > span");
            var params = JSON.parse(jQ(span).attr('params'));
            debug(params);
            var text = params.detail.contract;
            positionArray.push(text);
        });

        debug(JSON.stringify(storedStrategies));

        if(keys.includes(strategyName)) {
            storedStrategies[strategyName] = storedStrategies[strategyName].concat(positionArray);
        } else {
            storedStrategies[strategyName] = positionArray;
        }
        debug(JSON.stringify(storedStrategies));

        GM_setValue(GMPositionsName,storedStrategies);
        window.location.reload();
    }, "s");

    GM_registerMenuCommand("Delete A Strategy", function() {
        var storedStrategies = GM_getValue(GMPositionsName,defaultPositions);
        var keys = [];
        for (var k in storedStrategies) {
            keys.push(k);
        }

        var strategyToDelete = prompt("Please specify which strategy do you want to delete: " + keys.toString());
        if (strategyToDelete == null) return;
        strategyToDelete = strategyToDelete.toUpperCase();

        if(keys.includes(strategyToDelete)) {
            var confirmDelete = confirm("Deleting strategy " + strategyToDelete + "\n\nNOTE: Deletion does not have any impact on the Positions, this will simply delete strategy from the dropdown. Please confirm, name is correct?");
            if (confirmDelete == false) return;

            debug(JSON.stringify(storedStrategies));
            delete storedStrategies[strategyToDelete];
            debug(JSON.stringify(storedStrategies));
            GM_setValue(GMPositionsName,storedStrategies);

            window.location.reload();
        } else {
            alert('You do not have any custom strategy with this name. No action taken. Input you gave was: ' + strategyToDelete);
        }

    }, "d");

    return positions;
}

function createPositionsDropdown() {
    var selectBox = document.createElement("SELECT");
    selectBox.id = "tagSelectorP";
    selectBox.classList.add("randomClassToHelpHide");
    selectBox.style="margin: 15px 0;margin-top: 15px;margin-right: 0px;margin-bottom: 15px;margin-left: 0px;font-size: 12px;background-color: var(--color-bg-default)"

    var option = document.createElement("option");
    option.text = "All Positions";
    option.value= "All";
    selectBox.add(option);

    var userGeneratedGroups = document.createElement("optgroup");
    userGeneratedGroups.text = "---USER GROUPS---";
    userGeneratedGroups.label = "---USER GROUPS---";

    selectBox.addEventListener("change", function() {
        tEv("sharekhan","positions","filter","");
        var selectedGroup = this.value;

        info("Group selected: " + selectedGroup);
        var selectedPositions = positions[selectedGroup];

            //START work on Positions AREA
            var allPositionsRow = jQ(allDOMPaths.PathForPositions);
            info('found positions row: ' + allPositionsRow.length);
            allPositionsRow.show();


            var stocksInList = [];

            //logic to hide the rows in positions table not in our list
            var countPositionsDisplaying = 0;
            allPositionsRow.addClass("allHiddenRows");

            var tdymtm = 0.0;
            var settledmtm = 0.0;
            var totalmtm = 0.0;
            var tdybpl = 0.0;
            var totalbpl = 0.0;
            var selection = [];

            allPositionsRow.each(function(rowIndex) {
                try {
                    var matchFound = false;
                    var span = jQ(this).find("td:nth-child(2) > span");
                    var params = JSON.parse(jQ(span).attr('params'));
                    debug(params);

                    var contract = params.detail.contract;
                    var exp =  params.detail.contract.split(" ")[1];
                    var scrip = params.scripcode;

                    if (selectedGroup === "All") {
                        matchFound = true;
                        debug('all so showing');
                    } else {
                        if (selectedPositions) {
                            matchFound = selectedPositions.includes(contract);
                            if (matchFound) {
                                debug('custom group found');
                            } else {
                                debug('custom group present but no match');
                            }
                        } else {
                            debug('custom group not found');
                            matchFound = (selectedGroup==exp)?true:false;
                            if (!matchFound) {
                                debug('expiry no match');
                                matchFound = (selectedGroup==scrip)?true:false;

                                if (matchFound) {
                                    debug('scrip match');
                                } else {
                                    debug('no match at all');
                                }
                            } else {
                                debug('exiry match');
                            }
                        }
                    }

                    if (matchFound) {
                        tdymtm += parseFloat(params.detail.tdymtm);
                        settledmtm += parseFloat(params.detail.settledmtm);
                        totalmtm += parseFloat(params.detail.totalmtm);
                        tdybpl += parseFloat(params.detail.tdybpl);
                        totalbpl += parseFloat(params.detail.totalbpl);
                    } else {
                        jQ(this).hide();
                    }
                } catch(err) {
                }
            //END work on Positions AREA
        });

        //document.querySelector("#sort > tbody > tr:nth-child(5) > td:nth-child(16)") today mtm, settled mtm, total mtm, today bpl, total bpm
        jQ('#idtodaymtm').remove();
        jQ(`#sort > tbody > tr:nth-child(${allPositionsRow.length}) > td:nth-child(16)`).append(`<span id='idtodaymtm'><br /><b style="background: pink;">${tdymtm}</b></span>`);

        jQ('#idsettledmtm').remove();
        jQ(`#sort > tbody > tr:nth-child(${allPositionsRow.length}) > td:nth-child(17)`).append(`<span id='idsettledmtm'><br /><b style="background: pink;">${settledmtm}</b></span>`);

        jQ('#idtotalmtm').remove();
        jQ(`#sort > tbody > tr:nth-child(${allPositionsRow.length}) > td:nth-child(18)`).append(`<span id='idtotalmtm'><br /><b style="background: pink;">${totalmtm}</b></span>`);

        jQ('#idtdybpl').remove();
        jQ(`#sort > tbody > tr:nth-child(${allPositionsRow.length}) > td:nth-child(19)`).append(`<span id='idtdybpl'><br /><b style="background: pink;">${tdybpl}</b></span>`);

        jQ('#idtotalbpl').remove();
        jQ(`#sort > tbody > tr:nth-child(${allPositionsRow.length}) > td:nth-child(20)`).append(`<span id='idtotalbpl'><br /><b style="background: pink;">${totalbpl}</b></span>`);

        return this;
    });

    //add options to the positions select drop down
    for(var key in positions){
        option = document.createElement("option");
        option.text = key;
        option.value = key;
        jQ(userGeneratedGroups).append(option);
    };

    selectBox.add(userGeneratedGroups);
    return selectBox;
}

waitForKeyElements("body > div:nth-child(6) > ui-view > ui-view > turnover > div > div.card > div.table-responsive.ng-scope > div:nth-child(1) > div.col-xs-1 > button",showPositionDropdown);

function showPositionDropdown(retry = true) {
    debug('showPositionDropdown');

    var allPositionsRow = jQ(allDOMPaths.PathForPositions);

    if (allPositionsRow.length < 1) {
        debug('sleeping as couldnt find positions');
        //TODO if no positions this will cause loop
        if (retry) {
            setTimeout(function(){ showPositionDropdown(false); }, 1000);
        }
        return;
    }

    var positionGroupdropdown;
    debug(jQ('#tagSelectorP').exists());
    if (jQ('#tagSelectorP').exists()) {
        positionGroupdropdown = jQ('#tagSelectorP');
    } else {
        positionGroupdropdown = createPositionsDropdown();
    }

    var lastC = positionGroupdropdown.lastChild;
    debug(lastC);
    if (lastC.id == "randomForDeleteOptGroupE") {
        positionGroupdropdown.removeChild(lastC);
    }

    lastC = positionGroupdropdown.lastChild;
    debug(lastC);
    if (lastC.id == "randomForDeleteOptGroup") {
        positionGroupdropdown.removeChild(lastC);
    }

    var optGrp = document.createElement("optgroup");
    optGrp.text = "---SCRIPT WISE---";
    optGrp.label = "---SCRIPT WISE---";
    optGrp.id = "randomForDeleteOptGroup";

    var optGrpExpiry = document.createElement("optgroup");
    optGrpExpiry.text = "---EXPIRY WISE---";
    optGrpExpiry.label = "---EXPIRY WISE---";
    optGrpExpiry.id = "randomForDeleteOptGroupE";

    var arrForUnique = [];
    var uniqueExpiryArray = [];
    allPositionsRow.each(function(rowIndex) {

        var span = jQ(this).find("td:nth-child(2) > span");
        debug(span);
       try{
        var params = JSON.parse(jQ(span).attr('params'));
        debug(params);
        debug(params.scripcode);

        //creating auto generated script wise grouping
        var ts = params.scripcode;
        if (!arrForUnique.includes(ts)) {
            var option = document.createElement("option");
            option.text = ts;
            option.value = ts;
            jQ(optGrp).append(option);
            arrForUnique.push(ts);
        }

        //creating auto generated expiry wise grouping
        var arr = params.detail.contract.split(" ");

        //NIFTY 17Jun2021 PE 14500
        var ex = arr[1];
        if (!uniqueExpiryArray.includes(ex)) {
            var option2 = document.createElement("option");
            option2.text = ex;
            option2.value = ex;
            jQ(optGrpExpiry).append(option2);
            uniqueExpiryArray.push(ex);
        }
       } catch(err) {
           //debug(err);
       }

    });

    positionGroupdropdown.add(optGrp);
    positionGroupdropdown.add(optGrpExpiry);


    var ourDiv = document.createElement("div");
    ourDiv.classList.add("randomClassToHelpHide");
    ourDiv.classList.add("tagSelectorStyle");
    ourDiv.classList.add("col-xs-2");
    ourDiv.id ='ourDiv';

    ourDiv.appendChild(positionGroupdropdown);
    //document.querySelector("body > div:nth-child(6) > ui-view > ui-view > turnover > div > div.card > div.table-responsive.ng-scope > div:nth-child(1) > div.col-xs-1 > button")
    jQ("body > div:nth-child(6) > ui-view > ui-view > turnover > div > div.card > div.table-responsive.ng-scope > div:nth-child(1) > div.col-xs-1").before(ourDiv);

//    simulateSelectBoxEvent();
}

function updatePnl() {
}

jQ.fn.exists = function () {
    return this.length !== 0;
}

tEv("sharekhan","visit","main","");


function waitForKeyElements (
    selectorTxt,    /* Required: The jQuery selector string that
                        specifies the desired element(s).
                    */
    actionFunction, /* Required: The code to run when elements are
                        found. It is passed a jNode to the matched
                        element.
                    */
    bWaitOnce,      /* Optional: If false, will continue to scan for
                        new elements even after the first match is
                        found.
                    */
    iframeSelector  /* Optional: If set, identifies the iframe to
                        search.
                    */
) {
    var targetNodes, btargetsFound;

    if (typeof iframeSelector == "undefined")
        targetNodes     = jQ(selectorTxt);
    else
        targetNodes     = jQ(iframeSelector).contents ()
                                        .find (selectorTxt);

    if (targetNodes  &&  targetNodes.length > 0) {
        btargetsFound   = true;
        /*--- Found target node(s).  Go through each and act if they
            are new.
        */
        targetNodes.each ( function () {
            var jThis        = jQ(this);
            var alreadyFound = jThis.data ('alreadyFound')  ||  false;

            if (!alreadyFound) {
                //--- Call the payload function.
                var cancelFound     = actionFunction (jThis);
                if (cancelFound)
                    btargetsFound   = false;
                else
                    jThis.data ('alreadyFound', true);
            }
        } );
    }
    else {
        btargetsFound   = false;
    }

    //--- Get the timer-control variable for this selector.
    var controlObj      = waitForKeyElements.controlObj  ||  {};
    var controlKey      = selectorTxt.replace (/[^\w]/g, "_");
    var timeControl     = controlObj [controlKey];

    //--- Now set or clear the timer as appropriate.
    if (btargetsFound  &&  bWaitOnce  &&  timeControl) {
        //--- The only condition where we need to clear the timer.
        clearInterval (timeControl);
        delete controlObj [controlKey]
    }
    else {
        //--- Set a timer, if needed.
        if ( ! timeControl) {
            timeControl = setInterval ( function () {
                    waitForKeyElements (    selectorTxt,
                                            actionFunction,
                                            bWaitOnce,
                                            iframeSelector
                                        );
                },
                300
            );
            controlObj [controlKey] = timeControl;
        }
    }
    waitForKeyElements.controlObj   = controlObj;
}