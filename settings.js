
let unitsArrayList = undefined;
let arrayOfFetchedUnits = [];
let idleCheckboxes = ['idleSwitch0_Campaign','idleSwitch1_Campaign','idleSwitch2_Campaign','idleSwitch3_Campaign','idleSwitch4_Campaign','idleSwitch1_Dungeon','idleSwitch2_Dungeon','idleSwitch3_Dungeon','idleSwitch4_Dungeon','idleSwitch0_Clash','idleSwitch1_Clash','idleSwitch2_Clash','idleSwitch3_Clash','idleSwitch4_Clash','idleSwitch1_Duel','idleSwitch2_Duel','idleSwitch3_Duel','idleSwitch4_Duel'];
//This script handles the user interaction with the toggle switches and radio buttons on the popup of the extension.

//Event listener to initialize the switches as well as update their states
document.addEventListener("DOMContentLoaded", function () {
    initializeSwitch("darkSwitch");
    initializeSwitch("questSwitch");
    initializeSwitch("scrollSwitch");
    initializeSwitch("extraSwitch");
    initializeSwitch("commonSwitch");
    initializeSwitch("uncommonSwitch");
    initializeSwitch("rareSwitch");
    initializeSwitch("legendarySwitch");
    initializeSwitch("dungeonSwitch");
    initializeSwitch("dungeonLevelSwitch");
    initializeSwitch("dungeonBossPotionSwitch");
    initializeSwitch("duelSwitch");
    initializeSwitch("clashSwitch");
    initializeSwitch("multiClashSwitch");
    initializeSwitch("nextClashSwitch");
    initializeSwitch("pvpSpecSwitch");
    initializeSwitch("soulSwitch0");
    initializeSwitch("soulSwitch1");
    initializeSwitch("soulSwitch2");
    initializeSwitch("soulSwitch3");
    initializeSwitch("soulSwitch4");
    initializeSwitch("soulSwitch5");
    initializeSwitch("soulSwitch6");
    initializeSwitch("soulSwitch7");
    initializeSwitch("modeChangeSwitch");
    initializeSwitch("modeChangeLeaveSwitch");
    initializeSwitch("campaignSwitch");
    initializeSwitch("battlepassSwitch");
    initializeSwitch("shuffleSwitch0");
    initializeSwitch("shuffleSwitch1");
    initializeSwitch("shuffleSwitch2");
    initializeSwitch("shuffleSwitch3");
    initializeSwitch("shuffleSwitch4");
    initializeSwitch("shuffleSwitch5");
    initializeSwitch("shuffleSwitch6");
    initializeSwitch("shuffleSwitch7");
    initializeSwitch("offlineSwitch");
    initializeSwitch("setMarkerSwitch");
    initializeSwitch("skipSwitch");
    initializeSwitch("completeQuests");
    initializeSwitch("dailySwitch");
    initializeSwitch("eventChestSwitch");
    initializeSwitch("equipSwitch");
    initializeSwitch("equipNoDiamondSwitch");
    initializeSwitch("favoriteSwitch");
    initializeSwitch("liveMasterSwitch");
    initializeSwitch("priorityMasterSwitch");
    initializeSwitch("idleMasterSwitch");
    initializeSwitch("skipIdleMasterSwitch");
    initializeSwitch("priorityListSwitch0");
    initializeSwitch("priorityListSwitch1");
    initializeSwitch("priorityListSwitch2");
    initializeSwitch("priorityListSwitch3");
    initializeSwitch("priorityListSwitch4");
    initializeSwitch("priorityListSwitch5");
    initializeSwitch("priorityListSwitch6");
    initializeSwitch("priorityListSwitch7");
    initializeSwitch("lgoldSwitch");
    initializeSwitch("lskinSwitch");
    initializeSwitch("lscrollSwitch");
    initializeSwitch("ltokenSwitch");
    initializeSwitch("lbossSwitch");
    initializeSwitch("lsuperbossSwitch");
    initializeSwitch("afterSwitch");
    initializeSwitch("duelsSlotSwitch");
    initializeSwitch("skipDuelsSlotSwitch");
    initializeSwitch("clashSlotSwitch");
    initializeSwitch("skipClashSlotSwitch");
    initializeSwitch("levelSwitch");
    initializeSwitch("chestSwitch");
    initializeSwitch("moreSkinsSwitch");
    initializeReloader("reloaderInput");
    initializeReloader("minimumCurrencyInput");
    initializeReloader("maxUnitLvlDungInput");
    initializeReloader("maxDungeonLvlInput");
    initializeReloader("userIdleTimeInput");
    initializeReloader("userWaitTimeInputCampaign");
    initializeReloader("userWaitTimeInputDungeons");
    initializeReloader("userWaitTimeInputPVP");
    initializeReloader("placementOddsInput")
    initializeReloader("veInput");
    initializeReloader("eInput");
    initializeReloader("mInput");
    initializeReloader("hInput");
    initializeReloader("vhInput");
    initializeReloader("iInput");
    initializeReloader("bInput");
    initializeReloader("ebInput");
    initializeReloader("bronzeInput");
    initializeReloader("silverInput");
    initializeReloader("goldInput");
    initializeReloader("lGoldInput");
    initializeReloader("lSkinInput");
    initializeReloader("lTokenInput");
    initializeReloader("lScrollInput");
    initializeReloader("BossInput");
    initializeReloader("sBossInput");
    
    document.getElementById("importSettingsToFileBtn").addEventListener("change", async function () {
        importSettingsFromFile()
    });

    document.getElementById("exportSettingsToFileBtn").addEventListener("click", async function () {
        exportSettingsToFile()
    });
});

