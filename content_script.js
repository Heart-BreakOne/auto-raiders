/* This file is the heart of the extension, it performs the auto playing, invokes functions to set and get values as well as
functions to perform tasks such as replacing idle captains or buying scrolls
*/

//Triggers the start function every 20 seconds
setInterval(start, 20000);

//Declares/initializes variables
let currentMarkerKey = "";
let currentMarker;
let arrayOfMarkers;
let markerAttempt;
let computedStyle;
let backgroundImageValue;
let mode;
let diamondLoyalty;
let arrayOfAllyPlacement;
let firstReload;
let captainNameFromDOM;
let arrayOfSkinUnits;
const blue = 'rgb(185, 242, 255)';
const red = 'rgb(255, 204, 203)';
const purple = 'rgb(203, 195, 227)';
const gameBlue = 'rgb(42, 96, 132)';
const cancelButtonSelector = ".actionButton.actionButtonNegative.placerButton";
let delay = ms => new Promise(res => setTimeout(res, ms));

//Battlefield markers.
const arrayOfBattleFieldMarkers = [
  { key: "NO", icon: "SVFCVFFVKM+J2ICS+HWVYAAAAASUVORK5CYII=" },
  { key: "VIBE", icon: "1EPFWIYQTQRB9OWOGAAAABJRU5ERKJGGG" },
  { key: "ARMORED", icon: "ADCFHG0NPVXLAAAAAELFTKSUQMCC" },
  { key: "ASSASSIN", icon: "AJRY4S+IIEGAAAABJRU5ERKJGGG==" },
  { key: "MELEE", icon: "4HMCIMNBN" },
  { key: "RANGED", icon: "BSBDMAAZVZ+IAAAAAELFTKSUQMCC" },
  { key: "SUPPORT", icon: "RWRLLLPGN4N+DRB7+UDVYFQAAAABJRU5ERKJGGG" },
  { key: "AMAZON", type: "MELEE", icon: "NAMVYSLRIQJS202XHJVO5EQBTUZG9FDQ38LWVXKFCRKB" },
  { key: "ARCHER", type: "RANGED", icon: "EX5GK5JX6QAAAABJRU5ERKJGGG==" },
  { key: "ARTILLERY", type: "RANGED", icon: "U1JPAB82/+YAAAAASUVORK5CYII=" },
  { key: "BALLOON", type: "RANGED", icon: "RNP6GWGFWBAAAAAASUVORK5CYII=" },
  { key: "BARBARIAN", type: "MELEE", icon: "FATYXSR+E/WDKLH2H07GGIAAAAAASUVORK5CYII=" },
  { key: "BERSERKER", type: "MELEE", icon: "LP02Y0OXNNIIR/ANXBM2OH2VJAAAAAAELFTKSUQMCC" },
  { key: "BLOB", type: "ARMORED", icon: "9HYQZQGNN8FEO4736EWIBO1BLLOJKAAAAAELFTKSUQMCC" },
  { key: "BOMBER", type: "RANGED", icon: "EN4FFSJSC5V5VTWAAAAASUVORK5CYII=" },
  { key: "BUSTER", type: "ASSASSIN", icon: "QXWTF98VOWAAAABJRU5ERKJGGG==" },
  { key: "CENTURION", type: "ARMORED", icon: "JONSVOPYO0WAAAABJRU5ERKJGGG==" },
  { key: "FAIRY", type: "SUPPORT", icon: "BUF7V5FSF2AUWAAAABJRU5ERKJGGG==" },
  { key: "FLAG", type: "MELEE", icon: "2SGX8QVWDHGXEX3KATHAAAAABJRU5ERKJGGG==" },
  { key: "FLYING", type: "ASSASSIN", icon: "SC0O8MLG/J0AAAAASUVORK5CYII=" },
  { key: "GLADIATOR", type: "MELEE", icon: "DD+SKZMJLHL0WU+O7FOF4PXJB9MFKO1NWAAAAASUVORK5CYII=" },
  { key: "HEALER", type: "SUPPORT", icon: "APNHO7KH5SSIGAAAAASUVORK5CYII=" },
  { key: "LANCER", type: "MELEE", icon: "6OT5/TRXJXQAAAABJRU5ERKJGGG==" },
  { key: "MAGE", type: "RANGED", icon: "+ZDZ7CMO0CKY3QAAAABJRU5ERKJGGG==" },
  { key: "MONK", type: "SUPPORT", icon: "AJVBIHGQ88WRAAAAAELFTKSUQMCC" },
  { key: "MUSKETEER", type: "RANGED", icon: "WTNKKINA8XM9K25P3UMNHIP8BRTLJNU/YGNMAAAAASUVORK5CYII=" },
  { key: "NECROMANCER", type: "SUPPORT", icon: "AFPYH+BYJBNJJ45EQMAAAAAELFTKSUQMCC" },
  { key: "ORC", type: "ARMORED", icon: "GGDIMS8UWTIOQAAAABJRU5ERKJGGG==" },
  { key: "PALADIN", type: "ARMORED", icon: "/WF8A3HDJ56JXWOEAAAAAELFTKSUQMCC" },
  { key: "ROGUE", type: "ASSASSIN", icon: "AVWRY3TV3QVIAAAAAELFTKSUQMCC" },
  { key: "SAINT", type: "SUPPORT", icon: "GF4GO32S6BUXVSAAAAAASUVORK5CYII=" },
  { key: "SHINOBI", type: "ASSASSIN", icon: "MG5B+UIFEWCI/EWAAAAABJRU5ERKJGGG==" },
  { key: "SPY", type: "ASSASSIN", icon: "TQZAPQNZN6GAAAAASUVORK5CYII=" },
  { key: "TANK", type: "ARMORED", icon: "AMPQZDTC4D3FPWXEZVK5DLEFAAAAAELFTKSUQMCC" },
  { key: "TEMPLAR", type: "SUPPORT", icon: "YHF+H+B8TRVPZFQHDVGAAAABJRU5ERKJGGG==" },
  { key: "VAMPIRE", type: "ARMORED", icon: "M9WGHTKW8VY7ALV0IJJZRQQH78C0IFEII3WRZBAAAAAELFTKSUQMCC" },
  { key: "WARBEAST", type: "MELEE", icon: "/AVEH3CXL9OH4WAAAABJRU5ERKJGGG==" },
  { key: "WARRIOR", type: "MELEE", icon: "GXC5CPDJVY5YIAAAAASUVORK5CYII=" },
];

