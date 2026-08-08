// Pulls the Toastify stylesheet in through @resource and injects it.
// Runs first so later modules can show toasts during start-up.

const my_css = GM_getResourceText("TOASTIFY_CSS");
GM_addStyle(my_css);