//When the user interacts with the toggle switches, it gets the current stored value and update them with the value.
function initializeSwitch(switchId) {
    const switchElement = document.getElementById(switchId);
    if (switchElement == null) return;
    // Load switch state from storage
    chrome.storage.local.get([switchId], function (result) {
        switchElement.checked = result[switchId] || false;
    });
}

//Event listener to initialize the radio buttons as well as update their states
document.addEventListener("DOMContentLoaded", async function () {
    let darkTheme;
    let switchResult = await chrome.storage.local.get(['darkSwitch'])
    let darkSwitch = switchResult["darkSwitch"];
    if (darkSwitch == false) {
        darkTheme = "light";
    } else {
        darkTheme = "dark";
    }
    document.querySelector("html").setAttribute("data-theme", darkTheme);

    const scrollToTopBtn = document.getElementById("scrollBtn");
    if (scrollToTopBtn == null) return;

    // Show or hide the button based on scroll position
    window.onscroll = function () {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            scrollToTopBtn.style.display = "block";
        } else {
            scrollToTopBtn.style.display = "none";
        }
    };

    // Scroll back to the top when the button is clicked
    scrollToTopBtn.addEventListener("click", function () {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    });  
  
    //Function to save the new radio button state on the storage
    function handlePotionRadioButtonChange() {
        let selectedOption = document.querySelector('input[name="potion"]:checked').value;
        chrome.storage.local.set({ selectedOption: selectedOption }, function () {
            if (chrome.runtime.lastError) {
                loadBanner(failureMessage, redColor);
            } else {
                loadBanner(successMessage, greenColor);
            }
        });
    }

    setInputButtonListener('reloaderButton', 'reloaderInput');
    setInputButtonListener('minimumCurrencyButton', 'minimumCurrencyInput');
    setInputButtonListener('minUnitLvlButton', 'maxUnitLvlDungInput');
    setInputButtonListener('minDungeonLvlButton', 'maxDungeonLvlInput');
    setInputButtonListener('idleTimeButton', 'userIdleTimeInput');
    setInputButtonListener('waitTimeCampaignButton', 'userWaitTimeInputCampaign');
    setInputButtonListener('waitTimeDungeonButton', 'userWaitTimeInputDungeons');
    setInputButtonListener('waitTimePvpButton', 'userWaitTimeInputPVP');
    setInputButtonListener('placeOddButton', 'placementOddsInput');
    setInputButtonListener('veButton', 'veInput');
    setInputButtonListener('eButton', 'eInput');
    setInputButtonListener('mButton', 'mInput');
    setInputButtonListener('hButton', 'hInput');
    setInputButtonListener('vhButton', 'vhInput');
    setInputButtonListener('iButton', 'iInput');
    setInputButtonListener('bButton', 'bInput');
    setInputButtonListener('ebButton', 'ebInput');
    setInputButtonListener('bronzeButton', 'bronzeInput');
    setInputButtonListener('silverButton', 'silverInput');
    setInputButtonListener('goldButton', 'goldInput');
    setInputButtonListener('lGoldButton', 'lGoldInput');
    setInputButtonListener('lSkinButton', 'lSkinInput');
    setInputButtonListener('lTokenButton', 'lTokenInput');
    setInputButtonListener('lScrollButton', 'lScrollInput');
    setInputButtonListener('BossButton', 'BossInput');
    setInputButtonListener('sBossButton', 'sBossInput');

    //Event listener for when the potion radio button is changed by the user
    let potionRadioButtons = document.querySelectorAll('input[name="potion"]');
    potionRadioButtons.forEach(function (radioButton) {
        radioButton.addEventListener("change", handlePotionRadioButtonChange);
    });

    //Get potion radio button state from storage and set the button with the value for the user to visually see
    chrome.storage.local.get(["selectedOption"], function (result) {
        let savedOption = result.selectedOption;
        if (savedOption) {
            let radioToCheck = document.querySelector('input[name="potion"][value="' + savedOption + '"]');
            if (radioToCheck) {
                radioToCheck.checked = true;
            }
        }
    });

    //Function to save the new radio button state on the storage
    function handleLoyaltyRadioButtonChange() {
        let loyaltyOption = document.querySelector('input[name="loyalty"]:checked').value;
        chrome.storage.local.set({ loyalty: loyaltyOption }, function () {
            if (chrome.runtime.lastError) {
                loadBanner(failureMessage, redColor);
            } else {
                loadBanner(successMessage, greenColor);
            }
        });
    }

    // Event listener for when the loyalty radio button is changed by the user
    let loyaltyRadioButtons = document.querySelectorAll('input[name="loyalty"]');
    loyaltyRadioButtons.forEach(function (radioButton) {
        radioButton.addEventListener("change", handleLoyaltyRadioButtonChange);
    });

    //Get loyalty radio button state from storage and set the button with the value for the user to visually see
    chrome.storage.local.get(["loyalty"], function (result) {
        let savedOption = result.loyalty;
        if (savedOption) {
            let radioToCheck = document.querySelector('input[name="loyalty"][value="' + savedOption + '"]');
            if (radioToCheck) {
                radioToCheck.checked = true;
            }
        }
    });
    
    document.getElementById("dungeonBossPotionSwitch").addEventListener('change', function(event) {
      if (this.checked) {
        alert("Use at your own risk. This increases chances of the captain banning you");
      }
    });
    
    // Get every check box by using querySelectorAll
    document.querySelectorAll(".modeChangeCheckbox").forEach(
    // For each check box add on click event listener
      input => input.addEventListener('click', function(event) {
      // get number of check boxes by passing :check attribute to the query selector
        let checkedBoxes = document.querySelectorAll(".modeChangeCheckbox:checked");
        
        // check if the number of checked boxes are more than allowed limit
        if(checkedBoxes.length > 1){
          for (let checkedBox in checkedBoxes) {
            if (checkedBoxes[checkedBox] != event.currentTarget) {
              checkedBoxes[checkedBox].checked = false;
              chrome.storage.local.set({ [checkedBoxes[checkedBox].id]: false });
            }
          }
        }
      })
    );
});

