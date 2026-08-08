// The stylesheet betterKite injects: full-width layout, sticky headers, and the classes
// used to mark elements it adds so they can be cleaned up again.

function fullWidth() {
    var cssStr = `<style>
    span.supS {
         position: absolute !important;
         bottom: -12px !important;
         font-size: small !important;
         background: var(--color-bg-default);
         padding: 0 5px;
         border-radius: 10px;
         z-index: 1;
         /* color: lightgray; */
         border: 2px solid var(--color-border-1);
    }
	span.supS.synthetic {
		font-size: 0.8rem !important;
        bottom: 34px !important;
        right: 10px;
        letter-spacing: 1px;
	}
    .atmCss {
        box-shadow: inset 0px 0px 5px 0px gray !important;
    }
    .app .wrapper {
        max-width: 100%;
    }
	li#watchlistFilterId {
		padding: 10px;
	}
	.index0,.index1 {
		position: sticky !important;
		top: 0;
		z-index: 2;
		background-color: var(--color-bg-default);
	}
	.index1 {
		top: 46px;
	}
	.omnisearch {
		transform: translateX(0px);
		z-index: 3!important;
	}
    .instruments {
        overflow: hidden;
    }
    .vddl-list.list-flat {
        overflow: auto;
    }
    .text-red .text-label.grey.randomClassholdingToHelpHide{color: red}
    .text-green .text-label.grey.randomClassholdingToHelpHide{color: green}
    .text-red.text-label.grey.randomClassholdingToHelpHide{color: red!important;display: block;margin-top: 7px;padding: 5px;}
    .text-green.text-label.grey.randomClassholdingToHelpHide{color: green!important;display: block;margin-top: 7px;padding: 5px;}
    button.atmBtn,input#counter{
         border: 1px solid;
         font-size: 0.8rem;
         padding: 3px 10px;
         border-radius: 5px;
         margin: 10px 5px;
         font-weight: 800;
         color: var(--primaryColor);
         cursor:pointer;
    }
    input#counter {
         width: 60px;
    }
    a#clearOptionChain {
         padding : 10px;
    }
    .addTag{
         top: 10px;
         right: 50px;
         position: absolute;
    }
    </style>`;
    jQ("head").append(cssStr);
}

/**
 * Shared body of the TRAIL and Save Profit buttons on trigger-pending orders. Both read
 * the same `data` attribute, adjust prices, and PUT the order back; only the price
 * arithmetic differs.
 *
 * @param e            the click event
 * @param button       the clicked element, carrying `data="uid|orderId|price|triggerPrice|txnType"`
 * @param adjustPrices (order, direction) => void, where direction is +1 for a SELL leg
 *                     and -1 for a BUY leg
 * @returns false, to stop Kite's own row handler from firing
 */