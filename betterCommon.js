// This is free and unencumbered software released into the public domain.

// Anyone is free to copy, modify, publish, use, compile, sell, or
// distribute this software, either in source code form or as a compiled
// binary, for any purpose, commercial or non-commercial, and by any
// means.

// In jurisdictions that recognize copyright laws, the author or authors
// of this software dedicate any and all copyright interest in the
// software to the public domain. We make this dedication for the benefit
// of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of
// relinquishment in perpetuity of all present and future rights to this
// software under copyright law.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
// IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
// OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
// ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
// OTHER DEALINGS IN THE SOFTWARE.

// For more information, please refer to <https://unlicense.org>

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

const getFunctionName = function () {
    // var me = arguments.callee.toString();
    // me = me.substr('function '.length);     
    // me = me.substr(0, me.indexOf('('));
    return getFunctionName.caller.name;
}