// Toast and tippy wrappers: the P&L-on-hover and quantity-in-lots tooltips, and the
// betterKite notification toast.

function getToast(message) {
    return Toastify({
        text: "<span>betterKte</br>" + message + "</span>",
        duration: 5000,
        close: true,
        offset: "60px",
        style: { top: "60px", display: "grid", "grid-template-columns": "15fr 1fr" },
        escapeMarkup: false
    });
}

const hideOnEsc = {
    name: 'hideOnEsc',
    defaultValue: true,
    fn({ hide }) {
        function onKeyDown(event) {
            if (event.keyCode === 27) {
                hide();
            }
        }

        return {
            onShow() {
                document.addEventListener('keydown', onKeyDown);
            },
            onHide() {
                document.removeEventListener('keydown', onKeyDown);
            },
        };
    },
};

function showTippy(target, msg) {
    tippy(target, {
        content: msg,
        allowHTML: true,
        hideOnClick: true,
        trigger: "click",
        plugins: [hideOnEsc],
        showOnCreate: true,
        onHidden(instance) {
            debug('onHide');
            instance.destroy();
        },
    });
    // t[0].show();
}

let pnlTippyInstances = [];

const pnlGlobalStore = {
    fn(instance) {
        return {
            onCreate() {
                pnlTippyInstances.push(instance);
            },
            onDestroy() {
                pnlTippyInstances = pnlTippyInstances.filter((i) => i !== instance);
            },
        };
    },
};

function showPnlTippy(target, msg) {
    tippy(target, {
        content: msg,
        offset: [0, -8],
        allowHTML: true,
        plugins: [pnlGlobalStore],
        onShow(instance) {
            var pnlTd = instance.reference;
            var row = jQ(pnlTd).closest("tr");
            var pos = getPositionRowObject(row);
            if (pos.instrument == "") return;
            // instance.setProps({content : "amit"});
            instance.setContent(formatter.format(-(pos.quantity * (pos.avgPrice - pos.ltp))));
        },
    });
    // t[0].show();
}

let lotsTippyInstances = [];

const lotsGlobalStore = {
    fn(instance) {
        return {
            onCreate() {
                lotsTippyInstances.push(instance);
            },
            onDestroy() {
                lotsTippyInstances = lotsTippyInstances.filter((i) => i !== instance);
            },
        };
    },
};
function showLotsTippy(target, msg) {
    tippy(target, {
        content: msg,
        allowHTML: true,
        offset: [0, -8],
        plugins: [lotsGlobalStore],
        onShow(instance) {
            var qtyTd = instance.reference;
            var row = jQ(qtyTd).closest("tr");
            var pos = getPositionRowObject(row);
            if (pos.instrument == "") return;

            const limits = indexLimitsFor(pos.instrument);
            const lot = limits ? Math.abs(pos.quantity / limits.lotSize) : 0;

            instance.setContent(`${lot} lots`);
        },
    });
    // t[0].show();
}
