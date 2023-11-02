
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
let goldLoyalty
let arrayOfAllyPlacement
let startLoop
const yellow = 'rgb(255, 253, 208)';
const red = 'rgb(255, 204, 203)';
const purple = 'rgb(203, 195, 227)';
const gameBlue = 'rgb(42, 96, 132)';

let delay = ms => new Promise(res => setTimeout(res, ms));

const arrayOfBattleFieldMarkers = [
  { key: "NO", icon: "SVfCVffvkM+J2ics+hWvYAAAAASUVORK5CYII=" },
  { key: "VIBE", icon: "1ePfwIYQTqrB9OwOgAAAABJRU5ErkJggg" },
  { key: "ARMORED", icon: "AdcfHG0nPVXlAAAAAElFTkSuQmCC" },
  { key: "ASSASSIN", icon: "aJRY4s+IiegAAAABJRU5ErkJggg==" },
  { key: "MELEE", icon: "4HmcImnbn" },
  { key: "RANGED", icon: "BsbdMaaZvZ+iAAAAAElFTkSuQmCC" },
  { key: "SUPPORT", icon: "rWRlllPGN4n+DrB7+udvYfQAAAABJRU5ErkJggg" },
  { key: "ARCHER", type: "RANGED", icon: "Ex5Gk5jX6QAAAABJRU5ErkJggg==" },
  { key: "ARTILLERY", type: "RANGED", icon: "U1jpaB82/+YAAAAASUVORK5CYII=" },
  { key: "BALLOON", type: "RANGED", icon: "rnP6GWgfwBAAAAAASUVORK5CYII=" },
  { key: "BARBARIAN", type: "MELEE", icon: "FatYxSr+E/wDKlh2h07gGiAAAAAASUVORK5CYII=" },
  { key: "BERSERKER", type: "MELEE", icon: "lP02Y0oxnNiIr/AnXBM2OH2VJaAAAAAElFTkSuQmCC" },
  { key: "BLOB", type: "ARMORED", icon: "9HYQzqGnn8FEo4736EwIbo1bllOJKAAAAAElFTkSuQmCC" },
  { key: "BOMBER", type: "RANGED", icon: "En4FFsjSc5V5VtwAAAAASUVORK5CYII=" },
  { key: "BUSTER", type: "ASSASSIN", icon: "QXwTF98vOwAAAABJRU5ErkJggg==" },
  { key: "CENTURION", type: "ARMORED", icon: "JoNSvopYo0wAAAABJRU5ErkJggg==" },
  { key: "FAIRY", type: "SUPPORT", icon: "Buf7V5fsf2AUwAAAABJRU5ErkJggg==" },
  { key: "FLAG", type: "MELEE", icon: "2SgX8QvwDHGxEX3KAthAAAAABJRU5ErkJggg==" },
  { key: "FLYING", type: "ASSASSIN", icon: "Sc0o8MLg/J0AAAAASUVORK5CYII=" },
  { key: "GLADIATOR", type: "MELEE", icon: "dd+SkzMjLHL0Wu+o7fOf4PXjB9mFKo1NwAAAAASUVORK5CYII=" },
  { key: "HEALER", type: "SUPPORT", icon: "APnHo7kH5ssigAAAAASUVORK5CYII=" },
  { key: "LANCER", type: "MELEE", icon: "6oT5/TrxJxQAAAABJRU5ErkJggg==" },
  { key: "MAGE", type: "RANGED", icon: "+zdZ7Cmo0cKY3QAAAABJRU5ErkJggg==" },
  { key: "MONK", type: "SUPPORT", icon: "AJVBiHgq88WrAAAAAElFTkSuQmCC" },
  { key: "MUSKETEER", type: "RANGED", icon: "wtnKKina8Xm9K25p3uMNHiP8BrTLJNU/YgnMAAAAASUVORK5CYII=" },
  { key: "NECROMANCER", type: "SUPPORT", icon: "AFPyH+ByJBNJj45eqmAAAAAElFTkSuQmCC" },
  { key: "ORC", type: "ARMORED", icon: "gGDims8uWTIOQAAAABJRU5ErkJggg==" },
  { key: "PALADIN", type: "ARMORED", icon: "/wf8A3hDj56jXWOEAAAAAElFTkSuQmCC" },
  { key: "ROGUE", type: "ASSASSIN", icon: "AvwRy3tv3qvIAAAAAElFTkSuQmCC" },
  { key: "SAINT", type: "SUPPORT", icon: "Gf4Go32S6bUXVsAAAAAASUVORK5CYII=" },
  { key: "SHINOBI", type: "ASSASSIN", icon: "mg5B+uiFewcI/ewAAAAABJRU5ErkJggg==" },
  { key: "SPY", type: "ASSASSIN", icon: "TQzAPQNzN6gAAAAASUVORK5CYII=" },
  { key: "TANK", type: "ARMORED", icon: "ampqZdtc4D3FPwxeZVk5dLefAAAAAElFTkSuQmCC" },
  { key: "TEMPLAR", type: "SUPPORT", icon: "yHf+H+B8TrvPZFQhdvgAAAABJRU5ErkJggg==" },
  { key: "VAMPIRE", type: "ARMORED", icon: "M9WGHTKw8vy7AlV0IJJZRQQh78C0IfEIi3WRZBAAAAAElFTkSuQmCC" },
  { key: "WARBEAST", type: "MELEE", icon: "/AveH3CXL9Oh4wAAAABJRU5ErkJggg==" },
  { key: "WARRIOR", type: "MELEE", icon: "gXc5CPDJVy5YIAAAAASUVORK5CYII=" },
];