//Unit icons markers (the icon on the top left corner of the unit square)
const arrayOfUnits = [
  { key: "", type: "", icon: "" },
  { key: "VIBE", type: "VIBE", icon: "VIBE" },
  { key: "AMAZON", type: "MELEE", icon: "6E8FWQ9MA9ZAAJ2WXSHI1NVQ5GDJRPXQ7V8AHO" },
  { key: "ARCHER", type: "RANGED", icon: "FBPKAZY" },
  { key: "ARTILLERY", type: "RANGED", icon: "3GY1DLAQ" },
  { key: "BALLOON", type: "RANGED", icon: "FOPPA6G" },
  { key: "BARBARIAN", type: "MELEE", icon: "Y2AZRA3G" },
  { key: "BERSERKER", type: "MELEE", icon: "BCIAAA" },
  { key: "BLOB", type: "ARMORED", icon: "LXTAAA" },
  { key: "BOMBER", type: "RANGED", icon: "QWP8WBK" },
  { key: "BUSTER", type: "ASSASSIN", icon: "PCCPYIHW" },
  { key: "CENTURION", type: "ARMORED", icon: "DUWAAA" },
  { key: "FAIRY", type: "SUPPORT", icon: "FNJQA" },
  { key: "FLAG", type: "MELEE", icon: "KF7A" },
  { key: "FLYING", type: "ASSASSIN", icon: "GSGE2MI" },
  { key: "GLADIATOR", type: "MELEE", icon: "EMWA84U" },
  { key: "HEALER", type: "SUPPORT", icon: "UY3N8" },
  { key: "LANCER", type: "MELEE", icon: "PU+OGW" },
  { key: "MAGE", type: "RANGED", icon: "4Q+BQML8" },
  { key: "MONK", type: "SUPPORT", icon: "D46EKXW" },
  { key: "MUSKETEER", type: "RANGED", icon: "DL9SBC7G" },
  { key: "NECROMANCER", type: "SUPPORT", icon: "85VI" },
  { key: "ORC", type: "ARMORED", icon: "VPAASGY8" },
  { key: "PALADIN", type: "ARMORED", icon: "IYUEO" },
  { key: "ROGUE", type: "ASSASSIN", icon: "GRJLD" },
  { key: "SAINT", type: "SUPPORT", icon: "PBUHPCG" },
  { key: "SHINOBI", type: "ASSASSIN", icon: "XSCZQ" },
  { key: "SPY", type: "ASSASSIN", icon: "FJBDFFQ" },
  { key: "TANK", type: "ARMORED", icon: "XEK7HQU" },
  { key: "TEMPLAR", type: "SUPPORT", icon: "CYNUL" },
  { key: "VAMPIRE", type: "ARMORED", icon: "BL5378" },
  { key: "WARBEAST", type: "MELEE", icon: "SRJSYO" },
  { key: "WARRIOR", type: "MELEE", icon: "YTUUAHQ" },
];

