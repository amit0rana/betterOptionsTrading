const D_LEVEL_INFO = 2;
const D_LEVEL_DEBUG = 1;
const D_LEVEL_NONE = 100;

const log = function (level, logInfo) {
    switch (level) {
        case D_LEVEL_DEBUG:
            console.debug(logInfo);
            break;
        case D_LEVEL_INFO:
            console.info(logInfo);
            break;
        default:
            console.log(logInfo);
    }
}
const debug = function (logInfo) {
    if (D_LEVEL <= D_LEVEL_DEBUG) {
        log(D_LEVEL_DEBUG, logInfo);
    }
}
const info = function (logInfo) {
    if (D_LEVEL <= D_LEVEL_INFO) {
        log(D_LEVEL_INFO, logInfo);
    }
}
const formatter = Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR'
});

const reloadPage = function (values) {
    window.location.reload();
}

const getCookie = function (name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}