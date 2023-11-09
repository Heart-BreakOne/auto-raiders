
setInterval(start, 30000);
setInterval(changeBackgroundColor, 5000);

let currentMarkerKey = "";
let currentMarker;
let arrayOfMarkers;
let markerAttempt
let fullLength = 0
let computedStyle
let backgroundImageValue
let isRunning = false;
let diamondLoyalty;
let arrayOfAllyPlacement
let startLoop
const yellow = 'rgb(255, 253, 208)';
const red = 'rgb(255, 204, 203)';
const purple = 'rgb(203, 195, 227)';
const gameBlue = 'rgb(42, 96, 132)';

let delay = ms => new Promise(res => setTimeout(res, ms));

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

  const logIsOpen = document.querySelector(".log_iframe");
  if (logIsOpen) return;

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

  navItems = document.querySelectorAll('.mainNavItemText');
  navItems.forEach(navItem => {
    if (navItem.innerText === "Battle") {
      navItem.click();
    }
  })

  const offline = await retrieveFromStorage("offlineSwitch")
  if (offline) {
    await checkOfflineCaptains()
  }

  // Collects defeat and savage chest
  const defeatButton = document.querySelectorAll(".actionButton.capSlotButton.capSlotButtonAction");
  async function handleChest() {
    defeatButton.forEach(async (button) => {
      const buttonText = button.innerText;
      if (buttonText === "SEE RESULTS" || buttonText === "OPEN CHEST" || buttonText === "COLLECT KEYS" || buttonText === "COLLECT BONES") {
        button.click();
      }
    });
  }
  await handleChest();
  // Collects rewards if there are any
  const rewardButton = document.querySelector(".actionButton.actionButtonPrimary.rewardsButton");
  if (rewardButton) {
    await rewardButton.click();
  }

  const placeUnitButtons = document.querySelectorAll(".actionButton.actionButtonPrimary.capSlotButton.capSlotButtonAction");
  let placeUnit = null;
  if (placeUnitButtons.length == 0 || (placeUnitButtons.length == 1 && placeUnitButtons[0].innerText === "SUBMIT")) {
    isRunning = false
    await performCollection()
    return
  } else if (placeUnitButtons.length != 0) {
    for (var button of placeUnitButtons) {
      if (button.innerText.includes("PLACE UNIT")) {
        var captainSlot = button.closest('.capSlot');
        const captainNameFromDOM = captainSlot.querySelector('.capSlotName').innerText;
        const slotState = await retrieveStateFromStorage(captainNameFromDOM);
        const dungeonCaptainNameFromStorage = await retrieveFromStorage('dungeonCaptain');
        const clashCaptainNameFromStorage = await retrieveFromStorage('clashCaptain');
        const duelsCaptainNameFromStorage = await retrieveFromStorage('duelCaptain');
        const clashSwitch = await retrieveFromStorage('clashSwitch');
        const dungeonSwitch = await retrieveFromStorage('dungeonSwitch');
        const duelSwitch = await retrieveFromStorage('duelSwitch');
        let captainFlag
        let captainLoyalty
        if (slotState) {
          continue
        }
        try {
          captainFlag = await getCaptainFlag(captainNameFromDOM, 'flaggedCaptains');
        } catch (error) {
          captainFlag = false
        }
        if (captainFlag) {
          captainSlot.style.backgroundColor = purple
          continue
        } else {
          captainSlot.style.backgroundColor = gameBlue
        }
        if (await retrieveFromStorage('loyaltySwitch')) {
          try {
            captainLoyalty = await getCaptainFlag(captainNameFromDOM, 'captainLoyalty');
          } catch (error) {
            captainLoyalty = false
          }
        } else {
          captainLoyalty = false
        }
        if (captainLoyalty) {
          captainSlot.style.backgroundColor = yellow
          continue
        } else {
          captainSlot.style.backgroundColor = gameBlue
        }
        if ((dungeonCaptainNameFromStorage != captainNameFromDOM) && captainSlot.innerText.includes("Dungeons") ||
          (clashCaptainNameFromStorage != captainNameFromDOM) && captainSlot.innerText.includes("Clash") ||
          (duelsCaptainNameFromStorage != captainNameFromDOM) && captainSlot.innerText.includes("Duel")) {
          continue
        } else if ((dungeonCaptainNameFromStorage == captainNameFromDOM) && !captainSlot.innerText.includes("Dungeons") ||
          (clashCaptainNameFromStorage == captainNameFromDOM) && !captainSlot.innerText.includes("Clash") ||
          (duelsCaptainNameFromStorage == captainNameFromDOM) && !captainSlot.innerText.includes("Duel")) {
          captainSlot.style.backgroundColor = red;
          continue
        }
        else if (((captainSlot.innerText.includes("Dungeons") && !dungeonSwitch) || (captainSlot.innerText.includes("Clash") && !clashSwitch) ||
          ((captainSlot.innerText.includes("Duel") && !duelSwitch))) &&
          captainSlot.querySelector('.capSlotClose') == null) {
          continue
        } else {
          diamondLoyalty = captainSlot.outerHTML.includes('LoyaltyDiamond');
          placeUnit = button
          break;
        }
      } else {
        continue
      }
    }
  }
  fullLength = 0
  if (placeUnit) {
    placeUnit.click();
    await delay(3000)
    openBattlefield();
  } else {
    isRunning = false
    return
  }

  // Change captains using a different device without the script freezing trying to select a captain.
  const slideMenuTops = document.querySelectorAll('.slideMenuTop');
  slideMenuTops.forEach(element => {
    if (element.innerText.includes("Search Captain")) {
      const closeButton = element.querySelector(".far.fa-times");
      if (closeButton) {
        closeButton.click();
      }
    }
  });
  isRunning = false
}

