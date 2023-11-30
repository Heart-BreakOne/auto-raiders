

//To ensure operation on headless mode, see these values manually.
//Back up this file when updating the extension
const dataToSet = {
    //List of captains, split by commas
    "blacklist": ["captain1", "captain2", "captain3"],
    "whitelist": ["captain1", "captain2", "captain3"],
    "potionlist": ["captain1", "captain2", "captain3"],
    "masterlist": ["captain1", "captain2", "captain3"],

    //Place only one unit. False = place more than. True = place only one
    "campaignSwitch": false,
    "duelSwitch": true,
    "clashSwitch": true,
    "dungeonSwitch": true,

    //Units allowed to be used.
    "commonSwitch": true,
    "uncommonSwitch": true,
    "rareSwitch": true,
    "legendarySwitch": false,

    //Equip captain skins
    "equipSwitch": true,

    //Collect free daily currency
    "dailySwitch": false,
    //Collect quests
    "questSwitch": false,
    //Buy scrolls
    "scrollSwitch": false,
    //Buy extra scrolls for $100
    "extraSwitch": false,
    //Collect battlepas
    "battlepassSwitch": false,

    //Enable and disable placement and idling switch for the specific switch.
    "offlinePermission": {
        "offlineButton_1": false,
        "offlineButton_2": false,
        "offlineButton_3": false,
        "offlineButton_4": false
    },
    //Switch idle captains
    "offlineSwitch": true,
    //Don't switch if captain doesn't have loyalty.
    "skipSwitch": false,

    //No potions = 0. Potions at 45 = 1. Potions at 100 = 2
    "selectedOption": "0",

    //Dont place on loyalty chest.
    //Place regardless = 0. Place if at least silver = 2. Place if at least gold = 3. Place if only diamond = 4
    "loyalty": "0"
};

async function setStorage() {
    // Use chrome.storage.local to set the data
    chrome.storage.local.set(dataToSet, function () {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
        }
    });
}