// This is the start, it selects a captain placement as well as collect any rewards to proceed
async function start() {

  //Reload tracker
  if (firstReload === undefined) {
    firstReload = new Date();
  }
  //Keep track of time and reload after 1hr15min to avoid the browser crashing due to low memory.
  const elapsedMinutes = Math.floor((new Date() - firstReload.getTime()) / (1000 * 60));
  const timeContainer = document.querySelector(".elapsedTimeContainer");
  if (timeContainer && (elapsedMinutes !== null || elapsedMinutes !== undefined)) {
    timeContainer.innerHTML = `Last refresh: ${elapsedMinutes} minutes ago.`;
  }
  if (elapsedMinutes >= 75) {
    location.reload();
  }

  //Initialized nav items, if they don't exist it means the extension is already executing.
  const navItems = document.querySelectorAll('.mainNavItemText');
  const settingsIframe = document.querySelectorAll('.outer_container');
  if (navItems.length === 0 || navItems === undefined || settingsIframe.length != 0) {
    return;
  } else {
    //If navItem exists, open main menu
    for (let i = 0; i < navItems.length; i++) {
      let navItem = navItems[i];
      if (navItem.innerText === "Battle") {
        navItem.click();
        await delay(2000);
        break;
      }
    }
  }

  //Checks if the user wants to replace idle captains and invoke the function to check and replace them.
  const offline = await retrieveFromStorage("offlineSwitch")
  if (offline) {
    await checkIdleCaptains()
  }

  // Collects chests and savages rewards
  await collectChests();

  // Collects rewards if there are any
  const rewardButton = document.querySelector(".actionButton.actionButtonPrimary.rewardsButton");
  if (rewardButton) {
    rewardButton.click();
  }

  captainNameFromDOM = "";
  //Initialized a node list with placeable buttons
  const placeUnitButtons = document.querySelectorAll(".actionButton.actionButtonPrimary.capSlotButton.capSlotButtonAction");
  let placeUnit = null;
  //If there are no place unit buttons, invoke the collection function then return.
  if (placeUnitButtons.length == 0 || (placeUnitButtons.length == 1 && placeUnitButtons[0].innerText === "SUBMIT")) {
    await performCollection();
    return;
  }
  //If placement buttons exist, validate them
  else if (placeUnitButtons.length != 0) {
    //Iterate through every button
    for (var button of placeUnitButtons) {
      //If the button has the inner text PLACE UNIT it's a valid button
      if (button.innerText.includes("PLACE UNIT")) {
        //Get captain name from the slot
        var captainSlot = button.closest('.capSlot');
        captainNameFromDOM = captainSlot.querySelector('.capSlotName').innerText;
        //Retrieve the slot pause state
        const btn = captainSlot.querySelector(".capSlotStatus .offlineButton");
        const buttonId = btn.getAttribute('id');
        const slotState = await getIdleState(buttonId);
        //If slot state is true, move to the next slot
        if (!slotState) {
          continue
        }
        //Check if the captain is the one running a game mode
        const dungeonCaptainNameFromStorage = await retrieveFromStorage('dungeonCaptain');
        const clashCaptainNameFromStorage = await retrieveFromStorage('clashCaptain');
        const duelsCaptainNameFromStorage = await retrieveFromStorage('duelCaptain');
        //Check if the user wants multiple units to be placed on special modes
        const clashSwitch = await retrieveFromStorage('clashSwitch');
        const dungeonSwitch = await retrieveFromStorage('dungeonSwitch');
        const duelSwitch = await retrieveFromStorage('duelSwitch');
        let captainFlag
        let captainLoyalty

        //Pass captain name and check if the captain is flagged
        try {
          captainFlag = await getCaptainFlag(captainNameFromDOM, 'flaggedCaptains');
          //Make a second attempt to set loyalty flag
        } catch (error) {
          captainFlag = false
        }
        //Pass captain name and check if the captain has a loyalty flag.
        if (await retrieveFromStorage('loyaltySwitch')) {
          try {
            captainLoyalty = await getCaptainFlag(captainNameFromDOM, 'captainLoyalty');
            if (!captainLoyalty || captainLoyalty == undefined) {
              captainLoyalty = await requestLoyalty(captainNameFromDOM);
            }
          } catch (error) {
            captainLoyalty = false;
          }
        } else {
          captainLoyalty = false;
        }
        //If captain has any flags, change color and move to the next slot
        if (captainLoyalty || captainFlag) {
          if (captainLoyalty) {
            captainSlot.style.backgroundColor = blue;
          }
          continue;
        } else {
          captainSlot.style.backgroundColor = gameBlue;
        }

        /* Check if the captain is running a special game mode and if the same captain is the one in storage.
        So if the dungeon captain on storage is Mike and there is another captain name John also running a dungeon
        the captain John will be skipped, this is done so only one captain runs a special mode at any given time and keys don't get reset.  */
        if ((dungeonCaptainNameFromStorage != captainNameFromDOM) && captainSlot.innerText.includes("Dungeons") ||
          (clashCaptainNameFromStorage != captainNameFromDOM) && captainSlot.innerText.includes("Clash") ||
          (duelsCaptainNameFromStorage != captainNameFromDOM) && captainSlot.innerText.includes("Duel")) {
          continue
        }
        /* Checks if the captain saved on storage running a special mode is still running the same mode, if they change they might lock
        the slot for 30 minutes so if a captain switches to campaign they are skipped and colored red */
        else if ((dungeonCaptainNameFromStorage == captainNameFromDOM) && !captainSlot.innerText.includes("Dungeons") ||
          (clashCaptainNameFromStorage == captainNameFromDOM) && !captainSlot.innerText.includes("Clash") ||
          (duelsCaptainNameFromStorage == captainNameFromDOM) && !captainSlot.innerText.includes("Duel")) {
          captainSlot.style.backgroundColor = red;
          continue
        }
        /* Checks if the slot is a special game mode and if a unit has already been placed it check if the user wants to place
        multiple units on special modes */
        else if (((captainSlot.innerText.includes("Dungeons") && !dungeonSwitch) || (captainSlot.innerText.includes("Clash") && !clashSwitch) ||
          ((captainSlot.innerText.includes("Duel") && !duelSwitch))) &&
          captainSlot.querySelector('.capSlotClose') == null) {
          continue
        }
        //If all is clear, it checks if the captain is diamond loyalty for future comparison.
        //Assigns the placeUnit button and breaks.
        else {
          diamondLoyalty = false;
          diamondLoyalty = captainSlot.outerHTML.includes('LoyaltyDiamond');
          placeUnit = button
          break;
        }
      } else {
        continue;
      }
    }
  }

  //If place unit exists, clicks it and loads the invokes the openBattlefield function
  if (placeUnit) {
    placeUnit.click();
    await delay(1000);
    openBattlefield();
  } else {
    await performCollection();
    return;
  }

  // Change captains using a different device without the script freezing trying to select a captain.
  closeAll();
}

