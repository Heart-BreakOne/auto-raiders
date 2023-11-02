
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
  { key: "no", icon: "SVfCVffvkM+J2ics+hWvYAAAAASUVORK5CYII=" },
  { key: "vibe", icon: "1ePfwIYQTqrB9OwOgAAAABJRU5ErkJggg" },
  { key: "armored", icon: "AdcfHG0nPVXlAAAAAElFTkSuQmCC" },
  { key: "assassin", icon: "aJRY4s+IiegAAAABJRU5ErkJggg==" },
  { key: "melee", icon: "4HmcImnbn" },
  { key: "ranged", icon: "BsbdMaaZvZ+iAAAAAElFTkSuQmCC" },
  { key: "support", icon: "rWRlllPGN4n+DrB7+udvYfQAAAABJRU5ErkJggg" },
  { key: "archer", type: "ranged", icon: "Ex5Gk5jX6QAAAABJRU5ErkJggg==" },
  { key: "artillery", type: "ranged", icon: "U1jpaB82/+YAAAAASUVORK5CYII=" },
  { key: "balloon", type: "ranged", icon: "rnP6GWgfwBAAAAAASUVORK5CYII=" },
  { key: "barbarian", type: "melee", icon: "FatYxSr+E/wDKlh2h07gGiAAAAAASUVORK5CYII=" },
  { key: "berserker", type: "melee", icon: "lP02Y0oxnNiIr/AnXBM2OH2VJaAAAAAElFTkSuQmCC" },
  { key: "blob", type: "armored", icon: "9HYQzqGnn8FEo4736EwIbo1bllOJKAAAAAElFTkSuQmCC" },
  { key: "bomber", type: "ranged", icon: "En4FFsjSc5V5VtwAAAAASUVORK5CYII=" },
  { key: "buster", type: "assassin", icon: "QXwTF98vOwAAAABJRU5ErkJggg==" },
  { key: "centurion", type: "armored", icon: "JoNSvopYo0wAAAABJRU5ErkJggg==" },
  { key: "fairy", type: "support", icon: "Buf7V5fsf2AUwAAAABJRU5ErkJggg==" },
  { key: "flag", type: "melee", icon: "2SgX8QvwDHGxEX3KAthAAAAABJRU5ErkJggg==" },
  { key: "flying", type: "assassin", icon: "Sc0o8MLg/J0AAAAASUVORK5CYII=" },
  { key: "gladiator", type: "melee", icon: "dd+SkzMjLHL0Wu+o7fOf4PXjB9mFKo1NwAAAAASUVORK5CYII=" },
  { key: "healer", type: "support", icon: "APnHo7kH5ssigAAAAASUVORK5CYII=" },
  { key: "lancer", type: "melee", icon: "6oT5/TrxJxQAAAABJRU5ErkJggg==" },
  { key: "mage", type: "ranged", icon: "+zdZ7Cmo0cKY3QAAAABJRU5ErkJggg==" },
  { key: "monk", type: "support", icon: "AJVBiHgq88WrAAAAAElFTkSuQmCC" },
  { key: "musketeer", type: "ranged", icon: "wtnKKina8Xm9K25p3uMNHiP8BrTLJNU/YgnMAAAAASUVORK5CYII=" },
  { key: "necromancer", type: "support", icon: "AFPyH+ByJBNJj45eqmAAAAAElFTkSuQmCC" },
  { key: "orc", type: "armored", icon: "gGDims8uWTIOQAAAABJRU5ErkJggg==" },
  { key: "paladin", type: "armored", icon: "/wf8A3hDj56jXWOEAAAAAElFTkSuQmCC" },
  { key: "rogue", type: "assassin", icon: "AvwRy3tv3qvIAAAAAElFTkSuQmCC" },
  { key: "saint", type: "support", icon: "Gf4Go32S6bUXVsAAAAAASUVORK5CYII=" },
  { key: "shinobi", type: "assassin", icon: "mg5B+uiFewcI/ewAAAAABJRU5ErkJggg==" },
  { key: "spy", type: "assassin", icon: "TQzAPQNzN6gAAAAASUVORK5CYII=" },
  { key: "tank", type: "armored", icon: "ampqZdtc4D3FPwxeZVk5dLefAAAAAElFTkSuQmCC" },
  { key: "templar", type: "support", icon: "yHf+H+B8TrvPZFQhdvgAAAABJRU5ErkJggg==" },
  { key: "vampire", type: "armored", icon: "M9WGHTKw8vy7AlV0IJJZRQQh78C0IfEIi3WRZBAAAAAElFTkSuQmCC" },
  { key: "warbeast", type: "melee", icon: "/AveH3CXL9Oh4wAAAABJRU5ErkJggg==" },
  { key: "warrior", type: "melee", icon: "gXc5CPDJVy5YIAAAAASUVORK5CYII=" },
];

