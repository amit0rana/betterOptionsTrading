// The GM_config settings panel, and the `gmc` instance every feature reads from.
//
// Note the top-level `await` here: everything after it in the built script runs as an
// async continuation, which is why the bootstrap polls gmc.isInit before calling main().

let gmc = await initGM()

function initGM() {
    GM_registerMenuCommand("Settings ", function () {
        gmc.open();
    }, "s");
    let g = new GM_config(
    {
        'id': 'betterKiteConfig', // The id used for this instance of GM_config
        'title': 'betterKite Settings', // Panel Title
        'fields': // Fields object
        {
            'auto_refresh_PnL': // This is the id of the field
            {
                'label': 'Auto Refresh P&L', // Appears next to field
                'type': 'checkbox', // Makes this setting a text field
                'default': false, // Default value if user doesn't change it
                'title': 'Give us your name!', // Add a tooltip (hover over text)
                'section': ['Positions']
            },
            'use_api':
            {
                'label': 'Use API intead of oms',
                'title': 'smartLimit works only with API',
                'type': 'checkbox',
                'default': false,
            },
            'api_key':
            {
                'label': 'API Key',
                'type': 'text',
                'default': '',
            },
            'api_secret':
            {
                'label': 'API Secret',
                'type': 'password',
                'default': '',
            },
            'api_access_token':
            {
                'label': 'Access Token',
                'type': 'text',
                'default': '',
            },
            'overide_qty_freeze_check_to_enable':
            {
                'label': 'Enable overiding of Qty freeze feature',
                'type': 'checkbox',
                'default': true,
                'section': ['Positions', 'New Position']
            },
            'qty_freeze_warning':
            {
                'label': 'Warning when removing Qty Freeze',
                'type': 'checkbox',
                'default': true,
            },
            ...indexSettingsFields('freeze_quantity', 'Qty Freeze', 'defaultFreezeQty'),
            'smart_limit_check_to_enable':
            {
                'label': 'Enable smartLimit feature (needs API)',
                'type': 'checkbox',
                'default': false,
            },
            'auto_sl_order':
            {
                'label': 'Add SL order',
                'type': 'checkbox',
                'default': false,
                'section': ['Positions', 'Scalping']
            },
            'auto_sl_points':
            {
                'label': 'SL points',
                'type': 'number',
                'default': 20,
            },
            'auto_save_profit_points':
            {
                'label': 'Save profit points',
                'type': 'number',
                'default': 20,
            },
            'auto_trail_points':
            {
                'label': 'Trail profit points',
                'type': 'number',
                'default': 3,
            },
            'include_existing_positions':
            {
                'label': 'Include existing positions for Margin calculation',
                'type': 'checkbox',
                'default': false,
                'section': ['Positions', 'Margin']
            },
            'margin_method':
            {
                'label': 'Margin Calculation Method',
                'type': 'select',
                'options': [MM_BASKET, MM_CALC],
                'default': MM_BASKET,
            },
            'nf_hedge':
            {
                'label': 'Nifty Hedge',
                'type': 'number',
                'default': 500,
                'title': 'Used for calculating Margin saving on taking hedge',
            },
            'bnf_hedge':
            {
                'label': 'BankNifty Hedge',
                'type': 'number',
                'default': 700,
                'title': 'Used for calculating Margin saving on taking hedge',
            },
            'stock_hedge':
            {
                'label': 'Stocks Hedge',
                'type': 'number',
                'default': 100,
                'title': 'Used for calculating Margin saving on taking hedge',
            },
            'enable_nifty_monthly_weekly_range':
            {
                'label': 'Nifty range based on vix on hover of Pins',
                'type': 'checkbox',
                'default': true,
                'section': ['Positions', 'VIX Based Range. To use, PIN 1 should be Nifty50, Watchlist should have INDIA VIX. Then click on Nifty50 value in Pin1. Now you sould see daily, weekly, monthly range.']
            },
            'nifty_vix_range_monthly_sqroot':
            {
                'label': 'Nifty Range monthly sqroot',
                'type': 'number',
                'default': 12,
            },
            'nifty_vix_range_weekly_sqroot':
            {
                'label': 'Nifty Range weekly sqroot',
                'type': 'number',
                'default': 52,
            },
            'nifty_vix_range_daily_sqroot':
            {
                'label': 'Nifty Range daily sqroot',
                'type': 'number',
                'title': '365 - 104 (weedends) - 13 (holidays)',
                'default': 248,
            },
            'marketlist_number_of_strikes':
            {
                'label': 'Number of strikes +- ATM',
                'type': 'number',
                'default': 4,
                'section': ['Watchlist']
            },
            'filter_watchlist':
            {
                'label': 'Filter based on watchlist',
                'type': 'checkbox',
                'default': true,
            },
            'bump_method':
            {
                'label': 'Price Bump Method',
                'type': 'select',
                'options': ['LTP', 'Delta', 'Best Price'],
                'default': 'LTP',
                'section': ['Orders']
            },
            'bump_delta':
            {
                'label': 'Bump Increment',
                'type': 'number',
                'default': 0.5,
                'title': 'Used for bumping',
            },
            'pro_mode':
            {
                'label': 'Pro mode',
                'type': 'checkbox',
                'default': false,
                'section': ['Others']
            },
            ...indexSettingsFields('lot_size', 'lot size', 'defaultLotSize'),
            'full_width':
            {
                'label': 'Utilise full browser width',
                'type': 'checkbox',
                'default': true,
            },
            'logging':
            {
                'label': 'Logging',
                'type': 'select',
                'options': ['100', '2', '1'],
                'default': '100',
            },
        },
        'events':
        {
            'init': function () { // runs after initialization completes
                // //     // override saved value
                // //     this.set('Name', 'Mike Medley');

                // //     // open frame
                // //     this.open();
                //     let auto_refresh_PnL = gmc.get('auto_refresh_PnL');
                D_LEVEL = g.get('logging');
                PRO_MODE = g.get('pro_mode');
                MARGIN_METHOD = g.get('margin_method');

                for (const symbol of INDEX_SYMBOLS) {
                    const cfg = INDEX_CONFIG[symbol];
                    INDEX_LIMITS[symbol] = {
                        lotSize: parseInt(g.get(`${cfg.settings}_lot_size`)),
                        freezeQty: parseInt(g.get(`${cfg.settings}_freeze_quantity`)),
                    };
                }
            },
            'save': function (a=true) { // runs after values are saved
                // log the saved value of the Name field
                // this.log(this.get('Name'));
                this.close();
                if (a) 
                    reloadPage();
            }
        }
    });

    return g;
}