const arrayOfUnits = [
  { key: "", type: "", icon: "" },
  { key: "VIBE", type: "VIBE", icon: "Vibe" },
  { key: "ARCHER", type: "RANGED", icon: "FBpkaZY" },
  { key: "ARTILLERY", type: "RANGED", icon: "3GY1DLAQ" },
  { key: "BALLOON", type: "RANGED", icon: "FoPPa6g" },
  { key: "BARBARIAN", type: "MELEE", icon: "y2azrA3g" },
  { key: "BERSERKER", type: "MELEE", icon: "BCIAAA" },
  { key: "BLOB", type: "ARMORED", icon: "lXTAAA" },
  { key: "BOMBER", type: "RANGED", icon: "Qwp8wBk" },
  { key: "BUSTER", type: "ASSASSIN", icon: "PccPYIHw" },
  { key: "CENTURION", type: "ARMORED", icon: "DUwAAA" },
  { key: "FAIRY", type: "SUPPORT", icon: "fNJqA" },
  { key: "FLAG", type: "MELEE", icon: "kF7A" },
  { key: "FLYING", type: "ASSASSIN", icon: "gsge2mI" },
  { key: "GLADIATOR", type: "MELEE", icon: "EMwa84U" },
  { key: "HEALER", type: "SUPPORT", icon: "UY3n8" },
  { key: "LANCER", type: "MELEE", icon: "PU+OGw" },
  { key: "MAGE", type: "RANGED", icon: "4q+bQmL8" },
  { key: "MONK", type: "SUPPORT", icon: "d46Ekxw" },
  { key: "MUSKETEER", type: "RANGED", icon: "dl9SBC7g" },
  { key: "NECROMANCER", type: "SUPPORT", icon: "85VI" },
  { key: "ORC", type: "ARMORED", icon: "VPaasGY8" },
  { key: "PALADIN", type: "ARMORED", icon: "iYUeo" },
  { key: "ROGUE", type: "ASSASSIN", icon: "gRjLD" },
  { key: "SAINT", type: "SUPPORT", icon: "PBUHpCg" },
  { key: "SHINOBI", type: "ASSASSIN", icon: "Xsczq" },
  { key: "SPY", type: "ASSASSIN", icon: "FJbDFfQ" },
  { key: "TANK", type: "ARMORED", icon: "Xek7Hqu" },
  { key: "TEMPLAR", type: "SUPPORT", icon: "CynUl" },
  { key: "VAMPIRE", type: "ARMORED", icon: "Bl5378" },
  { key: "WARBEAST", type: "MELEE", icon: "SRJSYo" },
  { key: "WARRIOR", type: "MELEE", icon: "YtuUAHQ" },
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

  //Remove the error toast message if it exists.
  let backError = document.querySelector(".modalScrim.modalOn");
  if (backError) {
    backError.remove();
  }

  navItems = document.querySelectorAll('.mainNavItemText');
  navItems.forEach(navItem => {
    if (navItem.innerText === "Battle") {
      navItem.click();
    }
  })

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
  if (placeUnitButtons.length == 0) {
    isRunning = false
    await performCollection()
    return
  } else if (placeUnitButtons.length != 0) {
    for (var button of placeUnitButtons) {
      if (button.innerText.includes("PLACE UNIT")) {
        var captainSlot = button.closest('.capSlot');
        const dungeonCaptainNameFromStorage = await retrieveFromStorage('dungeonCaptain');
        const clashCaptainNameFromStorage = await retrieveFromStorage('clashCaptain');
        const duelsCaptainNameFromStorage = await retrieveFromStorage('duelCaptain');
        const clashSwitch = await retrieveFromStorage('clashSwitch');
        const dungeonSwitch = await retrieveFromStorage('dungeonSwitch');
        const duelSwitch = await retrieveFromStorage('duelSwitch');
        const captainNameFromDOM = captainSlot.querySelector('.capSlotName').innerText;
        let captainFlag
        let captainLoyalty
        try {
          captainFlag = await getCaptainFlag(captainNameFromDOM, 'flaggedCaptains');
        } catch (error) {
          captainFlag = false
        }
        if (captainFlag) {
          captainSlot.style.backgroundColor = purple
          //await performCollection()
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
          //await performCollection()
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
          goldLoyalty = captainSlot.outerHTML.includes('LoyaltyGold');
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
}

// This function checks if the battlefield is present and zooms into it.
async function openBattlefield() {

  //Check loyalty here
  let battleInfo
  try {
    battleInfo = document.querySelector(".battleInfoMapTitle").innerText;
  } catch (error) {
    isRunning = false
    return
  }
  let mode = false
  //Duels and clash strings here.
  if (battleInfo.includes("Level") || battleInfo.includes("vs") || battleInfo.includes("VS") ||
    battleInfo.includes("Versus") || battleInfo.includes("versus")) {
    mode = true
  }
  if (!goldLoyalty && mode == false) {
    battleInfo = document.querySelector(".battleInfoMapTitle")
    battleInfo.click()
    const chest = document.querySelector(".mapInfoRewardsName").innerText;
    if ((chest === "Loyalty Gold Chest" || chest === "Loyalty Skin Chest" || chest === "Loyalty Token Chest" || chest === "Loyalty Super Boss Chest" ||
      chest === "Loyalty Boss Chest") && await retrieveFromStorage('loyaltySwitch')) {
      await flagCaptain('captainLoyalty')
      location.reload()
    } else {
      const closeButton = document.querySelector('.slideMenuCont.slideUp.slideUpOpen.slideMenuShortOpen.slideMenuShortOpenMore .slideMenuTop .far.fa-times');
      if (closeButton) {
        closeButton.click();
        zoom()
      }
    }
  } else {
    zoom()
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
      goHome()
      return
    }
    const timeText = clockElement.innerText.replace(':', '');
    const time = parseInt(timeText, 10);
    if (time > 2915) {
      goHome()
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
      const backgroundImageValue = getComputedStyle(planIcon).getPropertyValue('background-image');
      if (backgroundImageValue.includes("SVfCVffvkM+J2ics+hWvYAAAAASUVORK5CYII=")) {
        planIcon.remove()
      }
    })
    //Refresh array of markers with remaining markers
    arrayOfMarkers = document.querySelectorAll(".planIcon");
    if (arrayOfMarkers.length == 0) {
      //Captain is using a mix of block markers and open zones
      await flagCaptain('flaggedCaptains')
      goHome()
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
      goHome()
      return
    }
    arrayOfMarkers.forEach(planIcon => {
      const backgroundImageValue = getComputedStyle(planIcon).getPropertyValue('background-image');
      if (backgroundImageValue.includes(matchingMarker)) {
        planIcon.remove()
      }
    });
    arrayOfMarkers = document.querySelectorAll(".planIcon");
  }
  if (arrayOfMarkers.length == 0) {
    //there are no units to match any of the available markers
    await flagCaptain('flaggedCaptains')
    goHome()
    return
  } else {
    currentMarkerKey = ""
    // The randomization of the index increased the chances of getting a valid placement.
    currentMarker = arrayOfMarkers[Math.floor(Math.random() * (arrayOfMarkers.length - 1))];
    // This bit gets the marker type for comparison later
    computedStyle = getComputedStyle(currentMarker);
    backgroundImageValue = computedStyle.getPropertyValue('background-image');
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
    let unitType = unit.querySelector('.unitClass img').getAttribute('alt');
    var unitName = unit.querySelector('.unitClass img').getAttribute('src').slice(-50);
    let unitDisabled = unit.querySelector('.unitItemDisabledOff');
    let commonSwitch;
    let uncommonSwitch
    let rareSwitch
    let legendarySwitch
    var isDungeon = false

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
    else if (currentMarkerKey.toUpperCase() == "VIBE" || currentMarkerKey.toUpperCase() == "" ||
     currentMarkerKey.toUpperCase() == unitType.toUpperCase() || currentMarkerKey.toUpperCase() == unitName.toUpperCase()) {
      unit.click();
      await delay(1000);
      tapUnit();
      return
    } else {
      continue;
    }
  }
  goHome()
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
        goHome()
      }
    }
  }

  //Unit was placed successfully, returns to main menu and the process restarts.
  setTimeout(() => {
    // Unit was successfully placed, exit battlefield and restart cycle
    const placementSuccessful = document.querySelector(".actionButton.actionButtonDisabled.placeUnitButton");
    if (placementSuccessful) {
      goHome()
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
    return
  }
  const firstCapSlot = captainSlots[0];
  const capSlotChildren = firstCapSlot.querySelectorAll('.capSlot');
  const dungeonCaptainNameFromStorage = await retrieveFromStorage('dungeonCaptain');
  const clashCaptainNameFromStorage = await retrieveFromStorage('clashCaptain');
  const duelsCaptainNameFromStorage = await retrieveFromStorage('duelCaptain');
  let capNameDOM
  capSlotChildren.forEach(capSlot => {
    // Do something with each .capSlot element
    try {
      capNameDOM = capSlot.querySelector('.capSlotName').innerText;
    } catch (error) {
      return
    }
    if ((dungeonCaptainNameFromStorage != capNameDOM) && capSlot.innerText.includes("Dungeons") ||
      (clashCaptainNameFromStorage != capNameDOM) && capSlot.innerText.includes("Clash") ||
      (duelsCaptainNameFromStorage != capNameDOM) && capSlot.innerText.includes("Duel") ||
      (dungeonCaptainNameFromStorage == capNameDOM) && !capSlot.innerText.includes("Dungeons") ||
      (clashCaptainNameFromStorage == capNameDOM) && !capSlot.innerText.includes("Clash") ||
      (duelsCaptainNameFromStorage == capNameDOM) && !capSlot.innerText.includes("Duel")) {
      capSlot.style.backgroundColor = red;
    } else if (capSlot.style.backgroundColor === yellow || capSlot.style.backgroundColor === purple) {
      //If color is yellow or purple do nothing
    }
    else {
      capSlot.style.backgroundColor = gameBlue;
    }
  });
}

//Mutator observer for the empty root element
const observer = new MutationObserver(function (mutations) {
  mutations.forEach(function (mutation) {
      const rootElement = document.getElementById('root');
      if (rootElement && rootElement.children.length === 0) {
          location.reload()
      }
  });
});
const targetNode = document.body;
const config = { childList: true, subtree: true };
observer.observe(targetNode, config);

function reloadRoot() {
  const rootElement = document.getElementById('root');
  if (rootElement && rootElement.childElementCount === 0) {
    location.reload()
  }
}
function goHome() {
  isRunning = false
  const backHome = document.querySelector(".selectorBack");
  if (backHome) {
    backHome.click();
  }
}