const arrayOfUnits = [
  { key: "", type: "", icon: "" },
  { key: "vibe", type: "vibe", icon: "vibe" },
  { key: "archer", type: "ranged", icon: "FBpkaZY" },
  { key: "artillery", type: "ranged", icon: "3GY1DLAQ" },
  { key: "ballon", type: "ranged", icon: "FoPPa6g" },
  { key: "barbarian", type: "melee", icon: "y2azrA3g" },
  { key: "berserker", type: "melee", icon: "BCIAAA" },
  { key: "blob", type: "armored", icon: "lXTAAA" },
  { key: "bomber", type: "ranged", icon: "Qwp8wBk" },
  { key: "buster", type: "assassin", icon: "PccPYIHw" },
  { key: "centurion", type: "armored", icon: "DUwAAA" },
  { key: "fairy", type: "support", icon: "fNJqA" },
  { key: "flag", type: "melee", icon: "kF7A" },
  { key: "flying", type: "assassin", icon: "gsge2mI" },
  { key: "gladiator", type: "melee", icon: "EMwa84U" },
  { key: "healer", type: "support", icon: "UY3n8" },
  { key: "lancer", type: "melee", icon: "PU+OGw" },
  { key: "mage", type: "ranged", icon: "4q+bQmL8" },
  { key: "monk", type: "support", icon: "d46Ekxw" },
  { key: "musketeer", type: "ranged", icon: "dl9SBC7g" },
  { key: "necromancer", type: "support", icon: "85VI" },
  { key: "orc", type: "armored", icon: "VPaasGY8" },
  { key: "paladin", type: "armored", icon: "iYUeo" },
  { key: "rogue", type: "assassin", icon: "gRjLD" },
  { key: "saint", type: "support", icon: "PBUHpCg" },
  { key: "shinobi", type: "assassin", icon: "Xsczq" },
  { key: "spy", type: "assassin", icon: "FJbDFfQ" },
  { key: "tank", type: "armored", icon: "Xek7Hqu" },
  { key: "yemplar", type: "support", icon: "CynUl" },
  { key: "vampire", type: "armored", icon: "Bl5378" },
  { key: "warbeast", type: "melee", icon: "SRJSYo" },
  { key: "warrior", type: "elee", icon: "YtuUAHQ" },
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

  console.log("log 1");
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
  console.log("log 2");
  // Collects rewards if there are any
  const rewardButton = document.querySelector(".actionButton.actionButtonPrimary.rewardsButton");
  if (rewardButton) {
    await rewardButton.click();
  }

  const placeUnitButtons = document.querySelectorAll(".actionButton.actionButtonPrimary.capSlotButton.capSlotButtonAction");
  let placeUnit = null;
  console.log("log 2.5")
  if (placeUnitButtons.length == 0) {
    isRunning = false
    await performCollection()
    return
  } else if (placeUnitButtons.length != 0) {
    console.log("log 3");
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
        console.log("log 3.5");
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
        console.log("log 4");
        if (await retrieveFromStorage('loyaltySwitch')) {
          try {
            captainLoyalty = await getCaptainFlag(captainNameFromDOM, 'captainLoyalty');
          } catch (error) {
            captainLoyalty = false
          }
        } else {
          captainLoyalty = false
        }
        console.log("log 5");
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
          console.log("log 6");
          continue
        } else if ((dungeonCaptainNameFromStorage == captainNameFromDOM) && !captainSlot.innerText.includes("Dungeons") ||
          (clashCaptainNameFromStorage == captainNameFromDOM) && !captainSlot.innerText.includes("Clash") ||
          (duelsCaptainNameFromStorage == captainNameFromDOM) && !captainSlot.innerText.includes("Duel")) {
          captainSlot.style.backgroundColor = red;
          console.log("log 7");
          continue
        }
        else if (((captainSlot.innerText.includes("Dungeons") && !dungeonSwitch) || (captainSlot.innerText.includes("Clash") && !clashSwitch) ||
          ((captainSlot.innerText.includes("Duel") && !duelSwitch))) &&
          captainSlot.querySelector('.capSlotClose') == null) {
          console.log("log 8");
          continue
        } else {
          console.log("log 9");
          goldLoyalty = captainSlot.outerHTML.includes('LoyaltyGold');
          placeUnit = button
          break;
        }

      } else {
        console.log("log 10");
        continue
      }
    }
  }
  fullLength = 0
  if (placeUnit) {
    console.log("log 11");
    placeUnit.click();
    await delay(3000)
    openBattlefield();
  } else {
    isRunning = false
    return
  }

  // Change captains using a different device without the script freezing trying to select a captain.
  const slideMenuTops = document.querySelectorAll('.slideMenuTop');
  console.log("log 12");
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
  console.log("log 13");
  isRunning = false
  await collectQuests()
  await buyScrolls()
}

