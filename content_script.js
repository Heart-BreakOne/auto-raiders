setInterval(start, 15000);
setInterval(changeBackgroundColor, 5000);

let currentMarkerKey = "";
let currentMarker;
let arrayOfMarkers;
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
  { key: "benturion", type: "armored", icon: "DUwAAA" },
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
var res
// This is the start, it selects a captain placement as well as collect any rewards to proceed
async function start() {

  const switchState = await getSwitchState("scrollSwitch");
  console.log("log ", switchState);

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
    //Comment this line to disable both scroll shop and quest collection
    buyScrolls()
  }

  const placeUnitButtons = document.querySelectorAll(".actionButton.actionButtonPrimary.capSlotButton.capSlotButtonAction");
  let placeUnit = null;
  if (placeUnitButtons.length != 0) {
    for (var button of placeUnitButtons) {
      if (button.innerText.includes("PLACE UNIT")) {
        var captainSlot = button.closest('.capSlot');
        const dungeonCaptainNameFromStorage = await retrieveFromStorage('dungeonCaptain');
        const clashCaptainNameFromStorage = await retrieveFromStorage('clashCaptain');
        const duelsCaptainNameFromStorage = await retrieveFromStorage('duelsCaptain');
        const captainNameFromDOM = captainSlot.querySelector('.capSlotName').innerText;
        if ((dungeonCaptainNameFromStorage != captainNameFromDOM) && captainSlot.innerText.includes("Dungeons") ||
          (clashCaptainNameFromStorage != captainNameFromDOM) && captainSlot.innerText.includes("Clash") ||
          (duelsCaptainNameFromStorage != captainNameFromDOM) && captainSlot.innerText.includes("Duel")) {
          continue
        } else if ((dungeonCaptainNameFromStorage == captainNameFromDOM) && !captainSlot.innerText.includes("Dungeons") ||
        (clashCaptainNameFromStorage == captainNameFromDOM) && !captainSlot.innerText.includes("Clash") ||
        (duelsCaptainNameFromStorage == captainNameFromDOM) && !captainSlot.innerText.includes("Duel")) {
          captainSlot.style.backgroundColor = '#ff0000';
          continue
        }
        else if ((captainSlot.innerText.includes("Dungeons") || captainSlot.innerText.includes("Clash") ||
          captainSlot.innerText.includes("Duel")) &&
          captainSlot.querySelector('.capSlotClose') == null) {
          continue
        } else {
          placeUnit = button
          break;
        }
      } else {
        continue;
      }
    }
  }

  if (placeUnit) {
    placeUnit.click();
    openBattlefield();
  } else {
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
}

// This function checks if the battlefield is present and zooms into it.
function openBattlefield() {
  const zoomButton = document.querySelector(".fas.fa-plus");
  if (zoomButton) {
    for (let i = 0; i < 7; i++) {
      zoomButton.click();
    };
    getValidMarkers();
  }
}

//Looks and selects a valid marker for placement
const getValidMarkers = async () => {
  const markersDelay = ms => new Promise(res => setTimeout(res, ms));
  let loopIndex = 0
  await markersDelay(5000);
  let validMarker = false;
  arrayOfMarkers = document.querySelectorAll(".planIcon");
  do {
    loopIndex++
    if (arrayOfMarkers.length != 0) {
      currentMarkerKey = ""
      // The randomization of the index increased the chances of getting a valid placement.
      currentMarker = arrayOfMarkers[Math.floor(Math.random() * (arrayOfMarkers.length - 1))];
      // This bit gets the marker type for comparison later
      const computedStyle = getComputedStyle(currentMarker);
      const backgroundImageValue = computedStyle.getPropertyValue('background-image');

      arrayOfBattleFieldMarkers.some(marker => {
        if (backgroundImageValue.includes(marker.icon)) {
          currentMarkerKey = marker.key
        }
      });
    }

    //If there are no markers, waits 45 seconds for captain to place markers, if any.
    if (arrayOfMarkers.length === 0) {
      const clockElement = document.querySelector('.battlePhaseTextClock .clock');
      if (clockElement == null) {
        return
      }
      const timeText = clockElement.innerText.replace(':', '');
      const time = parseInt(timeText, 10);
      if (time > 2915) {
        goHome()
        return;
      } else {
        const arrayOfAllyPlacement = document.querySelectorAll(".placementAlly");
        currentMarker = arrayOfAllyPlacement[Math.floor(Math.random() * arrayOfAllyPlacement.length)];
        validMarker = true;
        moveScreenRandomPosition();
      }
    } else {
      //If it's a block marker, get a new marker, if vibe or unit type place.
      if (currentMarkerKey.includes("no")) {
        if (loopIndex >= 4000) {
          goHome()
          return;
        } else {
          continue;
        }
      } else {
        for (let i = 0; i < arrayOfUnits.length; i++) {
          loopIndex++
          if (loopIndex >= 4000) {
            goHome()
            return;
          }
          const element = arrayOfUnits[i];
          if (currentMarkerKey === element.key || currentMarkerKey === element.type) {
            validMarker = true;
            moveScreenCenter();
            break;
          }
        }
      }
    }
    if (loopIndex >= 4000) {
      goHome()
      return;
    }
  } while (!validMarker);
}