async function performCollection() {
  await collectQuests();
  await buyScrolls();
  await collectFreeDaily();
  await collectBattlePass();
}

// This function checks if the battlefield is present, the current chest type, then zooms into it.
async function openBattlefield() {

  // Attempts to check if battlefield is open
  let battleInfo
  try {
    battleInfo = document.querySelector(".battleInfo").innerText;
  } catch (error) {
    return;
  }
  mode = false;
  //Duels and clash strings here.
  if (battleInfo.includes("Level") || battleInfo.includes("Versus")) {
    mode = true;
  }
  //Check if user wants to preserve diamond loyalty
  let preserveDiamond = await retrieveFromStorage('loyaltySwitch');

  if (preserveDiamond === null || preserveDiamond === undefined) {
    preserveDiamond = false;
  }
  //User wants to preserve diamond loyalty and current captain is not diamond and current mode is campaign
  if (preserveDiamond && !diamondLoyalty && mode == false) {
    //Opens battle info and checks chest type.
    battleInfo = document.querySelector(".battleInfoMapTitle")
    battleInfo.click();
    await delay(2000);
    let chest;
    try {
      chest = document.querySelector(".mapInfoRewardsName").innerText;
      closeAll();
    } catch (error) {
      goHome();
      return;
    }
    if (chest.includes("Loyalty")) {
      //Flag the captain loyalty since the current map is to be skipped
      await flagCaptain('captainLoyalty');
      //Close the chest info popup and return to main menu
      closeAll();
      goHome();
      return;
    } else {
      //Current chest is not special, close chest info and zoom
      closeAll();
      zoom();
    }
    diamondLoyalty = false;
  } else {
    //User doesn't want to preserve diamond loyalty
    zoom();
  }
}

//Zooms into the battlefield
function zoom() {
  const zoomButton = document.querySelector(".fas.fa-plus");
  if (zoomButton) {
    for (let i = 0; i < 7; i++) {
      zoomButton.click();
    };
    //Resets tracking variables
    markerAttempt = 0;
    arrayOfMarkers = null;
    currentMarker = null;
    //Invoke getValidMarkers function
    getValidMarkers();
  }
}