// This function checks if the battlefield is present and zooms into it.
async function openBattlefield() {

  //Check loyalty here
  let battleInfo
  try {
    console.log("log 14");
    battleInfo = document.querySelector(".battleInfoMapTitle").innerText;
  } catch (error) {
    isRunning = false
    return
  }
  let mode = false
  //Duels and clash strings here.
  console.log("log 15");
  if (battleInfo.includes("Level") || battleInfo.includes("vs") || battleInfo.includes("VS") ||
    battleInfo.includes("Versus") || battleInfo.includes("versus")) {
    mode = true
  }
  if (!goldLoyalty && mode == false) {
    battleInfo = document.querySelector(".battleInfoMapTitle")
    battleInfo.click()
    console.log("log 16");
    const chest = document.querySelector(".mapInfoRewardsName").innerText;
    if ((chest === "Loyalty Gold Chest" || chest === "Loyalty Skin Chest" || chest === "Loyalty Token Chest" || chest === "Loyalty Super Boss Chest" ||
      chest === "Loyalty Boss Chest") && await retrieveFromStorage('loyaltySwitch')) {
      console.log("log 17");
      await flagCaptain('captainLoyalty')
      location.reload()
    } else {
      const closeButton = document.querySelector('.slideMenuCont.slideUp.slideUpOpen.slideMenuShortOpen.slideMenuShortOpenMore .slideMenuTop .far.fa-times');
      if (closeButton) {
        console.log("log 18");
        closeButton.click();
        zoom()
      }
    }
  } else {
    console.log("log 19");
    zoom()
  }
}

function zoom() {
  const zoomButton = document.querySelector(".fas.fa-plus");
  if (zoomButton) {
    for (let i = 0; i < 7; i++) {
      console.log("log 20");
      zoomButton.click();
    };
    console.log("log 21");
    markerAttempt = 0
    arrayOfMarkers = null
    getValidMarkers();
  }
}

//Looks and selects a valid marker for placement

