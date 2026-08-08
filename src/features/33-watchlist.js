// Watchlist toolbar: the text filter, the option-chain builder and the clear button.

var filterText = "";
function addWatchlistFilter() {
    var coc = document.createElement("a");
    coc.id = 'clearOptionChain';
    coc.classList.add("randomClassToHelpHide");
    coc.classList.add("item");
    coc.innerText = "Clear";
    coc.setAttribute("role", "tab");
    //jQ(allDOMPaths.dasboardNicknameSelector).after(coc);
    jQ(allDOMPaths.watchlistSettingDiv).before(coc);
    
    var oc = document.createElement("a");
    oc.id = 'addAltOptionChain';
    oc.classList.add("randomClassToHelpHide");
    oc.classList.add("item");
    oc.innerText = "OC";
    oc.setAttribute("role", "tab");
    jQ(allDOMPaths.watchlistSettingDiv).before(oc);

    //jQ("#watchlistFilterId").remove();
    var wFilter = document.createElement("a");
    wFilter.id = 'watchlistFilterId';
    wFilter.classList.add("randomClassToHelpHide");
    wFilter.classList.add("item");
    wFilter.innerText = "Filter";
    wFilter.setAttribute("role", "tab");
    jQ(allDOMPaths.watchlistSettingDiv).before(wFilter);
}
