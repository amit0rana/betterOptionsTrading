// ==UserScript==
// @name         betterSensibull
// @namespace    https://github.com/amit0rana/betterSensibull
// @version      0.06
// @description  Introduces small features on top of sensibull
// @author       Amit
// @match        https://web.sensibull.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js
// @require      https://github.com/amit0rana/betterOptionsTrading/raw/master/common.js
// @require      https://raw.githubusercontent.com/amit0rana/MonkeyConfig/master/monkeyconfig.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @downloadURL  https://github.com/amit0rana/betterOptionsTrading/raw/master/betterSensibull.user.js
// @updateURL    https://github.com/amit0rana/betterOptionsTrading/raw/master/betterSensibull.meta.js
// ==/UserScript==

var context=window,options="{    anonymizeIp: true,    colorDepth: true,    characterSet: true,    screenSize: true,    language: true}";const hhistory=context.history,doc=document,nav=navigator||{},storage=localStorage,encode=encodeURIComponent,pushState=hhistory.pushState,typeException="exception",generateId=()=>Math.random().toString(36),getId=()=>(storage.cid||(storage.cid=generateId()),storage.cid),serialize=e=>{var t=[];for(var o in e)e.hasOwnProperty(o)&&void 0!==e[o]&&t.push(encode(o)+"="+encode(e[o]));return t.join("&")},track=(e,t,o,n,i,a,r)=>{const c="https://www.google-analytics.com/collect",s=serialize({v:"1",ds:"web",aip:options.anonymizeIp?1:void 0,tid:"UA-176741575-1",cid:getId(),t:e||"pageview",sd:options.colorDepth&&screen.colorDepth?`${screen.colorDepth}-bits`:void 0,dr:doc.referrer||void 0,dt:doc.title,dl:doc.location.origin+doc.location.pathname+doc.location.search,ul:options.language?(nav.language||"").toLowerCase():void 0,de:options.characterSet?doc.characterSet:void 0,sr:options.screenSize?`${(context.screen||{}).width}x${(context.screen||{}).height}`:void 0,vp:options.screenSize&&context.visualViewport?`${(context.visualViewport||{}).width}x${(context.visualViewport||{}).height}`:void 0,ec:t||void 0,ea:o||void 0,el:n||void 0,ev:i||void 0,exd:a||void 0,exf:void 0!==r&&!1==!!r?0:void 0});if(nav.sendBeacon)nav.sendBeacon(c,s);else{var d=new XMLHttpRequest;d.open("POST",c,!0),d.send(s)}},tEv=(e,t,o,n)=>track("event",e,t,o,n),tEx=(e,t)=>track(typeException,null,null,null,null,e,t);hhistory.pushState=function(e){return"function"==typeof history.onpushstate&&hhistory.onpushstate({state:e}),setTimeout(track,options.delay||10),pushState.apply(hhistory,arguments)},track(),context.ma={tEv:tEv,tEx:tEx};

//window.jQ=jQuery.noConflict(true);
const VERSION = "v0.04";
const PRO_MODE = false;

const reloadPage = function(values) {
    window.location.reload();
}

const g_config = new MonkeyConfig({
    title: 'betterSensibull Settings',
    menuCommand: true,
    onSave: reloadPage,
    params: {
        logging: {
            type: 'select',
            choices: [ 'Info','Debug'],
            values: [D_LEVEL_INFO, D_LEVEL_DEBUG],
            default: D_LEVEL_INFO
        }
    }
});
const D_LEVEL = g_config.get('logging');

const allDOMPaths = { 
    domForPlacingToggleSelectBox : "#builder-left-col-scrolling-div > div.style__TradeViewWrapper-evUGWc.rCcEi > div.style__HeaderText-fcSeJa.byyUgf > div:nth-child(2)",
    domForPositionsRows : '#builder-left-col-scrolling-div > div.style__TradeViewWrapper-evUGWc.rCcEi > div.style__StyledCard-ktEkEv.dqAFAk',
    domForPositionExpiry : 'div.style__LegInstrumentRowWrapper-gudSLo.khMggA > div:nth-child(1) > div:nth-child(1) > div.style__InstrumentInfo-iZSHUf.leJbQJ',
    domForStrategySuggestions : '#app > div > div.page-sidebar-is-open.sn-page--builder.style__AppWrapper-djPJnZ.gvrWYn > div.sn-l__app-content.style__AppContent-haAgYm.korEfl > div.style__ContainerSpacing-kZpkBx.kJeLXd > div > div.style__BuilderWrapper-hHFjHn.nAQhs > div.style__BuilderColRight-jAAkJD.hbmLzB > div.style__BuilderPresetStrategiesWrapper-iJakRq.jDHsHZ',
    domForCheckbox : 'span > span:nth-child(1) > input'
};

//div holding ready-made strategies.
//#builder-left-col-scrolling-div > div.style__BuilderPresetStrategiesWrapper-iJakRq.jfpzqX > div.style__PresetStrategiesFilter-kwGoWz.ddHzIy > div
waitForKeyElements ("div.style__PresetStrategiesFilter-kwGoWz.ddHzIy", main);

//main();

// all behavior related actions go here.
function main() {

    $(allDOMPaths.domForStrategySuggestions).remove();

    var rows = $(allDOMPaths.domForPositionsRows);
    console.log('rows: ' + rows.length);

    var selectBox = document.createElement("SELECT");
    selectBox.id = "toggleSelectboxID";
    selectBox.classList.add("randomClassToHelpHide");
    //selectBox.style="margin: 15px 0;margin-top: 15px;margin-right: 0px;margin-bottom: 15px;margin-left: 0px;background-color: var(--color-bg-default)"

    var option = document.createElement("option");
    option.text = "Toggle";
    option.value= "All";
    selectBox.add(option);

    var expiryArray = [];
    rows.each(function(rowIndex) {
        //console.log('r: ' + $(this).find(allDOMPaths.domForPositionExpiry).text());
        var t = getExpiryText($(this).find(allDOMPaths.domForPositionExpiry).text());
        //console.log('t: ' + t);
        if (t && !expiryArray.includes(t)) {
            expiryArray.push(t);

            var option = document.createElement("option");
            option.text = t;
            option.value = t;
            selectBox.add(option);
        }
    });

    //$('.jss1557').click();

    $(allDOMPaths.domForPlacingToggleSelectBox).after(selectBox);

    selectBox.addEventListener("click", function() {
        console.log(this.value);
        var selectedItem = this.value;

        var rows = $(allDOMPaths.domForPositionsRows);
        rows.each(function(rowIndex) {
            var t = getExpiryText($(this).find(allDOMPaths.domForPositionExpiry).text());

            //console.log('text to cmp' + t);
            if (selectedItem == 'All' || (t && t == selectedItem)) {
                var c = $(this).find(allDOMPaths.domForCheckbox);
                document.getElementsByClassName($(c[0]).attr('class'))[0].click();
            }
        });

        //selectBox.value = 'All';
    });

}

function getExpiryText(fullText) {
    var expiry = fullText.split(' ');
    t = expiry[0]+ ' ' + expiry[1];

    return t;
}

tEv("sensibull","visit","main","");