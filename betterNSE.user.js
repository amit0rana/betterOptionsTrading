
// ==UserScript==
// @name         betterNSE
// @namespace    https://github.com/amit0rana/betterNSE
// @version      0.01
// @description  Introduces small features on top of nse website
// @author       Amit
// @match        https://www.nseindia.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js
// @require      https://raw.githubusercontent.com/amit0rana/MonkeyConfig/master/monkeyconfig.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @downloadURL  https://github.com/amit0rana/betterOptionsTrading/raw/master/betterNSE.user.js
// @updateURL    https://github.com/amit0rana/betterOptionsTrading/raw/master/betterNSE.meta.js
// ==/UserScript==

const formatter = Intl.NumberFormat('en-IN');
var isMultiply = true;

function changeButtonName() {
    var btn = $('#addLot');

    if (isMultiply) {
        $(btn).val('Divide 75');
        isMultiply = false;
    } else {
        isMultiply = true;
        $(btn).val('Multiply 75');
    }
}

function getNumber(n) {
    if (isMultiply) {
        return formatter.format(n*75);
    } else {
        return formatter.format(n/75);
    }
}

function main() {
    var i = document.createElement("INPUT");
    i.type = 'button';
    i.name='addLot';
    i.value='Multiply 75';
    i.classList.add("randomClassToHelpHide");
    i.id='addLot';

    $('#main_navbar').append(i); 

    $(document).on('click',"#addLot",  function() {
        var allRows = $('#optionChainTable-indices > tbody > tr');
        allRows.each(function(rowIndex) {
            //2 , 3, 21, 22
            var col = $(this).find("td:nth-child(2)");
            var txt = parseInt($(col).text().split(",").join(""));

            if (!isNaN(txt)) {
                $(col).text(getNumber(txt));
            }

            col = $(this).find("td:nth-child(3)");
            txt = parseInt($(col).text().split(",").join(""));

            if (!isNaN(txt)) {
                $(col).text(getNumber(txt));
            }
            col = $(this).find("td:nth-child(21)");
            txt = parseInt($(col).text().split(",").join(""));

            if (!isNaN(txt)) {
                $(col).text(getNumber(txt));
            }
            col = $(this).find("td:nth-child(22)");
            txt = parseInt($(col).text().split(",").join(""));

            if (!isNaN(txt)) {
                $(col).text(getNumber(txt));
            }
        });
        changeButtonName();
    });

    $(document).on('change',"#expirySelect",  function() {
        isMultiply = false;
        changeButtonName();
    });
}

main();