//Looks and selects a valid marker for placement
async function getValidMarkers() {
  //Function to check for a frozen state
  reloadRoot();
  await delay(1000);
  //Initializes a node list with placement markers
  let nodeListOfMarkers = document.querySelectorAll(".planIcon");
  arrayOfMarkers = Array.from(nodeListOfMarkers);
  nodeListOfMarkers = null;

  const clockElement = document.querySelector('.battlePhaseTextClock .clock');
  if (clockElement == null) {
    goHome();
    return;
  } else {
    //Initializes a variable with battle clock
    const timeText = clockElement.innerText.replace(':', '');
    const time = parseInt(timeText, 10);
    //If the timer is at 29:00 or above, go back to the main menu as the captain may still place be placing markers.
    if (time > 2830) {
      goHome();
      return;
    }
  }
  //Captain is on open map only
  if (arrayOfMarkers.length == 0) {
    //Map without any markers.
    //If captain haven't placed any markers, initialize a node list with ally placements
    arrayOfAllyPlacement = document.querySelectorAll(".placementAlly");
    //Get one position within the ally placements
    currentMarker = arrayOfAllyPlacement[Math.floor(Math.random() * arrayOfAllyPlacement.length)];
    //Scroll into the currentMarker position
    moveScreenRandomPosition();
    //There are markers of some kind in the map.
  } else {
    //Treat the markers to remove block markers
    for (let i = arrayOfMarkers.length - 1; i >= 0; i--) {
      let planIcon = arrayOfMarkers[i];
      let backgroundImageValue = getComputedStyle(planIcon).getPropertyValue('background-image').toUpperCase();
      if (backgroundImageValue.includes("SVFCVFFVKM+J2ICS+HWVYAAAAASUVORK5CYII=")) {
        arrayOfMarkers.splice(i, 1);
      }
    }

    //Check what is inside new array.
    if (arrayOfMarkers.length == 0 && (arrayOfAllyPlacement == undefined || arrayOfAllyPlacement.length == 0)) {
      //Captain is using a mix of block markers and open zones
      await flagCaptain('flaggedCaptains');
      goHome();
      return;
    } else {
      //There are vibe or set markers that can be used.
      getSetMarker();
    }
  }
}

async function getSetMarker() {
  let matchingMarker;
  //This indicates that an attempt to place at the current marker has been made
  if (markerAttempt >= 1) {
    //Attemps to get a matching marker
    try {
      matchingMarker = arrayOfBattleFieldMarkers.find(marker => marker.key === currentMarkerKey).icon;
    } catch (error) {
      goHome();
      return;
    }
    //Removes current marker from the page as they can't be used
    for (let i = arrayOfMarkers.length - 1; i >= 0; i--) {
      let planIcon = arrayOfMarkers[i];
      let backgroundImageValue = getComputedStyle(planIcon).getPropertyValue('background-image').toUpperCase();

      // Define the condition to match elements you want to remove
      if (backgroundImageValue.includes(matchingMarker)) {
        try {
          // Remove the element from the array using splice
          arrayOfMarkers.splice(i, 1);
        } catch (error) {
          continue;
        }
      }
    }
  }
  if (arrayOfMarkers.length == 0) {
    //there are no units to match any of the available markers
    await flagCaptain('flaggedCaptains');
    goHome();
    return;
  } else {
    currentMarkerKey = ""
    // The randomization of the index increased the chances of getting a valid placement.
    currentMarker = arrayOfMarkers[Math.floor(Math.random() * (arrayOfMarkers.length - 1))];
    // This bit gets the marker type for comparison later
    computedStyle = getComputedStyle(currentMarker);
    backgroundImageValue = computedStyle.getPropertyValue('background-image').toUpperCase();
    //Checks if the marker is a valid placement marker and also get its type
    arrayOfBattleFieldMarkers.some(marker => {
      //If the current marker matches the items on the array of markers, it's a valid marker
      if (backgroundImageValue.includes(marker.icon)) {
        currentMarkerKey = marker.key
        for (let i = 0; i <= arrayOfUnits.length; i++) {
          const element = arrayOfUnits[i];
          if (currentMarkerKey === element.key || currentMarkerKey === element.type) {
            //If the marker is valid, moves to the center
            moveScreenCenter();
            return
            //break;
          }
        }
      }
    });
  }
}

//When there are no markers, it can be trick to scroll to a valid position into view, this randomizes the possible values.
const moveScreenRandomPosition = async () => {

  const positions = ['start', 'center', 'end', 'nearest'];
  const randomPosition = positions[Math.floor(Math.random() * positions.length)];
  await moveScreen(randomPosition);
}

//Vertical and horizontal center
async function moveScreenCenter() {
  await moveScreen('center');
}

//Scroll into view the center of the currentMark
async function moveScreen(position) {

  //Set marker dimensions to zero so the unit can fit in its place
  try {
    currentMarker.style.width = '0';
    currentMarker.style.height = '0';
    currentMarker.style.backgroundSize = '0';

    //Move screen so the current marker gets centered
    await delay(1000);
    if (currentMarker && currentMarker !== undefined && currentMarker !== null) {
      currentMarker.scrollIntoView({ block: 'center', inline: position });
    } else {
      goHome();
      return;
    }
    await delay(1000);
  } catch (error) {
    goHome();
    return;
  }
  await delay(1000);
  //Invokes unit selection
  selectUnit();
  await delay(1000);
  //Invokes selected unit placement.
  placeTheUnit();
  //Checks for frozen state
  reloadRoot();
}