function setInputButtonListener(buttonId, inputId) {
    document.getElementById(buttonId).addEventListener('click', function () {
        const inputValue = document.getElementById(inputId).value;
        if (inputValue != undefined || inputValue != null) {
            const storageObject = {};
            storageObject[inputId] = inputValue;

            chrome.storage.local.set(storageObject, function () {
                if (chrome.runtime.lastError) {
                    loadBanner(failureMessage, redColor);
                } else {
                    loadBanner(successMessage, greenColor);
                }
            });
        }
    });
}


const successMessage = "Settings updated sucessfully";
const failureMessage = "Failed to update settings";
const redColor = "red";
const greenColor = "#5fa695";


function loadBanner(message, color) {
    //If the user rapid clicks, it removes the button if it exists so a new one can be injected
    let customBanner = document.querySelector(".custom_banner");
    if (customBanner) {
        customBanner.remove();
    }

    //Banner styles so a retangle can be displayed on the center of the screen
    const bannerStyles = `
        background-color: ${color};
        zIndex: 9999;
        color: white;
        position: fixed;
        font-size: xxx-large;
        text-align: center;
        padding: 10px;
        width: 100%;
    `;

    //Creates the element
    const banner = document.createElement("div");
    banner.className = "custom_banner";
    banner.textContent = message;
    banner.style.cssText = bannerStyles;

    //Injects the element
    const mainDiv = document.querySelector(".main");
    mainDiv.appendChild(banner);

    //Removes the element after 500 milliseconds.
    setTimeout(function () {
        banner.remove();
    }, 400);
}