async function performCollection() {
  isRunning = false
  await collectQuests()
  await buyScrolls()
  await collectFreeDaily()
  await collectBattlePass()
}

// This function checks if the battlefield is present and zooms into it.
async function openBattlefield() {

  //Check loyalty here
  let battleInfo
  try {
    battleInfo = document.querySelector(".battleInfo").innerText;
  } catch (error) {
    isRunning = false
    return
  }
  let mode = false
  //Duels and clash strings here.
  if (battleInfo.includes("Level") || battleInfo.includes("Versus")) {
    mode = true
  }
  if (!diamondLoyalty && mode == false) {
    battleInfo = document.querySelector(".battleInfoMapTitle")
    battleInfo.click()
    const chest = document.querySelector(".mapInfoRewardsName").innerText;
    //chest === "Gold Chest" || 
    if ((chest === "Diamond Chest" || chest === "Loyalty Diamond Chest" ||
      chest === "Loyalty Gold Chest" || chest === "Loyalty Scroll Chest" ||
      chest === "Loyalty Skin Chest" || chest === "Loyalty Token Chest" ||
      chest === "Loyalty Super Boss Chest" || chest === "Loyalty Boss Chest" ||
      chest === "Loyalty Boss") && await retrieveFromStorage('loyaltySwitch')) {
      await flagCaptain('captainLoyalty');
      const allBackButtons = document.querySelectorAll(".far.fa-times");
      allBackButtons.forEach((button) => {
        button.click();
      });
      goHome();
      return;
    } else {
      const closeButton = document.querySelector('.slideMenuCont.slideUp.slideUpOpen.slideMenuShortOpen.slideMenuShortOpenMore .slideMenuTop .far.fa-times');
      if (closeButton) {
        closeButton.click();
        zoom();
      }
    }
  } else {
    zoom();
  }
}

function zoom() {
  const zoomButton = document.querySelector(".fas.fa-plus");
  if (zoomButton) {
    for (let i = 0; i < 7; i++) {
      zoomButton.click();
    };
    markerAttempt = 0
    arrayOfMarkers = null
    getValidMarkers();
  }
}

//Looks and selects a valid marker for placement

async function getValidMarkers() {
  reloadRoot();
  await delay(5000);
  arrayOfMarkers = document.querySelectorAll(".planIcon");
  //Captain is on open map only
  if (arrayOfMarkers.length == 0) {
    //Map without any markers.
    const clockElement = document.querySelector('.battlePhaseTextClock .clock');
    if (clockElement == null) {
      goHome();
      return;
    }
    const timeText = clockElement.innerText.replace(':', '');
    const time = parseInt(timeText, 10);
    if (time > 2915) {
      goHome();
      return;
    } else {
      arrayOfAllyPlacement = document.querySelectorAll(".placementAlly");
      currentMarker = arrayOfAllyPlacement[Math.floor(Math.random() * arrayOfAllyPlacement.length)];
      moveScreenRandomPosition();
    }
    //There are markers of some kind in the map.
  } else {
    //Treat the markers to remove block markers
    arrayOfMarkers.forEach(planIcon => {
      backgroundImageValue = getComputedStyle(planIcon).getPropertyValue('background-image').toUpperCase();
      if (backgroundImageValue.includes("SVFCVFFVKM+J2ICS+HWVYAAAAASUVORK5CYII=")) {
        planIcon.remove()
      }
    })
    //Refresh array of markers with remaining markers
    arrayOfMarkers = document.querySelectorAll(".planIcon");
    if (arrayOfMarkers.length == 0) {
      //Captain is using a mix of block markers and open zones
      await flagCaptain('flaggedCaptains')
      goHome();
      return;
    } else {
      //There are vibe or set markers that can be used.
      getSetMarker()
    }
  }
}

