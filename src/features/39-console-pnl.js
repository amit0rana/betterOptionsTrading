// console.zerodha.com: a shortcut to the current month's F&O P&L, and a P&L link in the
// nav dropdown.

function changePnLFilter() {
    debug('changePnLFilter');
    setTimeout(function () {
        document.getElementsByTagName('select')[0].selectedIndex = 2; //FO

        document.getElementsByTagName('select')[0].focus();
        document.getElementsByTagName('select')[0].click();
        // document.querySelector("div.two:nth-child(1) > select:nth-child(2)").click();
        // console.log(document.querySelector("div.two:nth-child(1) > select:nth-child(2)"));
        // // div.two:nth-child(1) > select:nth-child(2)
        // document.querySelector("option[value='FO']").click();
        document.querySelector("input[name='date']").click();

        var today = new Date();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();

        if (mm < 10) {
            mm = '0' + mm;
        }
        var monthStart = yyyy + '-' + mm + '-01';

        document.querySelector("td[title='" + monthStart + "']").click();
        document.querySelector('#app > div.wrapper > div > div > div > form > div > div.one.columns > button').click()
    }, 0);

    //2021-02-03 ~ 2021-03-01
}

function introducePnlFilter() {
    debug('introducePnlFilter');
    var spanForFilter = document.createElement("span");
    spanForFilter.classList.add("randomClassToHelpHide");
    //spanForFilter.style="margin: 15px 0;margin-top: 15px;margin-right: 0px;margin-bottom: 15px;margin-left: 0px;border-right: 1px solid #e0e0e0;border-right-width: 1px;border-right-style: solid;border-right-color: rgb(224, 224, 224);padding: 0 10px;"
    spanForFilter.textContent = 'F&O This Month';
    spanForFilter.id = 'customFilter';
    spanForFilter.addEventListener("click", () => changePnLFilter());

    // jQ(BASE_PNL_REPORT).after(spanForFilter);
    jQ('div.two:nth-child(1)').append(spanForFilter);
    tippy('#customFilter', {
        content: "First select FO from dropdown then click here",
        placement: 'bottom',
    });

    // jQ(document).on('click', "#customPnlFilter", function () {
    // }

}

//NOT WORKING 
waitForKeyElements("h1:contains('P&L')", introducePnlFilter);

function addPnlMenu() {
    jQ('.dropdown-nav-list').prepend("<li><a target='_blank' href='https://console.zerodha.com/reports/pnl'><span class='icon icon-console'></span> P&L<span class='text-lightest'> / betterKite</span></a></li>");
}

waitForKeyElements(".dropdown-nav.layer-2", addPnlMenu);