/* This function opens the unit inventory tab, boosts unit and selects the first available unit that is allowed for usage,
isn't on cooldown, dead or exhausted. It also gets the unit name for future marker validation. */
async function selectUnit() {
  //Opens the unit drawer
  let placeUnitSelection = document.querySelector(".actionButton.actionButtonPrimary.placeUnitButton");
  if (placeUnitSelection) {
    placeUnitSelection.click();
  }

  //Set the unit drawer to the ALL units tab.
  let allUnitsButton = document.querySelector('.unitFilterButton');
  if (allUnitsButton) {
    allUnitsButton.click();
  }
  //Checks if user wants to use potions.
  let potionState = await getRadioButton();
  const favoriteSwitch = await getSwitchState("favoriteSwitch")
  let number;
  let epicButton;

  //User wants to use potions with specific captains.
  //Check if current captain is a favorite potion captain
  if (potionState != 0 && !mode && favoriteSwitch) {
    const potionCaptainsList = await new Promise((resolve) => {
      chrome.storage.local.get({ ['potionlist']: [] }, function (result) {
        const potionCaptainsList = result["potionlist"];
        resolve(potionCaptainsList);
      });
    });
    // Check if the array exists and is an array with at least one element
    if (Array.isArray(potionCaptainsList) && potionCaptainsList.length > 0) {
      //Check if current captain is a favorite potion captain. If not set potion state to 0.
      if (!potionCaptainsList.some(item => item.toUpperCase() === captainNameFromDOM.toUpperCase())) {
        potionState = 0;
      }
    } else {
      //The user wants to use potions with favorite potion captains, but the list is empty.
      potionState = 0;
    }
  }

  //User wants to use potions
  if (potionState != 0 && !mode) {
    //Get potion strings so the string can be trimmed and converted to int for validation
    let potions;
    //Attempts to get potion quantity
    try {
      potions = document.querySelector("img[alt='Potion']").closest(".quantityItem");
    } catch (error) {
      goHome();
      return;
    }
    let potionQuantity = potions.querySelector(".quantityText").textContent;
    epicButton = document.querySelector(".actionButton.actionButtonPrimary.epicButton");
    number = parseInt(potionQuantity.substring(0, 3));
  }
  //User wants to use potions as soon as there are at least 45 potions.
  if (potionState == 1 && number >= 45) {
    if (epicButton) {
      epicButton.click();
    }
    //User wants to use potions as soon as there are 100 potions.
  } else if (potionState && number == 100) {
    if (epicButton) {
      epicButton.click();
    }
  }
  //Handles unit drawer.
  let unitName = ""
  const unitDrawer = [...document.querySelectorAll(".unitSelectionCont")];
  //Initializes a node list with all units
  let unitsQuantity;
  //Attempts to get ammount of units in the units drawers
  try {
    unitsQuantity = unitDrawer[0].children.length;
  } catch (error) {
    goHome();
    return;
  }

  //Sort the array so units that match the captain skin are put on the front.
  async function shiftUnits() {
    for (let i = 1; i <= unitsQuantity; i++) {
      const unit = unitDrawer[0].querySelector(".unitSelectionItemCont:nth-child(" + i + ") .unitItem:nth-child(1)");
      if (unit.innerHTML.includes(captainNameFromDOM)) {
        const unitIndex = Array.from(unitDrawer[0].children).findIndex(item => item === unit.parentElement);
        if (unitIndex === -1) {
          continue;
        } else {
          unitDrawer[0].insertBefore(unitDrawer[0].children[unitIndex], unitDrawer[0].children[0]);
        }
      }
    }
  }

  if (await retrieveFromStorage("equipSwitch")) {
    try {
      await shiftUnits();
    } catch (error) {
      console.log("log" + error);
    }
  }

  for (let i = 1; i <= unitsQuantity; i++) {
    //Iterates through every unit
    const unit = unitDrawer[0].querySelector(".unitSelectionItemCont:nth-child(" + i + ") .unitItem:nth-child(1)");

    //Get unit rarity
    let commonCheck = unit.querySelector('.unitRarityCommon');
    let uncommonCheck = unit.querySelector('.unitRarityUncommon');
    let rareCheck = unit.querySelector('.unitRarityRare');
    let legendaryCheck = unit.querySelector('.unitRarityLegendary');

    //Get unit status: cooldown, defeated and exhausted
    let coolDownCheck = unit.querySelector('.unitItemCooldown');
    let defeatedCheck = unit.querySelector('.defeatedVeil');
    let unitDisabled = unit.querySelector('.unitItemDisabledOff');

    //Get unit type and unit name so it can be compared with the marker and determine if the placement is valid.
    let unitType = unit.querySelector('.unitClass img').getAttribute('alt').toUpperCase();
    unitName = unit.querySelector('.unitClass img').getAttribute('src').slice(-50).toUpperCase();
    let commonSwitch;
    let uncommonSwitch;
    let rareSwitch;
    let legendarySwitch;
    let isDungeon = false;

    //Check if it's dungeon so the usage of all units can be allowed regardless of user setting
    let dungeonCheck = document.querySelector('.battleInfoMapTitle');
    if (dungeonCheck.innerText.includes('Level: ')) {
      isDungeon = true
    }
    //Checks what units the user wants to place
    if (legendaryCheck) {
      legendarySwitch = await getSwitchState("legendarySwitch");
    } else if (rareCheck) {
      rareSwitch = await getSwitchState("rareSwitch");
    } else if (uncommonCheck) {
      uncommonSwitch = await getSwitchState("uncommonSwitch");
    } else if (commonCheck) {
      commonSwitch = await getSwitchState("commonSwitch");
    }

    //Get human readable unitName
    const unit1 = arrayOfUnits.filter(unit1 => unitName.includes(unit1.icon))[1];
    if (unit1) {
      unitName = unit1.key;
    }
    //Check if the unit can be used.
    if ((commonCheck && !commonSwitch && !isDungeon) ||
      (legendaryCheck && !legendarySwitch && !isDungeon) ||
      (rareCheck && !rareSwitch && !isDungeon) ||
      (uncommonCheck && !uncommonSwitch && !isDungeon) ||
      coolDownCheck || defeatedCheck || !unitDisabled) {
      if (i >= unitsQuantity) {
        //If there are no units that can be placed, get a new marker until there are no markers available to match any of the available units
        markerAttempt++;
        getSetMarker();
        return;
      } else {
        //Current unit can't be used, get the next
        continue;
      }
    }
    /* Select the unit if the current marker is a vibe or if there are no markers
      or if the unit name or type match the current marker */
    else if (currentMarkerKey == "VIBE" || currentMarkerKey == "" ||
      currentMarkerKey == unitType || currentMarkerKey == unitName) {
      //Select the unit
      unit.click();
      await delay(1000);
      /* If the unit is placed on an invalid marker or area or if the unit is on top of another ally unit,
      tapping it forces the game to check if the placement can be performed */
      tapUnit();
      return;
    } else {
      //Else get the next unit
      continue;
    }
  }
  goHome();
  return;
}

