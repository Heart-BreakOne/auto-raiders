/* This file is the heart of the extension, it performs the auto playing, invokes functions to set and get values as well as
functions to perform tasks such as replacing idle captains or buying scrolls
*/

//Triggers the start function every 30 seconds
setInterval(start, 30000);
//Update background colors every 5 seconds
setInterval(changeBackgroundColor, 5000);

//Declares/initializes variables
let currentMarkerKey = "";
let currentMarker;
let arrayOfMarkers;
let markerAttempt;
let computedStyle;
let backgroundImageValue;
let isRunning = false;
let mode;
let diamondLoyalty;
let arrayOfAllyPlacement;
let startLoop;
const yellow = 'rgb(255, 253, 208)';
const red = 'rgb(255, 204, 203)';
const purple = 'rgb(203, 195, 227)';
const gameBlue = 'rgb(42, 96, 132)';
const cancelButtonSelector = ".actionButton.actionButtonNegative.placerButton";
let delay = ms => new Promise(res => setTimeout(res, ms));

const loyaltyChests = [
  "Diamond Chest",
  "Loyalty Diamond Chest",
  "Loyalty Gold Chest",
  "Loyalty Scroll Chest",
  "Loyalty Skin Chest",
  "Loyalty Token Chest",
  "Loyalty Super Boss Chest",
  "Loyalty Boss Chest",
  "Loyalty Boss"
];

const arrayOfBattleFieldMarkers = [
  { key: "NO", icon: "SVFCVFFVKM+J2ICS+HWVYAAAAASUVORK5CYII=" },
  { key: "VIBE", icon: "1EPFWIYQTQRB9OWOGAAAABJRU5ERKJGGG" },
  { key: "ARMORED", icon: "ADCFHG0NPVXLAAAAAELFTKSUQMCC" },
  { key: "ASSASSIN", icon: "AJRY4S+IIEGAAAABJRU5ERKJGGG==" },
  { key: "MELEE", icon: "4HMCIMNBN" },
  { key: "RANGED", icon: "BSBDMAAZVZ+IAAAAAELFTKSUQMCC" },
  { key: "SUPPORT", icon: "RWRLLLPGN4N+DRB7+UDVYFQAAAABJRU5ERKJGGG" },
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

const arrayOfUnits = [
  { key: "", type: "", icon: "" },
  { key: "VIBE", type: "VIBE", icon: "VIBE" },
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

  //If it's stuck for 60 seconds set isRunning to false
  startLoop++
  if (startLoop >= 2) {
    isRunning = false
  }
  //If isRunning is true, return
  if (isRunning) {
    return;
  }
  startLoop = 0
  isRunning = true;

  //Initialized nav items and clicks on the Battle to open the main menu
  navItems = document.querySelectorAll('.mainNavItemText');
  navItems.forEach(navItem => {
    if (navItem.innerText === "Battle") {
      navItem.click();
    }
  })

  //Checks if the user wants to replace idle captains and invoke the function to check and replace them.
  const offline = await retrieveFromStorage("offlineSwitch")
  if (offline) {
    await checkIdleCaptains()
  }

  // Collects chests and savages rewards
  collectChests();

  // Collects rewards if there are any
  const rewardButton = document.querySelector(".actionButton.actionButtonPrimary.rewardsButton");
  if (rewardButton) {
    rewardButton.click();
  }

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
        const captainNameFromDOM = captainSlot.querySelector('.capSlotName').innerText;
        //Retrieve the slot state (mode, loyalty and no units) from storage using the captain name
        const slotState = await retrieveStateFromStorage(captainNameFromDOM);
        //If slot state is true, move to the next slot
        if (slotState) {
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
        } catch (error) {
          captainFlag = false
        }
        //If captain is flagged change color and move to the next slot
        if (captainFlag) {
          captainSlot.style.backgroundColor = purple
          continue
        } else {
          captainSlot.style.backgroundColor = gameBlue
        }
        //Pass captain name and check if the captain has a loyalty flag.
        if (await retrieveFromStorage('loyaltySwitch')) {
          try {
            captainLoyalty = await getCaptainFlag(captainNameFromDOM, 'captainLoyalty');
          } catch (error) {
            captainLoyalty = false
          }
        } else {
          captainLoyalty = false
        }
        //If captain has a loyalty flag, change color and move to the next slot
        if (captainLoyalty) {
          captainSlot.style.backgroundColor = yellow
          continue
        } else {
          captainSlot.style.backgroundColor = gameBlue
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
          diamondLoyalty = captainSlot.outerHTML.includes('LoyaltyDiamond');
          placeUnit = button
          break;
        }
      } else {
        continue
      }
    }
  }

  //If place unit exists, clicks it and loads the invokes the openBattlefield function
  if (placeUnit) {
    console.log("log");
    placeUnit.click();
    console.log("log");
    await delay(3000);
    console.log("log");
    openBattlefield();
    console.log("log");
  } else {
    console.log("log");
    isRunning = false;
    console.log("log");
    return;
  }

  // Change captains using a different device without the script freezing trying to select a captain.
  closeAll();
  console.log("log");
  isRunning = false;
}