async function getSetMarker() {
  let matchingMarker
  //This indicates that an attempt to place at the current marker has been made
  if (markerAttempt >= 1) {
    try {
      matchingMarker = arrayOfBattleFieldMarkers.find(marker => marker.key === currentMarkerKey).icon;
    } catch (error) {
      await flagCaptain('flaggedCaptains')
      goHome();
      return;
    }
    arrayOfMarkers.forEach(planIcon => {
      backgroundImageValue = getComputedStyle(planIcon).getPropertyValue('background-image').toUpperCase();
      if (backgroundImageValue.includes(matchingMarker)) {
        planIcon.remove()
      }
    });
    arrayOfMarkers = document.querySelectorAll(".planIcon");
  }
  if (arrayOfMarkers.length == 0) {
    //there are no units to match any of the available markers
    await flagCaptain('flaggedCaptains')
    goHome();
    return;
  } else {
    currentMarkerKey = ""
    // The randomization of the index increased the chances of getting a valid placement.
    currentMarker = arrayOfMarkers[Math.floor(Math.random() * (arrayOfMarkers.length - 1))];
    // This bit gets the marker type for comparison later
    computedStyle = getComputedStyle(currentMarker);
    backgroundImageValue = computedStyle.getPropertyValue('background-image').toUpperCase();
    arrayOfBattleFieldMarkers.some(marker => {
      if (backgroundImageValue.includes(marker.icon)) {
        currentMarkerKey = marker.key
        for (let i = 0; i <= arrayOfUnits.length; i++) {
          const element = arrayOfUnits[i];
          if (currentMarkerKey === element.key || currentMarkerKey === element.type) {
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
  //They say two bodies cannot occupy the same point in space and time so we turn the marker into 0 so our unit can fit on that space
  currentMarker.style.width = '0';
  currentMarker.style.height = '0';
  currentMarker.style.backgroundSize = '0';

  currentMarker.scrollIntoView({ block: 'center', inline: position });
  await delay(3000);
  selectUnit();
  await delay(1000);
  placeTheUnit();
  reloadRoot();
}

//Opens unit inventory tab, boosts unit and selects the first available unit that isn't on cooldown
//or isn't legendary. It also grabs the unit name for future marker validation.
async function selectUnit() {
  let placeUnitSelection = document.querySelector(".actionButton.actionButtonPrimary.placeUnitButton");
  if (placeUnitSelection) {
    placeUnitSelection.click();
  }
  let allUnitsButton = document.querySelector('.unitFilterButton');
  if (allUnitsButton) {
    allUnitsButton.click();
  }
  //Use a potion if there are 100 potions available, uncomment to enable it.
  const potionState = await getRadioButton();
  let number
  let epicButton
  if (potionState != 0) {
    let potions = document.querySelector("img[alt='Potion']").closest(".quantityItem");
    let potionQuantity = potions.querySelector(".quantityText").textContent;
    epicButton = document.querySelector(".actionButton.actionButtonPrimary.epicButton");
    number = parseInt(potionQuantity.substring(0, 3));
  }
  if (potionState == 1 && number >= 45) {
    if (epicButton) {
      epicButton.click();
    }
  } else if (potionState && number == 100) {
    if (epicButton) {
      epicButton.click();
    }
  }
  let unitDrawer;
  unitName = ""
  unitDrawer = document.querySelectorAll(".unitSelectionCont");
  const unitsQuantity = unitDrawer[0].children.length;
  for (let i = 1; i <= unitsQuantity; i++) {
    const unit = unitDrawer[0].querySelector(".unitSelectionItemCont:nth-child(" + i + ") .unitItem:nth-child(1)")
    let commonCheck = unit.querySelector('.unitRarityCommon');
    let uncommonCheck = unit.querySelector('.unitRarityUncommon');
    let rareCheck = unit.querySelector('.unitRarityRare');
    let legendaryCheck = unit.querySelector('.unitRarityLegendary');
    let coolDownCheck = unit.querySelector('.unitItemCooldown');
    let defeatedCheck = unit.querySelector('.defeatedVeil');
    let unitType = unit.querySelector('.unitClass img').getAttribute('alt').toUpperCase();
    let unitName = unit.querySelector('.unitClass img').getAttribute('src').slice(-50).toUpperCase();
    let unitDisabled = unit.querySelector('.unitItemDisabledOff');
    let commonSwitch;
    let uncommonSwitch
    let rareSwitch
    let legendarySwitch
    let isDungeon = false

    //Check if it's dungeon so the usage of legendary units can be allowed
    let dungeonCheck = document.querySelector('.battleInfoMapTitle');
    if (dungeonCheck.innerText.includes('Level: ')) {
      isDungeon = true
    }
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
    //If the unit can't be used, get the next
    if ((commonCheck && !commonSwitch && !isDungeon) ||
      (legendaryCheck && !legendarySwitch && !isDungeon) ||
      (rareCheck && !rareSwitch && !isDungeon) ||
      (uncommonCheck && !uncommonSwitch && !isDungeon) ||
      coolDownCheck || defeatedCheck || !unitDisabled) {
      if (i >= unitsQuantity) {
        markerAttempt++
        getSetMarker()
        return
      } else {
        continue
      }
    }
    else if (currentMarkerKey == "VIBE" || currentMarkerKey == "" ||
      currentMarkerKey == unitType || currentMarkerKey == unitName) {
      unit.click();
      await delay(1000);
      tapUnit();
      return
    } else {
      continue;
    }
  }
  goHome();
  return;
}

//If the unit is in a valid marker that is in use, by taping the unit container it forces a button recheck on mouseup/touchend
function tapUnit() {
  reloadRoot()
  const placerUnitCont = document.querySelector('.placerUnitCont');
  const event = new Event('mouseup', { bubbles: true, cancelable: true });
  placerUnitCont.dispatchEvent(event);
}

//Places unit or asks for a new valid marker
function placeTheUnit() {
  //Gets timer and if it's 0, goes back to menu
  let clockText
  try {
    clockText = document.querySelector('.battlePhaseTextClock .clock').innerText;
  } catch (error) {
    isRunning = false
    return
  }

  if (clockText === "00:00") {
    let placerButton = document.querySelector(".actionButton.actionButtonNegative.placerButton");
    let selectorBack = document.querySelector(".selectorBack");

    if (placerButton && selectorBack) {
      placerButton.click();
      selectorBack.click();
      isRunning = false;
    }
  }

  //Attemps to place the unit and go back to menu, if the marker is valid, but in use, get a new marker.
  const confirmPlacement = document.querySelector(".actionButton.actionButtonPrimary.placerButton");
  if (confirmPlacement) {
    const blockedMarker = document.querySelector(".placerRangeIsBlocked");
    if (blockedMarker) {
      const cancelButton = document.querySelector(".actionButton.actionButtonNegative.placerButton");
      if (cancelButton) {
        cancelButton.click();
      }
      if (currentMarkerKey != null || currentMarkerKey != 0) {
        getValidMarkers();
      } else {
        //moveScreenRandomPosition()
        return
      }
    } else {
      confirmPlacement.click()
      const cancelButton2 = document.querySelector(".actionButton.actionButtonNegative.placerButton");
      if (cancelButton2) {
        cancelButton2.click();
        goHome();
        return;
      }
    }
  }

  //Unit was placed successfully, returns to main menu and the process restarts.
  setTimeout(() => {
    // Unit was successfully placed, exit battlefield and restart cycle
    const placementSuccessful = document.querySelector(".actionButton.actionButtonDisabled.placeUnitButton");
    if (placementSuccessful) {
      goHome()
      return;
    }
  }, 3000);
  setTimeout(() => {
    const disabledButton = document.querySelector(".actionButton.actionButtonDisabled.placerButton");
    const negativeButton = document.querySelector(".actionButton.actionButtonNegative.placerButton");
    if (disabledButton) {
      disabledButton.click();
    }
    if (negativeButton) {
      negativeButton.click();
    }
    getValidMarkers();
  }, 5000);
}


async function changeBackgroundColor() {
  const captainSlots = document.querySelectorAll(".capSlots");
  if (captainSlots.length == 0) {
    return;
  }
  const firstCapSlot = captainSlots[0];
  const capSlotChildren = firstCapSlot.querySelectorAll('.capSlot');
  const dungeonCaptainNameFromStorage = await retrieveFromStorage('dungeonCaptain');
  const clashCaptainNameFromStorage = await retrieveFromStorage('clashCaptain');
  const duelsCaptainNameFromStorage = await retrieveFromStorage('duelCaptain');
  let capNameDOM;

  for (const capSlot of capSlotChildren) {
    try {
      capNameDOM = capSlot.querySelector('.capSlotName').innerText;
    } catch (error) {
      continue;
    }

    //Set pause button states after load
    const play = String.fromCharCode(9654)
    const pause = String.fromCharCode(9208)
    const state = await retrieveStateFromStorage(capNameDOM);
    const pauseButton = capSlot.querySelector('.pauseButton');
    if (state && capSlot.innerText.includes(play)) {
      pauseButton.innerText = pause
    } else if (!state && capSlot.innerText.includes(pause)) {
      pauseButton.innerText = play
    }

    if ((dungeonCaptainNameFromStorage != capNameDOM) && capSlot.innerText.includes("Dungeons") ||
      (clashCaptainNameFromStorage != capNameDOM) && capSlot.innerText.includes("Clash") ||
      (duelsCaptainNameFromStorage != capNameDOM) && capSlot.innerText.includes("Duel") ||
      (dungeonCaptainNameFromStorage == capNameDOM) && !capSlot.innerText.includes("Dungeons") ||
      (clashCaptainNameFromStorage == capNameDOM) && !capSlot.innerText.includes("Clash") ||
      (duelsCaptainNameFromStorage == capNameDOM) && !capSlot.innerText.includes("Duel")) {
      capSlot.style.backgroundColor = red;
    } else if (capSlot.style.backgroundColor === yellow || capSlot.style.backgroundColor === purple) {
    }
    else {
      capSlot.style.backgroundColor = gameBlue;
    }
  }

  //Set offline button states after load.
  const allCapSlots = document.querySelectorAll(".capSlot");
  for (const slot of allCapSlots) {
    const btnOff = slot.querySelector(".capSlotStatus .offlineButton");
    const btnId = btnOff.getAttribute('id');
    const offstate = await getOfflineState(btnId);

    if (offstate) {
      btnOff.textContent = "ENABLED";
      btnOff.style.backgroundColor = "#5fa695";
    } else {
      btnOff.textContent = "DISABLED";
      btnOff.style.backgroundColor = "red";
    }
  }
}

//Mutator observer to remove stuck modals
const observer = new MutationObserver(function (mutations) {
  mutations.forEach(async function (mutation) {
    const rewardsScrim = document.querySelector(".rewardsScrim");
    if (rewardsScrim) {
      rewardsScrim.remove();
    }

    reloadRoot();

    let questModal = document.querySelector(".modalScrim.modalOn");
    if (questModal && !questModal.innerText.includes("Leave battle")) {
      questModal.remove();
    }

    const menuView = document.querySelector(".mainNavCont.mainNavContPortrait")
    if (menuView)
      injectIntoDOM()

    const battleLabel = document.querySelector(".battlePhaseTextCurrent");
    if (battleLabel) {
      if (battleLabel.innerText === "Battle Ready") {
        const computedStyle = window.getComputedStyle(battleLabel);
        const color = computedStyle.getPropertyValue("color");
        if (color === "rgb(49, 255, 49)") {
          goHome();
          return;
          //location.reload();
        }
      }
    }

    let battleButton = document.querySelector(".placeUnitButtonItems");
    if (battleButton && (battleButton.innerText.includes("UNIT READY TO PLACE IN") || battleButton.innerText.includes("BATTLE STARTING SOON"))) {
      await battleDelay(15000);
      battleButton = document.querySelector(".placeUnitButtonItems");
      if (battleButton && (battleButton.innerText.includes("UNIT READY TO PLACE IN") || battleButton.innerText.includes("BATTLE STARTING SOON"))) {
        goHome();
        return;
        //location.reload();
      }
    }

    const buttons = document.querySelectorAll(".button.actionButton.actionButtonPrimary");
    buttons.forEach((button) => {
      const buttonText = button.querySelector("div").textContent.trim();
      if (buttonText === "GO BACK") {
        button.click();
      }
    });
  });
});

const targetNode = document.body;
const config = { childList: true, subtree: true };
observer.observe(targetNode, config);

function reloadRoot() {
  const rootElement = document.getElementById('root');
  if (rootElement && rootElement.childElementCount === 0) {
    location.reload();
  }
}

function goHome() {
  isRunning = false;
  const backHome = document.querySelector(".selectorBack");
  if (backHome) {
    backHome.click();
  }
}