//This file keeps track of situation in which the game froze or crashes as well as handling of the back buttons.

//Initializing variables
const battleDelay = (ms) => new Promise((res) => setTimeout(res, ms));
let domChanged = false;
//Runs checkBattle() every 15 seconds
setInterval(checkBattle, 15000);

//Handles some conditions in which the battle has started.
async function checkBattle() {
  //Attemps to check if it's stuck on battlefield
  checkAndReload(".leaderboardCont", 60000);
  //If the battlefield is opened at the same time as the timer reaches 00:00 it will freeze there, a reload fixes it.
  checkAndReload(".battleLoading", 20000);
  //If the first loading screen frseezes
  checkAndReload(".loadingView", 10000);
  //If the second loading screen freezes
  checkAndReload(".splashCont", 10000);
}

//Receives a selector and a time in milisecondseconds. Check if the element with the selector exists, then checks again after the elapsed time has passed.
//If the element still exists and the dom has not been changed it reloads the frozen page.
async function checkAndReload(selector, battleDelayTimer) {
  domChanged = false;
  let element = document.querySelector(selector);
  if (element) {
    await battleDelay(battleDelayTimer);
    element = document.querySelector(selector);
    if (element && !domChanged) {
      location.reload();
    }
  }
}

//Game froze on a dark blue blank screen, reload.
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

//When invoked, this function clicks on all close buttons to close any popup that may exist
function closeAll() {
  const closeButton = document.querySelectorAll(".far.fa-times");
  if (closeButton.length > 0) {
      closeButton.forEach(button => {
          button.click();
      })
  }
}

//Mutator observer to remove stuck modals, frozen states and update recently loaded elements.
const observer = new MutationObserver(function (mutations) {
  
  domChanged = true;
  reloadRoot();

  mutations.forEach(async function (mutation) {
    const rewardsScrim = document.querySelector(".rewardsScrim");
    if (rewardsScrim) {
      rewardsScrim.remove();
    }

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