async function initializeReloader(key) {
    const result = await new Promise((resolve) => {
        chrome.storage.local.get([key], function (result) {
            resolve(result);
        });
    });

    const reloaderInput = result[key];
    if (reloaderInput !== undefined) {
        document.getElementById(key).value = reloaderInput;
    }
}

function importSettingsFromFile() {
    const fileInput = document.getElementById("importSettingsToFileBtn").files[0];

    if (!fileInput) {
        alert('Please select a file!');
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
        try {
            const data = JSON.parse(e.target.result);
            chrome.storage.local.set(data, function () {
                console.log('Settings imported successfully.');
            });
        } catch (error) {
            alert('An error occurred: ' + error);
        }
    };

    reader.readAsText(fileInput);
    location.reload()
}


function exportSettingsToFile() {
    const keysToExport = [
        "darkSwitch",
        "reloaderInput",
        "minimumCurrencyInput",
        "maxUnitLvlDungInput",
        "maxDungeonLvlInput",
        "userIdleTimeInput",
        "userWaitTimeInputCampaign",
        "userWaitTimeInputDungeons",
        "userWaitTimeInputPVP",
        "placementOddsInput",
        "offlineSwitch",
        "skipSwitch",
        "setMarkerSwitch",
        "scrollSwitch",
        "extraSwitch",
        "questSwitch",
        "dailySwitch",
        "eventChestSwitch",
        "battlepassSwitch",
        "logSwitch",
        "captIdSwitch",
        "raidIdSwitch",
        "pendingSwitch",
        "dungeonPVPSwitch",
        "shuffleSwitch0",
        "shuffleSwitch1",
        "shuffleSwitch2",
        "shuffleSwitch3",
        "shuffleSwitch4",
        "shuffleSwitch5",
        "shuffleSwitch6",
        "shuffleSwitch7",
        "equipSwitch",
        "equipNoDiamondSwitch",
        "moreSkinsSwitch",
        "completeQuests",
        "priorityListSwitch0",
        "priorityListSwitch1",
        "priorityListSwitch2",
        "priorityListSwitch3",
        "priorityListSwitch4",
        "priorityListSwitch5",
        "priorityListSwitch6",
        "priorityListSwitch7",
        "commonSwitch",
        "uncommonSwitch",
        "rareSwitch",
        "legendarySwitch",
        "campaignSwitch",
        "duelSwitch",
        "clashSwitch",
        "multiClashSwitch",
        "nextClashSwitch",
        "pvpSpecSwitch",
        "soulSwitch0",
        "soulSwitch1",
        "soulSwitch2",
        "soulSwitch3",
        "soulSwitch4",
        "soulSwitch5",
        "soulSwitch6",
        "soulSwitch7",
        "modeChangeSwitch",
        "modeChangeLeaveSwitch",
        "dungeonSwitch",
        "dungeonLevelSwitch",
        "dungeonBossPotionSwitch",
        "liveMasterSwitch",
        "priorityMasterSwitch",
        "idleMasterSwitch",
        "skipIdleMasterSwitch",
        "afterSwitch",
        "loyalty",
        "lgoldSwitch",
        "lskinSwitch",
        "lscrollSwitch",
        "ltokenSwitch",
        "lbossSwitch",
        "lsuperbossSwitch",
        "favoriteSwitch",
        "selectedOption",
        "levelSwitch",
        "veInput",
        "eInput",
        "mInput",
        "hInput",
        "vhInput",
        "iInput",
        "bInput",
        "ebInput",
        "chestSwitch",
        "bronzeInput",
        "silverInput",
        "goldInput",
        "lGoldInput",
        "lSkinInput",
        "lTokenInput",
        "lScrollInput",
        "BossInput",
        "sBossInput",
        "duelsSlotSwitch",
        "skipDuelsSlotSwitch",
        "clashSlotSwitch",
        "skipClashSlotSwitch"
    ]

    chrome.storage.local.get(keysToExport, function (data) {
        const exportedData = {};
        keysToExport.forEach(key => {
            exportedData[key] = data[key];
        });

        const json = JSON.stringify(exportedData, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "SRHelper_Settings.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}