async function performCollection() {
  isRunning = false;
  console.log("log");
  await collectQuests();
  await buyScrolls();
  console.log("log");
  await collectFreeDaily();
  console.log("log");
  await collectBattlePass();
  console.log("log");
}

// This function checks if the battlefield is present, the current chest type, then zooms into it.
async function openBattlefield() {
  console.log("log");
  // Attempts to check if battlefield is open
  let battleInfo
  console.log("log");
  try {
    console.log("log");
    battleInfo = document.querySelector(".battleInfo").innerText;
    console.log("log");
  } catch (error) {
    console.log("log");
    isRunning = false
    return
  }
  mode = false
  //Duels and clash strings here.
  console.log("log");
  if (battleInfo.includes("Level") || battleInfo.includes("Versus")) {
    console.log("log");
    mode = true;
  }
  //Check if user wants to preserve diamond loyalty
  console.log("log");
  const preserveDiamond = await retrieveFromStorage('loyaltySwitch');

  console.log("log");
  //User wants to preserve diamond loyalty and current captain is not diamond and current mode is campaign
  if (preserveDiamond && !diamondLoyalty && mode == false) {
    console.log("log");
    //Opens battle info and checks chest type.
    console.log("log");
    battleInfo = document.querySelector(".battleInfoMapTitle")
    battleInfo.click()
    console.log("log");
    const chest = document.querySelector(".mapInfoRewardsName").innerText;
    if (loyaltyChests.includes(chest)) {
      console.log("log");
      //Flag the captain loyalty since the current map is to be skipped
      await flagCaptain('captainLoyalty');
      console.log("log");
      //Close the chest info popup and return to main menu
      closeAll();
      console.log("log");
      goHome();
      console.log("log");
      return;
    } else {
      //Current chest is not special, close cheset info and zoom
      console.log("log");
      closeAll();
      zoom();
    }
  } else {
    //User doesn't want to preserve diamond loyalty
    console.log("log");
    zoom();
  }
}

//Zooms into the battlefield
function zoom() {
  console.log("log");
  const zoomButton = document.querySelector(".fas.fa-plus");
  if (zoomButton) {
    console.log("log");
    for (let i = 0; i < 7; i++) {
      console.log("log");
      zoomButton.click();
    };
    //Resets tracking variables
    markerAttempt = 0
    console.log("log");
    arrayOfMarkers = null
    //Invoke getValidMarkers function
    console.log("log");
    getValidMarkers();
  }
}

