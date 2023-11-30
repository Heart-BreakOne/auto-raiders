
/************************************ */
/* Setting up headless operation of the extension with puppeteer 

    Install node and npm. Then use npm to install puppeteer.
    There several ways to install node, use the one that best suits you.

    On the second line of the content_script.js set isHeadless = true instead of false.

    Move the puppeteer.js outside the auto_raiders folder.
    You can place the puppeteer script wherever you want (including leaving inside the auto-raiders folder) as long as you properly set the extension path.
    
    On puppeteer.js edit the following:
    const authToken = 'Your token here, ';

    Using another browser, login to stream raiders.
    Copy the ACCESS_INFO token value from the devtools -> application -> Storage -> Cookies -> https://www.streamraiders.com.
    Disable "URL encoded" option at the bottom then copy the value to const authToken = 'Your token here, ';

    If you want to place puppeteer.js elsewhere, properly edit the path by replacing the folder auto-raiders with the actual folder path
    `--disable-extensions-except=auto-raiders'`,
    `--load-extension=auto-raiders'`,

    To make sure everything is actually working, open the browser graphic interface by setting headless to false -> headless: false,
    headless: 'new',
    Pay attention that new is between '' and false is not.


    Edit the variables and lists below to set your personal preferences.

    To run open the terminal, navigate to where the puppeteer.js is and type:    node puppeteer.js

    /**************************************************************************/


//To ensure operation on headless mode, see these values.
const dataToSet = {
    //List of captains, split by commas
    "blacklist": ["captain1", "captain2", "captain3"],
    "whitelist": ["captain1", "captain2", "captain3"],
    "potionlist": ["captain1", "captain2", "captain3"],
    "masterlist": ["captain1", "captain2", "captain3"],

    //Place only one unit. True = place more than one. False = place only one
    "campaignSwitch": true,
    "duelSwitch": false,
    "clashSwitch": false,
    "dungeonSwitch": false,

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

    //Period in minutes to refresh the page.
    "reloaderInput": 30,

    //Enable and disable placement and idling switch for the specific switch.
    "offlinePermission": {
        "offlineButton_1": true,
        "offlineButton_2": true,
        "offlineButton_3": true,
        "offlineButton_4": true
    },
    //Switch idle captains
    "offlineSwitch": true,
    //Don't switch if captain doesn't have loyalty.
    "skipSwitch": false,

    //Use potion only if it's a potion listed captain.
    "favoriteSwitch": false,
    //No potions = 0. Potions at 45 = 1. Potions at 100 = 2
    "selectedOption": "0",

    //Dont place on loyalty chest.
    //Place regardless = 0. Place if at least bronze = 1 Place if at least silver = 2. Place if at least gold = 3. Place if only diamond = 4
    "loyalty": "0",

    //Force switch captains that aren't masterlisted.
    "liveMasterSwitch": false,
    //Force replace captains that are lower on the masterlist (e.g. 10th captain on the list gets replaced by 1st captain)
    "priorityMasterSwitch": false,
    //Masterlist has priority when switching an idle captain.
    "idleMasterSwitch": false,
    //Leave slot empty if no masterlist is live.
    "skipIdleMasterSwitch": false,
};

async function setStorage() {
    // Use chrome.storage.local to set the data
    chrome.storage.local.set(dataToSet, function () {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
        }
    });
}