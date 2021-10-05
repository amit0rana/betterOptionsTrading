
// ==UserScript==
// @name         betterOipulse
// @namespace    https://github.com/amit0rana/betterOipulse
// @version      0.01
// @description  
// @author       Amit
// @match        https://oipulse.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js
// @require      https://raw.githubusercontent.com/amit0rana/MonkeyConfig/master/monkeyconfig.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @downloadURL  https://github.com/amit0rana/betterOptionsTrading/raw/master/betterOipulse.user.js
// @updateURL    https://github.com/amit0rana/betterOptionsTrading/raw/master/betterOipulse.meta.js
// ==/UserScript==

const formatter = Intl.NumberFormat('en-IN');


var i = document.createElement("INPUT");
i.type = 'button';
i.name='addLot';
i.value='Multiply 75';
i.classList.add("randomClassToHelpHide");
i.id='addLot';

function main() {
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
    $(document).on('click',".fullViewBtn",  function() {
        $(".randomClassToHelpHide").remove();
        $('#goBackSite').before(i);
    });
    $(document).on('click',"#goBackSite",  function() {
        $(".randomClassToHelpHide").remove();
        $('#main_navbar').append(i);
    });
}

main();