//If the unit is in a valid marker that is in use, by taping the unit container it forces a button recheck on mouseup/touchend
function tapUnit() {
  //Check for frozen state
  reloadRoot()
  //Attemps to tap the selected unit to force a valid placement check
  try {
    const placerUnitCont = document.querySelector('.placerUnitCont');
    const event = new Event('mouseup', { bubbles: true, cancelable: true });
    placerUnitCont.dispatchEvent(event);
  } catch (error) {
    goHome();
    return;
  }
}

//Places unit or asks for a new valid marker
function placeTheUnit() {
  //Gets timer, if it doesn't exist return to main menu.
  let clockText
  //Attempts to get the clock text
  try {
    clockText = document.querySelector('.battlePhaseTextClock .clock').innerText;
  } catch (error) {
    goHome();
    return;
  }

  //If timer has reached 00:00 it means the battle has already started, return to main menu.
  if (clockText === "00:00") {
    let placerButton = document.querySelector(cancelButtonSelector);
    let selectorBack = document.querySelector(".selectorBack");

    if (placerButton && selectorBack) {
      placerButton.click();
      selectorBack.click();
      return;
    }
  }

  //Attemps to place the selected unit and go back to menu, if the marker is valid, but in use, get a new marker.
  const confirmPlacement = document.querySelector(".actionButton.actionButtonPrimary.placerButton");
  if (confirmPlacement) {
    //Placement is blocked by invalid unit location.
    const blockedMarker = document.querySelector(".placerRangeIsBlocked");
    if (blockedMarker) {
      const cancelButton = document.querySelector(cancelButtonSelector);
      if (cancelButton) {
        cancelButton.click();
      }
      if (currentMarkerKey != null || currentMarkerKey != 0) {
        getValidMarkers();
      } else {
        goHome();
        return;
      }
    } else {
      if (confirmPlacement) {
        confirmPlacement.click();
      }
    }
  }

  //Unit was placed successfully, returns to main menu and the process restarts.
  setTimeout(() => {
    // Unit was successfully placed, exit battlefield and so the cycle can be restarted.
    const placementSuccessful = document.querySelector(".actionButton.actionButtonDisabled.placeUnitButton");
    if (placementSuccessful) {
      goHome();
      return;
    }
  }, 3000);

  setTimeout(() => {
    const disabledButton = document.querySelector(".actionButton.actionButtonDisabled.placerButton");
    const negativeButton = document.querySelector(cancelButtonSelector);
    if (disabledButton) {
      disabledButton.click();
    }
    if (negativeButton) {
      negativeButton.click();
      getValidMarkers();
    }
  }, 5000);
}

