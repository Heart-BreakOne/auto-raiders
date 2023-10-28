setInterval(start, 15000);
setInterval(checkBattle, 15000);
let unitName = "";
let currentMarkerKey = "";
let currentMarker;
let arrayOfMarkers;
let markerKeySliced = "";
const delay = ms => new Promise(res => setTimeout(res, ms));

const arrayOfBattleFieldMarkers = [
    { key: "no", icon: "SVfCVffvkM+J2ics+hWvYAAAAASUVORK5CYII=" },
    { key: "vibe", icon: "1ePfwIYQTqrB9OwOgAAAABJRU5ErkJggg" },
    { key: "armored", icon: "AdcfHG0nPVXlAAAAAElFTkSuQmCC" },
    { key: "assassin", icon: "aJRY4s+IiegAAAABJRU5ErkJggg==" },
    { key: "melee", icon: "4HmcImnbn" },
    { key: "ranged", icon: "" },
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
  { key: "Vibe", type: "Vibe", icon: "Vibe" },
  { key: "Archer", type: "Ranged", icon: "FBpkaZY" },
  { key: "Artillery", type: "Ranged", icon: "3GY1DLAQ" },
  //{ key: "Balloon Buster", type: "Ranged", icon: "FoPPa6g" },
  { key: "Balloonbuster", type: "Ranged", icon: "FoPPa6g" },
  { key: "Barbarian", type: "Melee", icon: "y2azrA3g" },
  { key: "Berserker", type: "Melee", icon: "BCIAAA" },
  { key: "Blob", type: "Armored", icon: "lXTAAA" },
  { key: "Bomber", type: "Ranged", icon: "Qwp8wBk" },
  { key: "Buster", type: "Assassin", icon: "PccPYIHw" },
  { key: "Centurion", type: "Armored", icon: "DUwAAA" },
  { key: "Fairy", type: "Support", icon: "fNJqA" },
  { key: "Flagbearer", type: "Melee", icon: "kF7A" },
  { key: "Flyingrogue", type: "Assassin", icon: "gsge2mI" },
  //{ key: "Flying Rogue", type: "Assassin", icon: "gsge2mI" },
  { key: "Gladiator", type: "Melee", icon: "EMwa84U" },
  { key: "Healer", type: "Support", icon: "UY3n8" },
  { key: "Lancer", type: "Melee", icon: "PU+OGw" },
  { key: "Mage", type: "Ranged", icon: "4q+bQmL8" },
  { key: "Monk", type: "Support", icon: "d46Ekxw" },
  { key: "Musketeer", type: "Ranged", icon: "dl9SBC7g" },
  { key: "Necromancer", type: "Support", icon: "85VI" },
  { key: "Orcslayer", type: "Armored", icon: "VPaasGY8" },
  //{ key: "Orc Slayer", type: "Armored", icon: "VPaasGY8" },
  { key: "Paladin", type: "Armored", icon: "iYUeo" },
  { key: "Rogue", type: "Assassin", icon: "gRjLD" },
  { key: "Saint", type: "Support", icon: "PBUHpCg" },
  { key: "Shinobi", type: "Assassin", icon: "Xsczq" },
  { key: "Spy", type: "Assassin", icon: "FJbDFfQ" },
  { key: "Tank", type: "Armored", icon: "Xek7Hqu" },
  { key: "Templar", type: "Support", icon: "CynUl" },
  { key: "Vampire", type: "Armored", icon: "Bl5378" },
  { key: "Warbeast", type: "Melee", icon: "SRJSYo" },
  { key: "Warrior", type: "Melee", icon: "YtuUAHQ" },
];
// This is the start, it selects a captain placement as well as collect any rewards to proceed
async function start() {

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
    //collectBattlePass()
  }

  const placeUnitButtons = document.querySelectorAll(".actionButton.actionButtonPrimary.capSlotButton.capSlotButtonAction");
  let placeUnit = null;
  if (placeUnitButtons.length != 0) {
    for (var button of placeUnitButtons) {
      if (button.innerText.includes("PLACE UNIT")) {
        var captainSlot = button.closest('.capSlot');
        if ((captainSlot.innerText.includes("Dungeons") || captainSlot.innerText.includes("Clash") ||
          captainSlot.innerText.includes("Duels")) &&
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
  let loopIndex = 0
  await delay(5000);
  let validMarker = false;
  arrayOfMarkers = document.querySelectorAll(".planIcon");
  do {
    loopIndex++
    if (arrayOfMarkers.length != 0) {
      currentMarkerKey = ""
      // The randomization of the index increased the chances of getting a valid placement.
      currentMarker = arrayOfMarkers[Math.floor(Math.random() * (arrayOfMarkers.length - 1))];
      // This bit gets the marker type for comparison later
      const regex = /__reactInternalInstance\$[a-zA-Z0-9]+/;
      const matchedProperty = Object.keys(currentMarker).find(prop => regex.test(prop));
      currentMarkerKey = currentMarker[matchedProperty].key;
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
      if (currentMarkerKey.includes("NoPlacement")) {
        if (loopIndex >= 4000) {
          goHome()
          return;
        } else {
          continue;
        }
      } else {
        markerKeySliced = currentMarkerKey.slice(0, currentMarkerKey.indexOf("-"));
        for (let i = 0; i < arrayOfUnits.length; i++) {
          loopIndex++
          if (loopIndex >= 4000) {
            goHome()
            return;
          }
          const element = arrayOfUnits[i];
          if (markerKeySliced === element.key || markerKeySliced === element.type) {
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
function selectUnit() {
  let placeUnitSelection = document.querySelector(".actionButton.actionButtonPrimary.placeUnitButton");
  if (placeUnitSelection) {
    placeUnitSelection.click();
  }
  /* Use a potion if there are 100 potions available, uncomment to enable it.
      let potions = document.getElementsByClassName("quantityText")[3].innerText;
      if (potions.includes("100 / 100")) {
      let epicButton = document.querySelector(".actionButton.actionButtonPrimary.epicButton");
      if (epicButton) {
        epicButton.click();
      }
    }
  */
  let index = 1;
  let placeableUnit;
  canUse = false;
  unitName = ""
  do {

    /*placeableUnit = document.querySelectorAll(".unitSelectionCont");
    const firstElementChildrenCount = placeableUnit[0].children.length;
    for (let i = 0; i < firstElementChildrenCount; i++) {
       //Check if the unit is available and can be used, if not get a new unit
    } */
    
    console.log("start")
    placeableUnit = null
    placeableUnit = document.querySelector(".unitSelectionItemCont:nth-child(" + index + ") .unitItem:nth-child(1)");
    let legendaryCheck = placeableUnit.querySelector('.unitRarityLegendary');
    let coolDownCheck = placeableUnit.querySelector('.unitItemCooldown');
    let defeatedCheck = placeableUnit.querySelector('.defeatedVeil');
    let unitType = placeableUnit.querySelector('.unitClass img').getAttribute('alt');
    var unitName = placeableUnit.querySelector('.unitClass img').getAttribute('src').slice(-50);
    let unitDisabled = placeableUnit.querySelector('.unitItemDisabledOff');
    var isDungeon = false
    console.log("check1")
    //Get human readable unitName
    const unit = arrayOfUnits.filter(unit => unitName.includes(unit.icon))[1];
    console.log("checkpoint")
    if (unit) {
      unitName = unit.key;
      console.log("check2")
    }
    //Check if it's dungeon so the usage of legendary units can be allowed
    let dungeonCheck = document.querySelector('.battleInfoMapTitle');
    if (dungeonCheck.innerText === 'Level: ') {
      isDungeon = true
      console.log("check3")
    }
    //If the unit can't be used, get the next
    if ((legendaryCheck && !isDungeon) || coolDownCheck || defeatedCheck || !unitDisabled) {
      index++;
      console.log("check4")
    }
    else if (markerKeySliced == "Vibe" || markerKeySliced == "" || markerKeySliced == unitType || markerKeySliced == unitName) {
      canUse = true;
      placeableUnit.click();
      console.log("check5")
    } else {
      index++
      console.log("check6")
    }
    console.log("check7")
  } while (canUse == false);
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

//A warning popups under certain conditions, by clicking back the issue can be resolved.
setInterval(function () {
  const modalTab = document.querySelector(".modalScrim.modalOn");
  if (!modalTab) {
    return;
  }
  const buttons = document.querySelectorAll('button.actionButton.actionButtonPrimary');
  buttons.forEach(button => {
    const buttonText = button.querySelector('div').textContent.trim();
    if (buttonText === 'GO BACK') {
      button.click();
    }
  });
}, 15000);

//Handles some conditions in which the battle has started.
async function checkBattle() {

  let battleButton = document.querySelector('.placeUnitButtonItems');
  if (battleButton && (battleButton.innerText.includes('UNIT READY TO PLACE IN') || battleButton.innerText.includes('BATTLE STARTING SOON'))) {
    await delay(15000);
    battleButton = document.querySelector('.placeUnitButtonItems');
    if (battleButton && (battleButton.innerText.includes('UNIT READY TO PLACE IN') || battleButton.innerText.includes('BATTLE STARTING SOON'))) {
      location.reload();
    }
  }

  const battleLabel = document.querySelector('.battlePhaseTextCurrent');
  if (battleLabel) {
    if (battleLabel.innerText === 'Battle Ready') {
      const computedStyle = window.getComputedStyle(battleLabel);
      const color = computedStyle.getPropertyValue('color');
      if (color === 'rgb(49, 255, 49)') {
        location.reload();
      }
    }
  }

  checkAndReload('.leaderboardCont', 75000)
  //If the battlefield is opened at the same time as the timer reaches 00:00 it will freeze there, a reload fixes it.
  checkAndReload('.battleLoading', 50000);
  //If the first loading screen frseezes
  checkAndReload('.loadingView', 10000);
  //If the second loading screen freezes
  checkAndReload('.splashCont', 10000);
}

//Receives a selector, check if it exists, checks again in 10 seconds and reloads page since it means the game froze
async function checkAndReload(selector, delayTimer) {
  let element = document.querySelector(selector);
  if (element) {
    await delay(delayTimer);
    element = document.querySelector(selector);
    if (element) {
      location.reload();
    }
  }
}

function goHome() {
  const backHome = document.querySelector(".selectorBack");
  if (backHome) {
    backHome.click();
  }
}

function collectBattlePass() {
  //Get header buttons and click on Reward button
  const headerButtons = document.querySelectorAll(".actionButton.actionButtonGift");
  headerButtons.forEach(rewardButton => {
    if (rewardButton.innerText.includes("REWARDS")) {
      rewardButton.click
      //collect rewards if there are any
      const collectButtons = document.querySelectorAll(".actionButton.actionButtonCollect.rewardActionButton");
      for (button of collectButtons) {
        button.click();

        const confirmButtons = document.querySelectorAll(".actionButton.actionButtonPrimary");
        confirmButtons.forEach(confirm => {
          if (confirm.innerText.includes("CONFIRM AND COLLECT")) {
            confirm.click();
            confirm.submit();
          }
        });

      }
      const closeButton = document.querySelector(".far.fa-times");
      if (closeButton) {
        closeButton.click();
        const event = new Event('mouseup', { bubbles: true, cancelable: true });
        closeButton.dispatchEvent(event);
      }
    }
  });
}