async function getValidMarkers() {
  reloadRoot();
  console.log("log 21");
  await delay(5000);
  arrayOfMarkers = document.querySelectorAll(".planIcon");
  //Captain is on open map only
  if (arrayOfMarkers.length == 0) {
    //Map without any markers.
    const clockElement = document.querySelector('.battlePhaseTextClock .clock');
    if (clockElement == null) {
      console.log("log 22");
      goHome()
      return
    }
    const timeText = clockElement.innerText.replace(':', '');
    const time = parseInt(timeText, 10);
    if (time > 2915) {
      console.log("log 23");
      goHome()
      return;
    } else {
      arrayOfAllyPlacement = document.querySelectorAll(".placementAlly");
      currentMarker = arrayOfAllyPlacement[Math.floor(Math.random() * arrayOfAllyPlacement.length)];
      moveScreenRandomPosition();
      console.log("log 24");
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
    console.log("log 25");
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
  console.log("log 25");
  let matchingMarker
  //This indicates that an attempt to place at the current marker has been made
  if (markerAttempt >= 1) {
    console.log("log 26");
    try {
      matchingMarker = arrayOfBattleFieldMarkers.find(marker => marker.key === currentMarkerKey).icon;
    } catch (error) {
      await flagCaptain('flaggedCaptains')
      goHome()
      return
    }
    console.log("log 27");
    arrayOfMarkers.forEach(planIcon => {
      const backgroundImageValue = getComputedStyle(planIcon).getPropertyValue('background-image');
      if (backgroundImageValue.includes(matchingMarker)) {
        planIcon.remove()
      }
    });
    arrayOfMarkers = document.querySelectorAll(".planIcon");
  }
  if (arrayOfMarkers.length == 0) {
    console.log("log 28");
    //there are no units to match any of the available markers
    await flagCaptain('flaggedCaptains')
    goHome()
    return
  } else {
    currentMarkerKey = ""
    console.log("log 29");
    // The randomization of the index increased the chances of getting a valid placement.
    currentMarker = arrayOfMarkers[Math.floor(Math.random() * (arrayOfMarkers.length - 1))];
    // This bit gets the marker type for comparison later
    computedStyle = getComputedStyle(currentMarker);
    backgroundImageValue = computedStyle.getPropertyValue('background-image');
    console.log("log 30");
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
  console.log("log 31");
  const positions = ['start', 'center', 'end', 'nearest'];
  const randomPosition = positions[Math.floor(Math.random() * positions.length)];
  await moveScreen(randomPosition);
}

//Vertical and horizontal center
async function moveScreenCenter() {
  console.log("log 32");
  await moveScreen('center');
}

//Scroll into view the center of the currentMark
async function moveScreen(position) {
  console.log("log 33");
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
  console.log("log 34");
}

//Opens unit inventory tab, boosts unit and selects the first available unit that isn't on cooldown
//or isn't legendary. It also grabs the unit name for future marker validation.
async function selectUnit() {
  console.log("log 35");
  let placeUnitSelection = document.querySelector(".actionButton.actionButtonPrimary.placeUnitButton");
  if (placeUnitSelection) {
    placeUnitSelection.click();
  }
  console.log("log 36");
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
  console.log("log 37");
  if (potionState == 1 && number >= 45) {
    if (epicButton) {
      epicButton.click();
    }
  } else if (potionState && number == 100) {
    if (epicButton) {
      epicButton.click();
    }
  }
  console.log("log 38");
  let unitDrawer;
  unitName = ""
  unitDrawer = document.querySelectorAll(".unitSelectionCont");
  const unitsQuantity = unitDrawer[0].children.length;
  for (let i = 1; i <= unitsQuantity; i++) {
    console.log("log 39");
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
    console.log("log 40");
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
    console.log("log 41");
    //If the unit can't be used, get the next
    if ((commonCheck && !commonSwitch && !isDungeon) ||
      (legendaryCheck && !legendarySwitch && !isDungeon) ||
      (rareCheck && !rareSwitch && !isDungeon) ||
      (uncommonCheck && !uncommonSwitch && !isDungeon) ||
      coolDownCheck || defeatedCheck || !unitDisabled) {
      if (i >= unitsQuantity) {
        console.log("log 42");
        markerAttempt++
        getSetMarker()
        return
      } else {
        continue
      }
    }
    else if (currentMarkerKey == "vibe" || currentMarkerKey == "" || currentMarkerKey == unitType || currentMarkerKey == unitName) {
      console.log("log 43");
      unit.click();
      await delay(1000);
      tapUnit();
      return
    } else {
      console.log("log 51");
      continue;
    }
  }
  console.log("log 44");
  goHome()
}

//If the unit is in a valid marker that is in use, by taping the unit container it forces a button recheck on mouseup/touchend
function tapUnit() {
  reloadRoot()
  console.log("log 45");
  const placerUnitCont = document.querySelector('.placerUnitCont');
  const event = new Event('mouseup', { bubbles: true, cancelable: true });
  placerUnitCont.dispatchEvent(event);
}

//Places unit or asks for a new valid marker
function placeTheUnit() {
  console.log("log 46");
  //Gets timer and if it's 0, goes back to menu
  let clockText
  try {
    clockText = document.querySelector('.battlePhaseTextClock .clock').innerText;
  } catch (error) {
    isRunning = false
    return
  }

  if (clockText === "00:00") {
    console.log("log 46");
    let placerButton = document.querySelector(".actionButton.actionButtonNegative.placerButton");
    let selectorBack = document.querySelector(".selectorBack");

    if (placerButton && selectorBack) {
      console.log("log 47");
      placerButton.click();
      selectorBack.click();
      isRunning = false;
    }
  }

  //Attemps to place the unit and go back to menu, if the marker is valid, but in use, get a new marker.
  const confirmPlacement = document.querySelector(".actionButton.actionButtonPrimary.placerButton");
  console.log("log 48");
  if (confirmPlacement) {
    const blockedMarker = document.querySelector(".placerRangeIsBlocked");
    if (blockedMarker) {
      const cancelButton = document.querySelector(".actionButton.actionButtonNegative.placerButton");
      if (cancelButton) {
        console.log("log 48");
        cancelButton.click();
      }
      if (currentMarkerKey != null || currentMarkerKey != 0) {
        getValidMarkers();
      } else {
        //moveScreenRandomPosition()
        return
      }
    } else {
      confirmPlacement.click();
      console.log("log 49");
      const cancelButton2 = document.querySelector(".actionButton.actionButtonNegative.placerButton");
      if (cancelButton2) {
        console.log("log 50");
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


document.addEventListener('DOMContentLoaded', function () {
  var rootElement = document.getElementById('root');
  if (rootElement && rootElement.children.length === 0) {
    location.reload()
  }
});

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