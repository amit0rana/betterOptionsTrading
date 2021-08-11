// ==UserScript==
// @name         betterStocksDeveloper
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Small improvemnts to the betterStocks website
// @author       Amit
// @match        https://web.stocksdeveloper.in/*
// @icon         https://www.google.com/s2/favicons?domain=stocksdeveloper.in
// @grant        none
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js
// ==/UserScript==

//(function() {
    'use strict';

    window.jQ = jQuery.noConflict(true);
    
    waitForKeyElements("#quantityTable", addBtn);
    console.log(jQ("div.pcoded-inner-navbar > ul"));
    jQ("div.pcoded-inner-navbar > ul").after('<li subitem-icon="style1" dropdown-icon="style1"><a style="color:white;" href="https://web.stocksdeveloper.in/trading/portfolio#trade-tab">Trade</a></li>');
    
    function addBtn() {
        console.log('addBtn');
    
        $("#updateQty").remove();
        var i = document.createElement("BUTTON");
        i.type = 'button';
        i.name = 'updateQty';
        i.value = 'Update Quantity';
        i.innerHTML = 'Update Quantity';
        i.id = 'updateQty';
        i.classList.add('btn');
        i.style = 'margin: 0px 2px;';
        i.classList.add('btn-secondary');
    
    
        i.onclick = function () {
    
            var selectedGroups = $("tr.selected");
            var accountSizes = [];
            var quantities = [];
            selectedGroups.each(function (rowIndex) {
                var accountSize = jQ(jQ(this).find('td')[1]).text();
    
                accountSizes.push(accountSize);
                var input = jQ(this).find('input')[0];
                quantities[accountSize] = jQ(input).val();
            });
    
            var minAccountSize = Math.min(...accountSizes);
            console.log(quantities);
    
            selectedGroups.each(function (rowIndex) {
                var accountSize = jQ(jQ(this).find('td')[1]).text();
    
                if (accountSize >= minAccountSize) {
                    var input = jQ(this).find('input')[0];
                    jQ(input).val((accountSize / minAccountSize) * quantities[minAccountSize]);
                }
            });
            //console.log(min);
    
        };
    
        $("#placeResetButton").before(i);
    
    }
    jQ(document).on('click', "#clearFilter", function (event) {
        jQ('#positionsTable_filter > label:nth-child(1) > input:nth-child(1)').val('').trigger('change').click().focus().keydown().keypress().keyup();
    });
    jQ(document).on('dblclick', "#positions-body", function (event) {
        jQ("#clearFilter").remove();
        jQ('#positionsTable_filter > label:nth-child(1) > input:nth-child(1)').after("<a id='clearFilter' href='#'>r</a>");
        jQ('#positionsTable_filter > label:nth-child(1) > input:nth-child(1)').val(jQ(event.target).text()).trigger('change').click().focus().keydown().keypress().keyup();
    });
    //})();
    
    
    jQ.fn.exists = function () {
        return this.length !== 0;
    }