//Looks and selects a valid marker for placement
async function getValidMarkers() {
  console.log("log");
  //Function to check for a frozen state
  reloadRoot();
  await delay(5000);
  console.log("log");
  //Initializes a node list with placement markers
  arrayOfMarkers = document.querySelectorAll(".planIcon");
  console.log("log");
  //Captain is on open map only
  if (arrayOfMarkers.length == 0) {
    console.log("log");
    //Map without any markers.
    //Initializes a variable with battle clock
    const clockElement = document.querySelector('.battlePhaseTextClock .clock');
    console.log("log");
    if (clockElement == null) {
      console.log("log");
      goHome();
      return;
    }
    const timeText = clockElement.innerText.replace(':', '');
    console.log("log");
    const time = parseInt(timeText, 10);
    //If the timer is at 29:15 or above, go back to the main menu as the captain may place still be placing markers.
    if (time > 2915) {
      console.log("log");
      goHome();
      console.log("log");
      return;
    } else {
      console.log("log");
      //If captain haven't placed any markers, initialize a node list with ally placements
      arrayOfAllyPlacement = document.querySelectorAll(".placementAlly");
      console.log("log");
      //Get one position within the ally placements
      currentMarker = arrayOfAllyPlacement[Math.floor(Math.random() * arrayOfAllyPlacement.length)];
      console.log("log");
      //Scroll into the currentMarker position
      moveScreenRandomPosition();
      console.log("log");
    }
    //There are markers of some kind in the map.
  } else {
    console.log("log");
    //Treat the markers to remove block markers
    for (let i = 0; i < arrayOfMarkers.length; i++) {
      console.log("log");
      let planIcon = arrayOfMarkers[i];
      console.log("log");
      let backgroundImageValue = getComputedStyle(planIcon).getPropertyValue('background-image').toUpperCase();
      console.log("log");
      if (backgroundImageValue.includes("SVFCVFFVKM+J2ICS+HWVYAAAAASUVORK5CYII=")) {
        console.log("log");
        try {
          planIcon.remove();
          console.log("log");
        } catch (error) {
          continue;
        }
      }
    }
    //Refresh array of markers with remaining markers
    arrayOfMarkers = document.querySelectorAll(".planIcon");
    console.log("log");
    if (arrayOfMarkers.length == 0 && (arrayOfAllyPlacement == undefined || arrayOfAllyPlacement.length == 0)) {
      console.log("log");
      //Captain is using a mix of block markers and open zones
      await flagCaptain('flaggedCaptains');
      console.log("log");
      goHome();
      console.log("log");
      return;
    } else {
      //There are vibe or set markers that can be used.
      console.log("log");
      getSetMarker();
    }
  }
}

