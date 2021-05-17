const D_LEVEL_INFO = 2;
const D_LEVEL_DEBUG = 1;

const log = function(level, logInfo) {
    switch(level) {
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
const debug = function(logInfo) {
    log( D_LEVEL_DEBUG , logInfo);
}
const info = function(logInfo) {
    log( D_LEVEL_INFO, logInfo);
}
const formatter = Intl.NumberFormat('en-IN', { 
    style: 'currency', currency: 'INR'
});