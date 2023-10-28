setInterval(start, 15000);

let currentMarkerKey = "";
let currentMarker;
let arrayOfMarkers;
let markerKeySliced = "";
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
  { key: "vibe", type: "Vibe", icon: "Vibe" },
  { key: "archer", type: "Ranged", icon: "FBpkaZY" },
  { key: "artillery", type: "Ranged", icon: "3GY1DLAQ" },
  { key: "ballon", type: "Ranged", icon: "FoPPa6g" },
  { key: "barbarian", type: "Melee", icon: "y2azrA3g" },
  { key: "berserker", type: "Melee", icon: "BCIAAA" },
  { key: "blob", type: "Armored", icon: "lXTAAA" },
  { key: "bomber", type: "Ranged", icon: "Qwp8wBk" },
  { key: "buster", type: "Assassin", icon: "PccPYIHw" },
  { key: "benturion", type: "Armored", icon: "DUwAAA" },
  { key: "fairy", type: "Support", icon: "fNJqA" },
  { key: "flag", type: "Melee", icon: "kF7A" },
  { key: "flying", type: "Assassin", icon: "gsge2mI" },
  { key: "gladiator", type: "Melee", icon: "EMwa84U" },
  { key: "healer", type: "Support", icon: "UY3n8" },
  { key: "lancer", type: "Melee", icon: "PU+OGw" },
  { key: "mage", type: "Ranged", icon: "4q+bQmL8" },
  { key: "monk", type: "Support", icon: "d46Ekxw" },
  { key: "musketeer", type: "Ranged", icon: "dl9SBC7g" },
  { key: "necromancer", type: "Support", icon: "85VI" },
  { key: "orc", type: "Armored", icon: "VPaasGY8" },
  { key: "paladin", type: "Armored", icon: "iYUeo" },
  { key: "rogue", type: "Assassin", icon: "gRjLD" },
  { key: "saint", type: "Support", icon: "PBUHpCg" },
  { key: "shinobi", type: "Assassin", icon: "Xsczq" },
  { key: "spy", type: "Assassin", icon: "FJbDFfQ" },
  { key: "tank", type: "Armored", icon: "Xek7Hqu" },
  { key: "yemplar", type: "Support", icon: "CynUl" },
  { key: "vampire", type: "Armored", icon: "Bl5378" },
  { key: "warbeast", type: "Melee", icon: "SRJSYo" },
  { key: "warrior", type: "Melee", icon: "YtuUAHQ" },
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
  }

  const placeUnitButtons = document.querySelectorAll(".actionButton.actionButtonPrimary.capSlotButton.capSlotButtonAction");
  let placeUnit = null;
  if (placeUnitButtons.length != 0) {
    for (var button of placeUnitButtons) {
      if (button.innerText.includes("PLACE UNIT")) {
        var captainSlot = button.closest('.capSlot');
        const captainNameFromStorage = await retrieveFromStorage('dungeonCaptain');
        const captainNameFromDOM = captainSlot.querySelector('.capSlotName').innerText;
        if ((captainNameFromStorage != captainNameFromDOM) && captainSlot.innerText.includes("Dungeons")) {
          continue
        } else if ((captainSlot.innerText.includes("Dungeons") || captainSlot.innerText.includes("Clash") ||
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

//If the unit is in a valid marker that is in use, by taping the unit container it forces a button recheck on mouseup/touchend
function tapUnit() {
  const placerUnitCont = document.querySelector('.placerUnitCont');
  const event = new Event('mouseup', { bubbles: true, cancelable: true });
  placerUnitCont.dispatchEvent(event);
}