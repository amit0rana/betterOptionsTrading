// ==UserScript==
// @name         betterKite
// @namespace    https://github.com/amit0rana/betterKite
// @version      4.01
// @description  Introduces small features on top of kite app
// @author       Amit
// @match        https://kite.zerodha.com/*
// @match        https://console.zerodha.com/*
// @match        https://insights.sensibull.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        GM_registerMenuCommand
// @require      https://raw.githubusercontent.com/amit0rana/betterOptionsTrading/master/betterCommon.js
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js
// @require      https://raw.githubusercontent.com/amit0rana/MonkeyConfig/master/monkeyconfig.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/axios/0.21.1/axios.min.js
// @require      https://raw.githubusercontent.com/kawanet/qs-lite/master/dist/qs-lite.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.27.0/moment.min.js
// @require      https://unpkg.com/@popperjs/core@2
// @require      https://unpkg.com/tippy.js@6
// @require      https://cdn.jsdelivr.net/npm/sweetalert2@11
// @require      https://cdn.jsdelivr.net/npm/toastify-js
// @resource     TOASTIFY_CSS https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css
// @downloadURL  https://github.com/amit0rana/betterOptionsTrading/raw/master/betterKite.user.js
// @updateURL    https://github.com/amit0rana/betterOptionsTrading/raw/master/betterKite.meta.js
// ==/UserScript==

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

// SEBI MANDATORY DISCLAIMER AS REQUIRED BY SEBI

// KIND ATTENTION TO ALL USERS

// Disclaimer from Developers as per SEBI norms: Equity Investment are subject to 100% 
// market risks. Refer your financial consultant advice before Investing. This code is
//  only for Educational and Learning, Knowledge Purposes. Developers have no 
// responsibility for your intended decision & financial losses. Keep calculated & always 
// analyzed your cash osition and risk bearing capacity before following any advise.
//  Stock market investments and using this script are VERY RISKY and using ths code, you 
// agree that you understand the Market risks involved. Profits and Losses are part of Share market. 
//  Kindly understand and act wisely.

// Disclaimer/ disclosure

// 👉This script does not provide any tips/recommendations/advice
// 👉All features are only for education and learning purpose.
// 👉Do Consult your financial advisor before taking trades or investment decisions
// 👉Developers are not responsible for any financial losses
// 👉Disclaimer/disclosure/terms and conditions applicable to all users of this script

// All the features are for education and learning purpose only👍