const obsv = new MutationObserver(function (mutations) {

  mutations.forEach(async function (mutation) {

    //Get captain slots or returns if they don't exist
    const captainSlots = document.querySelectorAll(".capSlots");
    if (captainSlots.length == 0) {
      return;
    }
    //Using the game mode key retrieves captainName from storage
    const firstCapSlot = captainSlots[0];
    const capSlotChildren = firstCapSlot.querySelectorAll('.capSlot');
    const dungeonCaptainNameFromStorage = await retrieveFromStorage('dungeonCaptain');
    const clashCaptainNameFromStorage = await retrieveFromStorage('clashCaptain');
    const duelsCaptainNameFromStorage = await retrieveFromStorage('duelCaptain');
    let capNameDOM;

    //Gets captain name from the dom
    for (const capSlot of capSlotChildren) {
      //Attemps to get the captain name from the current slot
      try {
        capNameDOM = capSlot.querySelector('.capSlotName').innerText;
      } catch (error) {
        continue;
      }

      //Get flag states
      const purpleFlag = await getCaptainFlag(capNameDOM, 'flaggedCaptains');
      const blueFlag = await getCaptainFlag(capNameDOM, 'captainLoyalty');

      /*If the current captain is running a special mode and is not the one with the current flag OR
      if the currently flagged captain is not running their assigned special mode they get colored red
      for visual identification */
      if (blueFlag) {
        capSlot.style.backgroundColor = blue;
      }
      else if (purpleFlag) {
        capSlot.style.backgroundColor = purple
      }
      else if ((dungeonCaptainNameFromStorage != capNameDOM) && capSlot.innerText.includes("Dungeons") ||
        (clashCaptainNameFromStorage != capNameDOM) && capSlot.innerText.includes("Clash") ||
        (duelsCaptainNameFromStorage != capNameDOM) && capSlot.innerText.includes("Duel") ||
        (dungeonCaptainNameFromStorage == capNameDOM) && !capSlot.innerText.includes("Dungeons") ||
        (clashCaptainNameFromStorage == capNameDOM) && !capSlot.innerText.includes("Clash") ||
        (duelsCaptainNameFromStorage == capNameDOM) && !capSlot.innerText.includes("Duel")) {
        capSlot.style.backgroundColor = red;
      }
      else {
        capSlot.style.backgroundColor = gameBlue;
      }
    }

    //Set offline button states after load.
    const allCapSlots = document.querySelectorAll(".capSlot");
    for (const slot of allCapSlots) {
      //Iterate through every button
      try {
        const btnOff = slot.querySelector(".capSlotStatus .offlineButton");
        const btnId = btnOff.getAttribute('id');
        //Retrieve button state from storage
        let offstate = await getIdleState(btnId);
        //Obtained inner text and color for the user to visually identify
        if (offstate) {
          btnOff.textContent = "ENABLED";
          btnOff.style.backgroundColor = "#5fa695";
        } else {
          btnOff.textContent = "DISABLED";
          btnOff.style.backgroundColor = "red";
        }
      } catch (error) {
        return;
      }
    }
  });
});

const tgtNode = document.body;
const conf = { childList: true, subtree: true };
obsv.observe(tgtNode, conf);

//Collect rewards and savages chests
async function collectChests() {
  let collecRewardButtons = document.querySelectorAll(".actionButton.capSlotButton.capSlotButtonAction");
  const buttonLabels = ["SEE RESULTS", "OPEN CHEST", "COLLECT KEYS", "COLLECT BONES"];

  for (let i = 0; i < collecRewardButtons.length; i++) {
    const button = collecRewardButtons[i];
    const buttonText = button.innerText;
    if (buttonLabels.includes(buttonText)) {
      const offSetSlot = button.offsetParent;
      const captainName = offSetSlot.querySelector(".capSlotName").innerText;

      //Get battle result and chest type to add to storage log
      const battleResult = offSetSlot.querySelector(".capSlotStatus").innerText;
      let chestString;
      let chestStringAlt;
      if (battleResult.includes("Defeat")) {
        chestStringAlt = "chestsalvage";
      } else {
        try {
          chestString = button.querySelector('img');
          try {
            chestStringAlt = chestString.alt;
            if (chestStringAlt === "") {
              if (chestString.getAttribute('src').toLowerCase().includes("bone")) {
                chestStringAlt = "bones";
              } else if (chestString.getAttribute('src').toLowerCase().includes("key")) {
                chestStringAlt = "keys";
              }
            }
          } catch (error) {
          }
        } catch (error) {
        };
      }

      button.click();
      await delay(1000);
      await setLogResults(battleResult, captainName, chestStringAlt);
      break;
    }
  }
}

//This function resets the running state and closes the battlefield back to home.
function goHome() {
  const backHome = document.querySelector(".selectorBack");
  if (backHome) {
    backHome.click();
  }
}

const contentPort = chrome.runtime.connect({ name: "content-script" });

async function requestLoyalty(captainNameFromDOM) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Timeout while waiting for response'));
      contentPort.onMessage.removeListener(responseListener);
    }, 8000);

    const responseListener = (response) => {
      clearTimeout(timeout);
      // Handle the response (true/false)
      if (response !== undefined) {
        resolve(response.response);
      } else {
        reject(new Error('Invalid response format from background script'));
      }
      contentPort.onMessage.removeListener(responseListener);
    };

    contentPort.onMessage.addListener(responseListener);

    contentPort.postMessage({ action: "getLoyalty", captainNameFromDOM });
  });
}