//When there are no markers, it can be trick to scroll to a valid position into view, this randomizes the possible values.
const moveScreenRandomPosition = async () => {
  const positions = ['start', 'center', 'end', 'nearest'];
  const randomPosition = positions[Math.floor(Math.random() * positions.length)];
  await moveScreen(randomPosition);
}

//Vertical and horizontal center
const moveScreenCenter = async () => {
  await moveScreen('center');
}

//Scroll into view the center of the currentMark
const moveScreen = async (position) => {

  //They say two bodies cannot occupy the same point in space and time so we turn the marker into 0 so our unit can fit on that space
  currentMarker.style.width = '0';
  currentMarker.style.height = '0';
  currentMarker.style.backgroundSize = '0';

  currentMarker.scrollIntoView({ block: 'center', inline: position });

  await delay(2000);
  selectUnit();
  await delay(1000);
  tapUnit();
  await delay(1000);
  placeTheUnit();
}

//Opens unit inventory tab, boosts unit and selects the first available unit that isn't on cooldown
//or isn't legendary. It also grabs the unit name for future marker validation.
async function selectUnit() {
  let placeUnitSelection = document.querySelector(".actionButton.actionButtonPrimary.placeUnitButton");
  if (placeUnitSelection) {
    placeUnitSelection.click();
  }
  //Use a potion if there are 100 potions available, uncomment to enable it.

  const potionSwitch = await getSwitchState("potionSwitch");
  if (potionSwitch) {
    let headers = document.querySelectorAll(".quantityItemsCont");
    let potions = null;
    headers.forEach(header => {
      const imgElement = header.querySelector('img[alt="Potion"]');
      if (imgElement) {
        potions = header;
      }
    });
    if (potions.innerText.includes("100 / 100")) {
      let epicButton = document.querySelector(".actionButton.actionButtonPrimary.epicButton");
      if (epicButton) {
        epicButton.click();
      }
    }
  }


  let unitDrawer;
  canUse = false;
  unitName = ""
  unitDrawer = document.querySelectorAll(".unitSelectionCont");
  const lenght = unitDrawer[0].children.length;
  for (let i = 1; i <= lenght; i++) {
    const unit = unitDrawer[0].querySelector(".unitSelectionItemCont:nth-child(" + i + ") .unitItem:nth-child(1)")
    console.log("")
    let legendaryCheck = unit.querySelector('.unitRarityLegendary');
    let uncommonCheck = unit.querySelector('.unitRarityUncommon');
    let rareCheck = unit.querySelector('.unitRarityRare');
    let coolDownCheck = unit.querySelector('.unitItemCooldown');
    let defeatedCheck = unit.querySelector('.defeatedVeil');
    let unitType = unit.querySelector('.unitClass img').getAttribute('alt');
    var unitName = unit.querySelector('.unitClass img').getAttribute('src').slice(-50);
    let unitDisabled = unit.querySelector('.unitItemDisabledOff');
    let legendarySwitch
    let rareSwitch
    let uncommonSwitch
    var isDungeon = false

    if(legendaryCheck) {
      legendarySwitch = await getSwitchState("legendarySwitch");
    } else if (rareCheck) {
      rareSwitch = await getSwitchState("rareSwitch");
    } else if (uncommonCheck) {
      uncommonSwitch = await getSwitchState("uncommonSwitch");
    }

    //Get human readable unitName
    const unit1 = arrayOfUnits.filter(unit1 => unitName.includes(unit1.icon))[1];
    console.log("checkpoint")
    if (unit1) {
      unitName = unit1.key;
      console.log("check2")
    }

    //Check if it's dungeon so the usage of legendary units can be allowed
    let dungeonCheck = document.querySelector('.battleInfoMapTitle');
    if (dungeonCheck.innerText === 'Level: ') {
      isDungeon = true
      console.log("check3")
    }

    //If the unit can't be used, get the next
    if ((legendaryCheck && !isDungeon) || (legendaryCheck && !legendarySwitch && !isDungeon) || (rareCheck && !rareSwitch) || (uncommonCheck && !uncommonSwitch) || coolDownCheck || defeatedCheck || !unitDisabled) {
      continue;
    }
    else if (currentMarkerKey == "vibe" || currentMarkerKey == "" || currentMarkerKey == unitType || currentMarkerKey == unitName) {
      unit.click();
      canUse = true;
      console.log("check5")
      break;
    } else {
      continue;
      console.log("check6")
    }
  }
  goHome()
  console.log("exit")
}

