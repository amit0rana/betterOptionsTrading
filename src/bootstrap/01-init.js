// Waits for GM_config to finish loading, then hands over to main().

let isInit = () => setTimeout(() => 
    gmc.isInit ? main() : isInit(), 0);
isInit();