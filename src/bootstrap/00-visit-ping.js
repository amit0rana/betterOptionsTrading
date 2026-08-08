// Small jQuery helper plus the one-off "script loaded" analytics event.

jQ.fn.exists = function () {
    return this.length !== 0;
}

tEv("kite", "visit", "main", VERSION);

