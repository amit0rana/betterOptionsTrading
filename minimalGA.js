var context = window;
var trackingId = "UA-176741575-1";
var options = "{    anonymizeIp: true,    colorDepth: true,    characterSet: true,    screenSize: true,    language: true}";

const hhistory = context.history;
const doc = document;
const nav = navigator || {};
const storage = localStorage;
const encode = encodeURIComponent;
const pushState = hhistory.pushState;
const typeException = 'exception';
const generateId = () => Math.random().toString(36);
const getId = () => {
    if (!storage.cid) {
        storage.cid = generateId()
    }
    return storage.cid;
};
const serialize = (obj) => {
    var str = [];
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            if(obj[p] !== undefined) {
                str.push(encode(p) + "=" + encode(obj[p]));
            }
        }
    }
    return str.join("&");
};
const track = (
    type,
    eventCategory,
    eventAction,
    eventLabel,
    eventValue,
    exceptionDescription,
    exceptionFatal
) => {
    const url = 'https://www.google-analytics.com/collect';
    const data = serialize({
        v: '1',
        ds: 'web',
        aip: options.anonymizeIp ? 1 : undefined,
        tid: trackingId,
        cid: getId(),
        t: type || 'pageview',
        sd: options.colorDepth && screen.colorDepth ? `${screen.colorDepth}-bits` : undefined,
        dr: doc.referrer || undefined,
        dt: doc.title,
        dl: doc.location.origin + doc.location.pathname + doc.location.search,
        ul: options.language ? (nav.language || "").toLowerCase() : undefined,
        de: options.characterSet ? doc.characterSet : undefined,
        sr: options.screenSize ? `${(context.screen || {}).width}x${(context.screen || {}).height}` : undefined,
        vp: options.screenSize && context.visualViewport ? `${(context.visualViewport || {}).width}x${(context.visualViewport || {}).height}` : undefined,
        ec: eventCategory || undefined,
        ea: eventAction || undefined,
        el: eventLabel || undefined,
        ev: eventValue || undefined,
        exd: exceptionDescription || undefined,
        exf: typeof exceptionFatal !== 'undefined' && !!exceptionFatal === false ? 0 : undefined,
    });

    if(nav.sendBeacon) {
        nav.sendBeacon(url, data)
    } else {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.send(data);
    }
};
const tEv = (category, action, label, value) => track('event', category, action, label, value);
const tEx = (description, fatal) => track(typeException, null, null, null, null, description, fatal);
hhistory.pushState = function (state) {
    if (typeof history.onpushstate == "function") {
        hhistory.onpushstate({ state: state });
    }
    setTimeout(track, options.delay || 10);
    return pushState.apply(hhistory, arguments);
}
track();
context.ma = {
    tEv,
    tEx
}