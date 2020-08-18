const D_LEVEL_INFO = 2;
const D_LEVEL_DEBUG = 1;
const D_LEVEL = D_LEVEL_INFO;

const log = function(level, logInfo) {
    if (level >= D_LEVEL) {
        console.log(logInfo);
    }
}
const debug = function(logInfo) {
    log( D_LEVEL_DEBUG , logInfo);
}
const info = function(logInfo) {
    log( D_LEVEL_INFO , logInfo);
}
const formatter = Intl.NumberFormat('en-IN', { 
    style: 'currency', currency: 'INR'
});