async function getSetMarker() {
  let matchingMarker;
  console.log("log");
  //This indicates that an attempt to place at the current marker has been made
  if (markerAttempt >= 1) {
    console.log("log");
    //Attemps to get a matching marker
    try {
      console.log("log");
      matchingMarker = arrayOfBattleFieldMarkers.find(marker => marker.key === currentMarkerKey).icon;
    } catch (error) {
      console.log("log");
      goHome();
      console.log("log");
      return;
    }
    //Removes current marker from the page as they can't be used
    for (let i = 0; i < arrayOfMarkers.length; i++) {
      console.log("log");
      let planIcon = arrayOfMarkers[i];
      console.log("log");
      let backgroundImageValue = getComputedStyle(planIcon).getPropertyValue('background-image').toUpperCase();
      console.log("log");
      if (backgroundImageValue.includes(matchingMarker)) {
        console.log("log");
        try {
          planIcon.remove();
          console.log("log");
        } catch (error) {
          console.log("log");
          continue;
        }
      }
    }
    //Updates marker node list without the removed markers
    arrayOfMarkers = document.querySelectorAll(".planIcon");
    console.log("log");
  }
  if (arrayOfMarkers.length == 0) {
    console.log("log");
    //there are no units to match any of the available markers
    await flagCaptain('flaggedCaptains');
    console.log("log");
    goHome();
    console.log("log");
    return;
  } else {
    currentMarkerKey = ""
    // The randomization of the index increased the chances of getting a valid placement.
    currentMarker = arrayOfMarkers[Math.floor(Math.random() * (arrayOfMarkers.length - 1))];
    console.log("log");
    // This bit gets the marker type for comparison later
    computedStyle = getComputedStyle(currentMarker);
    console.log("log");
    backgroundImageValue = computedStyle.getPropertyValue('background-image').toUpperCase();
    console.log("log");
    //Checks if the marker is a valid placement marker and also get its type
    arrayOfBattleFieldMarkers.some(marker => {
      console.log("log");
      //If the current marker matches the items on the array of markers, it's a valid marker
      if (backgroundImageValue.includes(marker.icon)) {
        console.log("log");
        currentMarkerKey = marker.key
        for (let i = 0; i <= arrayOfUnits.length; i++) {
          console.log("log");
          const element = arrayOfUnits[i];
          if (currentMarkerKey === element.key || currentMarkerKey === element.type) {
            console.log("log");
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
  console.log("log");
  const positions = ['start', 'center', 'end', 'nearest'];
  console.log("log");
  const randomPosition = positions[Math.floor(Math.random() * positions.length)];
  console.log("log");
  await moveScreen(randomPosition);
}

//Vertical and horizontal center
async function moveScreenCenter() {
  console.log("log");
  await moveScreen('center');
}

//Scroll into view the center of the currentMark
async function moveScreen(position) {
  console.log("log");
  //Set marker dimensions to zero so the unit can fit in its place
  try {
    console.log("log");
    currentMarker.style.width = '0';
    currentMarker.style.height = '0';
    console.log("log");
    currentMarker.style.backgroundSize = '0';
    //Move screen with the current marker centered
    console.log("log");
    await delay(4000);
    console.log("log");
    if (currentMarker && currentMarker !== undefined) {
      currentMarker.scrollIntoView({ block: 'center', inline: position });
    } else {
      goHome();
      return;
    }
    await delay(3000);
    console.log("log");
  } catch (error) {
    console.log("log");
    goHome();
    return;
  }
  console.log("log");
  await delay(3000);
  console.log("log");
  //Invokes unit selection
  selectUnit();
  console.log("log");
  await delay(1000);
  //Invokes selected unit placement.
  console.log("log");
  placeTheUnit();
  //Checks for frozen state
  console.log("log");
  reloadRoot();
  console.log("log");
}

/* This function opens the unit inventory tab, boosts unit and selects the first available unit that is allowed for usage,
isn't on cooldown, dead or exhausted. It also gets the unit name for future marker validation. */
async function selectUnit() {
  console.log("log");
  //Opens the unit drawer
  let placeUnitSelection = document.querySelector(".actionButton.actionButtonPrimary.placeUnitButton");
  console.log("log");
  if (placeUnitSelection) {
    console.log("log");
    placeUnitSelection.click();
  }

  //Set the unit drawer to the ALL units tab.
  console.log("log");
  let allUnitsButton = document.querySelector('.unitFilterButton');
  console.log("log");
  if (allUnitsButton) {
    console.log("log");
    allUnitsButton.click();
  }
  //Checks if user wants to use potions.
  const potionState = await getRadioButton();
  console.log("log");
  let number
  console.log("log");
  let epicButton
  //User wants to use potions
  if (potionState != 0 && !mode) {
    console.log("log");
    //Get potion strings so the string can be trimmed and converted to int for validation
    let potions;
    //Attempts to get potion quantity
    try {
      potions = document.querySelector("img[alt='Potion']").closest(".quantityItem");
      console.log("log");
    } catch (error) {
      console.log("log");
      goHome();
      console.log("log");
      return;
    }
    let potionQuantity = potions.querySelector(".quantityText").textContent;
    console.log("log");
    epicButton = document.querySelector(".actionButton.actionButtonPrimary.epicButton");
    number = parseInt(potionQuantity.substring(0, 3));
    console.log("log");
  }
  //User wants to use potions as soon as there are at least 45 potions.
  if (potionState == 1 && number >= 45) {
    if (epicButton) {
      console.log("log");
      epicButton.click();
    }
    //User wants to use potions as soon as there are 100 potions.
  } else if (potionState && number == 100) {
    console.log("log");
    if (epicButton) {
      console.log("log");
      epicButton.click();
    }
  }
  //Handles unit drawer.
  console.log("log");
  let unitDrawer;
  console.log("log");
  unitName = ""
  unitDrawer = document.querySelectorAll(".unitSelectionCont");
  console.log("log");
  //Initializes a node list with all units
  let unitsQuantity;
  console.log("log");
  //Attempts to get ammount of units in the units drawers
  try {
    unitsQuantity = unitDrawer[0].children.length;
    console.log("log");
  } catch (error) {
    goHome();
    console.log("log");
    return;
  }

  for (let i = 1; i <= unitsQuantity; i++) {
    console.log("log");
    //Iterates through every unit
    //Get unit
    const unit = unitDrawer[0].querySelector(".unitSelectionItemCont:nth-child(" + i + ") .unitItem:nth-child(1)")
    //Get unit rarity
    let commonCheck = unit.querySelector('.unitRarityCommon');
    let uncommonCheck = unit.querySelector('.unitRarityUncommon');
    let rareCheck = unit.querySelector('.unitRarityRare');
    let legendaryCheck = unit.querySelector('.unitRarityLegendary');
    //Get unit status: cooldown, defeated and exhausted
    let coolDownCheck = unit.querySelector('.unitItemCooldown');
    let defeatedCheck = unit.querySelector('.defeatedVeil');
    let unitDisabled = unit.querySelector('.unitItemDisabledOff');
    console.log("log");
    //Get unit type and unit name so it can be compared with the marker and determine if the placement is valid.
    let unitType = unit.querySelector('.unitClass img').getAttribute('alt').toUpperCase();
    let unitName = unit.querySelector('.unitClass img').getAttribute('src').slice(-50).toUpperCase();
    let commonSwitch;
    let uncommonSwitch;
    let rareSwitch;
    let legendarySwitch;
    let isDungeon = false;

    console.log("log");
    //Check if it's dungeon so the usage of all units can be allowed regardless of user setting
    let dungeonCheck = document.querySelector('.battleInfoMapTitle');
    if (dungeonCheck.innerText.includes('Level: ')) {
      isDungeon = true
      console.log("log");
    }
    //Checks what units the user wants to place
    console.log("log");
    if (legendaryCheck) {
      legendarySwitch = await getSwitchState("legendarySwitch");
    } else if (rareCheck) {
      rareSwitch = await getSwitchState("rareSwitch");
    } else if (uncommonCheck) {
      uncommonSwitch = await getSwitchState("uncommonSwitch");
    } else if (commonCheck) {
      commonSwitch = await getSwitchState("commonSwitch");
    }

    console.log("log");
    //Get human readable unitName
    const unit1 = arrayOfUnits.filter(unit1 => unitName.includes(unit1.icon))[1];
    if (unit1) {
      console.log("log");
      unitName = unit1.key;
    }
    //Check if the unit can be used.
    console.log("log");
    if ((commonCheck && !commonSwitch && !isDungeon) ||
      (legendaryCheck && !legendarySwitch && !isDungeon) ||
      (rareCheck && !rareSwitch && !isDungeon) ||
      (uncommonCheck && !uncommonSwitch && !isDungeon) ||
      coolDownCheck || defeatedCheck || !unitDisabled) {
      console.log("log");
      if (i >= unitsQuantity) {
        console.log("log");
        //If there are no units that can be placed, get a new marker until there are no markers available to match any of the available units
        markerAttempt++;
        getSetMarker();
        return;
      } else {
        console.log("log");
        //Current unit can't be used, get the next
        continue;
      }
    }
    /* Select the unit if the current marker is a vibe or if there are no markers
      or if the unit name or type match the current marker */
    else if (currentMarkerKey == "VIBE" || currentMarkerKey == "" ||
      currentMarkerKey == unitType || currentMarkerKey == unitName) {
      console.log("log");
      //Select the unit
      unit.click();
      console.log("log");
      await delay(1000);
      /* If the unit is placed on an invalid marker or area or if the unit is on top of another ally unit,
      tapping it forces the game to check if the placement can be performed */
      console.log("log");
      tapUnit();
      return;
    } else {
      console.log("log");
      //Else get the next unit
      continue;
    }
  }
  console.log("log");
  goHome();
  return;
}

//If the unit is in a valid marker that is in use, by taping the unit container it forces a button recheck on mouseup/touchend
function tapUnit() {
  console.log("log");
  //Check for frozen state
  reloadRoot()
  //Attemps to tap the selected unit to force a valid placement check
  try {
    const placerUnitCont = document.querySelector('.placerUnitCont');
    console.log("log");
    const event = new Event('mouseup', { bubbles: true, cancelable: true });
    placerUnitCont.dispatchEvent(event);
    console.log("log");
  } catch (error) {
    goHome();
    console.log("log");
    return;
  }
}

//Places unit or asks for a new valid marker
function placeTheUnit() {
  console.log("log");
  //Gets timer, if it doesn't exist return to main menu.
  console.log("log");
  let clockText
  //Attempts to get the clock text
  try {
    console.log("log");
    clockText = document.querySelector('.battlePhaseTextClock .clock').innerText;
  } catch (error) {
    goHome();
    return;
  }

  //If timer has reached 00:00 it means the battle has already started, return to main menu.
  if (clockText === "00:00") {
    console.log("log");
    let placerButton = document.querySelector(cancelButtonSelector);
    let selectorBack = document.querySelector(".selectorBack");
    console.log("log");

    if (placerButton && selectorBack) {
      console.log("log");
      placerButton.click();
      selectorBack.click();
      console.log("log");
      isRunning = false;
      return;
    }
  }

  //Attemps to place the selected unit and go back to menu, if the marker is valid, but in use, get a new marker.
  const confirmPlacement = document.querySelector(".actionButton.actionButtonPrimary.placerButton");
  console.log("log");
  if (confirmPlacement) {
    //Placement is blocked by invalid unit location.
    const blockedMarker = document.querySelector(".placerRangeIsBlocked");
    console.log("log");
    if (blockedMarker) {
      console.log("log");
      const cancelButton = document.querySelector(cancelButtonSelector);
      console.log("log");
      if (cancelButton) {
        cancelButton.click();
      }
      if (currentMarkerKey != null || currentMarkerKey != 0) {
        console.log("log");
        getValidMarkers();
      } else {
        console.log("log");
        goHome();
        return;
      }
    } else {
      if (confirmPlacement) {
        console.log("log");
        confirmPlacement.click();
      }
    }
  }

  //Unit was placed successfully, returns to main menu and the process restarts.
  setTimeout(() => {
    // Unit was successfully placed, exit battlefield and so the cycle can be restarted.
    console.log("log");
    const placementSuccessful = document.querySelector(".actionButton.actionButtonDisabled.placeUnitButton");
    if (placementSuccessful) {
      console.log("log");
      goHome();
      return;
    }
  }, 3000);

  setTimeout(() => {
    const disabledButton = document.querySelector(".actionButton.actionButtonDisabled.placerButton");
    console.log("log");
    const negativeButton = document.querySelector(cancelButtonSelector);
    console.log("log");
    if (disabledButton) {
      disabledButton.click();
      console.log("log");
    }
    if (negativeButton) {
      console.log("log");
      negativeButton.click();
      getValidMarkers();
      console.log("log");
    }
  }, 5000);
}

//Change attributes of some elements as they get loaded.
async function changeBackgroundColor() {
  console.log("log");

  //Get captain slots or returns if they don't exist
  const captainSlots = document.querySelectorAll(".capSlots");
  console.log("background");
  if (captainSlots.length == 0) {
    console.log("background");
    return;
  }
  //Using the game mode key retrieves captainName from storage
  console.log("background");
  const firstCapSlot = captainSlots[0];
  const capSlotChildren = firstCapSlot.querySelectorAll('.capSlot');
  const dungeonCaptainNameFromStorage = await retrieveFromStorage('dungeonCaptain');
  const clashCaptainNameFromStorage = await retrieveFromStorage('clashCaptain');
  const duelsCaptainNameFromStorage = await retrieveFromStorage('duelCaptain');
  let capNameDOM;

  console.log("background");
  //Gets captain name from the dom
  for (const capSlot of capSlotChildren) {

    console.log("background");
    //Attemps to get the captain name from the current slot
    try {
      capNameDOM = capSlot.querySelector('.capSlotName').innerText;
      console.log("background");
    } catch (error) {
      continue;
    }

    //Set pause button states after load
    const play = String.fromCharCode(9654)
    console.log("background");
    const pause = String.fromCharCode(9208)
    //Get pause button state for the current captain 
    console.log("background");
    const state = await retrieveStateFromStorage(capNameDOM);
    console.log("background");
    const pauseButton = capSlot.querySelector('.pauseButton');
    //Set button innerText based on retrieved state
    console.log("background");
    if (state && capSlot.innerText.includes(play)) {
      pauseButton.innerText = pause;
      console.log("background");
    } else if (!state && capSlot.innerText.includes(pause)) {
      console.log("background");
      pauseButton.innerText = play
      console.log("background");
    }

    console.log("background");
    /*If the current captain is running a special mode and is not the one with the current flag OR
    if the currently flagged captain is not running their assigned special mode they get colored red
    for visual identification */
    console.log("background");
    if ((dungeonCaptainNameFromStorage != capNameDOM) && capSlot.innerText.includes("Dungeons") ||
      (clashCaptainNameFromStorage != capNameDOM) && capSlot.innerText.includes("Clash") ||
      (duelsCaptainNameFromStorage != capNameDOM) && capSlot.innerText.includes("Duel") ||
      (dungeonCaptainNameFromStorage == capNameDOM) && !capSlot.innerText.includes("Dungeons") ||
      (clashCaptainNameFromStorage == capNameDOM) && !capSlot.innerText.includes("Clash") ||
      (duelsCaptainNameFromStorage == capNameDOM) && !capSlot.innerText.includes("Duel")) {
      console.log("background");
      capSlot.style.backgroundColor = red;
    } else if (capSlot.style.backgroundColor === yellow || capSlot.style.backgroundColor === purple) {
      console.log("background");
    }
    else {
      console.log("background");
      capSlot.style.backgroundColor = gameBlue;
    }
  }

  //Set offline button states after load.
  const allCapSlots = document.querySelectorAll(".capSlot");
  console.log("log");
  for (const slot of allCapSlots) {
    console.log("log");
    //Iterate through every button
    const btnOff = slot.querySelector(".capSlotStatus .offlineButton");
    const btnId = btnOff.getAttribute('id');
    //Retrieve button state from storage
    console.log("log");
    const offstate = await getIdleState(btnId);
    btnOff.style.fontWeight = "bold";

    //Obtained inner text and color for the user to visually identify
    if (offstate) {
      console.log("log");
      btnOff.textContent = "ENABLED";
      btnOff.style.backgroundColor = "#5fa695";
    } else {
      console.log("log");
      btnOff.textContent = "DISABLED";
      btnOff.style.backgroundColor = "red";
    }
  }
}

//Collect rewards and savages chests
function collectChests() {
  console.log("log");
  let collecRewardButtons = document.querySelectorAll(".actionButton.capSlotButton.capSlotButtonAction");
  const buttonLabels = ["SEE RESULTS", "OPEN CHEST", "COLLECT KEYS", "COLLECT BONES"];

  console.log("log");
  for (let i = 0; i < collecRewardButtons.length; i++) {
    console.log("log");
    const button = collecRewardButtons[i];
    const buttonText = button.innerText;
    if (buttonLabels.includes(buttonText)) {
      console.log("log");
      button.click();
      break;
    }
  }
}

//This function resets the running state and closes the battlefield back to home.
function goHome() {
  console.log("log");
  isRunning = false;
  const backHome = document.querySelector(".selectorBack");
  if (backHome) {
    console.log("log");
    backHome.click();
  }
}