//If the unit is in a valid marker that is in use, by taping the unit container it forces a button recheck on mouseup/touchend
function tapUnit() {
  const placerUnitCont = document.querySelector('.placerUnitCont');
  const event = new Event('mouseup', { bubbles: true, cancelable: true });
  placerUnitCont.dispatchEvent(event);
}

//Places unit or asks for a new valid marker
function placeTheUnit() {
  //Gets timer and if it's 0, goes back to menu
  let clockText = "x";
  clockText = document.querySelector('.battlePhaseTextClock .clock').innerText;

  if (clockText === "00:00") {
    let placerButton = document.querySelector(".actionButton.actionButtonNegative.placerButton");
    let selectorBack = document.querySelector(".selectorBack");

    if (placerButton && selectorBack) {
      placerButton.click();
      selectorBack.click();
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
      getValidMarkers();
    } else {
      confirmPlacement.click();
      const cancelButton2 = document.querySelector(".actionButton.actionButtonNegative.placerButton");
      if (cancelButton2) {
        cancelButton2.click();
        let selectorBack = document.querySelector(".selectorBack");
        if (selectorBack) {
          selectorBack.click()
        }
      }
    }
  }

  //Unit was placed successfully, returns to main menu and the process restarts.
  setTimeout(() => {
    // Unit was successfully placed, exit battlefield and restart cycle
    const placementSuccessful = document.querySelector(".actionButton.actionButtonDisabled.placeUnitButton");
    if (placementSuccessful) {
      const backHome = document.querySelector(".selectorBack");
      if (backHome) {
        backHome.click();
      }
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
  if(captainSlots.length != 1) {
    return
  }
  const firstCapSlot = captainSlots[0];
  const capSlotChildren = firstCapSlot.querySelectorAll('.capSlot');
  const dungeonCaptainNameFromStorage = await retrieveFromStorage('dungeonCaptain');
  const clashCaptainNameFromStorage = await retrieveFromStorage('clashCaptain');
  const duelsCaptainNameFromStorage = await retrieveFromStorage('duelCaptain');

  capSlotChildren.forEach(capSlot => {
    // Do something with each .capSlot element
    const captainNameFromDOM = capSlot.querySelector('.capSlotName').innerText;
    if ((dungeonCaptainNameFromStorage != captainNameFromDOM) && capSlot.innerText.includes("Dungeons") ||
      (clashCaptainNameFromStorage != captainNameFromDOM) && capSlot.innerText.includes("Clash") ||
      (duelsCaptainNameFromStorage != captainNameFromDOM) && capSlot.innerText.includes("Duel")) {
      capSlot.style.backgroundColor = '#ff0000';
    } else {
      capSlot.style.backgroundColor = '#2a6084';
    }
  });
}