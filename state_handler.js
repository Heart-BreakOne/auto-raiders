//This file keeps track of situation in which the game froze or crashes as well as handling of the back buttons.


/* Force a tab crash
chrome://crash
*/

//Initializing variables
const battleDelay = (ms) => new Promise((res) => setTimeout(res, ms));
let domChanged = false;
let checkingBattle = false;
let placeUnitCounter = 0;
let confirmCounter = 0
let previousPlaceButtonCount = 0;
let previousConfirmButtonCount = 0;
let isBattlefield = null;
let initialPlaceButton = null;
let initialConfirmButton = null;
//Runs checkBattle() every 15 seconds
setInterval(checkBattle, 15000);

//Send a message to the background to reload the streamraiders tab.
function locationReload() {
  isContentRunning2 = false;
  let reloadPort = chrome.runtime.connect({ name: "content-script" });
  reloadPort.postMessage({ action: "reloadCleanCache", });
  return
}
//Handles some conditions in which the battle has started.
async function checkBattle() {
  if (await retrieveFromStorage("paused_checkbox")) {
    return
  }
  //Attemps to check if it's stuck on battlefield
  checkBattlefield(".leaderboardCont", 50000);
  //If the battlefield is opened at the same time as the timer reaches 00:00 it will freeze there, a reload fixes it.
  checkAndReload(".battleLoading", 20000);
  //If the first loading screen frseezes
  checkAndReload(".loadingView", 10000);
  //If the second loading screen freezes
  checkAndReload(".splashCont", 10000);
}

//Check if battlefield is frozen or stuck, goes back to main menu if stuck, reloads page if frozen.
async function checkBattlefield(selector, battleDelayTimer) {

  if (checkingBattle) {
    return;
  }
  checkingBattle = true;

  async function waitForBattlefield() {
    await battleDelay(battleDelayTimer);
    return document.querySelector(selector);
  }

  async function handleBattlefield() {
    await battleDelay(3000);
    const menuView = document.querySelector(".battleView");
    if (!menuView) {
      locationReload();
      return;
    }
  }

  try {
    const battlefieldIdentifier = await waitForBattlefield();

    if (battlefieldIdentifier && !domChanged) {
      goHome();
      await handleBattlefield();
    } else {
      await battleDelay(20000);
      const updatedBattlefield = await waitForBattlefield();

      if (updatedBattlefield) {
        goHome();
        await handleBattlefield();
      }
    }
  } catch (error) { }
  finally {
    checkingBattle = false;
  }
}


//Receives a selector and a time in milisecondseconds. Check if the element with the selector exists, then checks again after the elapsed time has passed.
//If the element still exists and the dom has not been changed it reloads the frozen page.
async function checkAndReload(selector, battleDelayTimer) {
  const element = document.querySelector(selector);
  if (element && !domChanged) {
    await battleDelay(battleDelayTimer);
    const updatedElement = document.querySelector(selector);
    if (updatedElement === element && !domChanged) {
      locationReload();
    }
  }
}

//Game froze on a dark blue blank screen, reload.
function reloadRoot() {
  const rootElement = document.getElementById('root');
  if (rootElement && rootElement.childElementCount === 0) {
    isContentRunning2 = false;
    locationReload();
    return;
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

const observerCallback = async function (mutations) {

  if (await retrieveFromStorage("paused_checkbox")) {
    return
  }

  let contentPort = chrome.runtime.connect({ name: "content-script" });

  //If desktop mode loads, reload with mobile mode
  if (document.querySelector("#\\#canvas")) {
    contentPort.postMessage({ action: "reloadCleanCache", });
    return;
  }

  domChanged = true;
  reloadRoot();

  const salesTag = document.querySelector(".saleTagCont")
  if (salesTag) {
    salesTag.style.display = "none";
  }

  //If there too many attempts to place a unit, go home.
  if (!isBattlefield) {
    isBattlefield = document.querySelector(".battlefield");
  } else {
    let placeButton = document.querySelector(".actionButton.actionButtonPrimary.placeUnitButton");
    let confirmButton = document.querySelector(".actionButton.actionButtonDisabled.placerButton");

    if (placeButton && placeButton !== initialPlaceButton && !placeButton.classList.contains("new")) {
      placeUnitCounter++;
      initialPlaceButton = placeButton;
      placeButton.classList.add("new");
    } else if (confirmButton && confirmButton !== initialConfirmButton && !confirmButton.classList.contains("new")) {
      confirmCounter++;
      initialConfirmButton = confirmButton;
      confirmButton.classList.add("new");
    }

    if (placeUnitCounter >= 4 || confirmCounter >= 4) {
      resetCountersAndButtons();
      const close = document.querySelector(".actionButton.actionButtonNegative.placerButton");
      if (close) {
        close.click();
      }
      goHome();
      return;
    }
  }

  mutations.forEach(async function (mutation) {
    mutation.addedNodes.forEach(async function () {
      const rewardsScrim = document.querySelector(".rewardsScrim");
      const toast = document.querySelector(".toastsCont.toastsContMore");
      hideElementsFromView(rewardsScrim);
      hideElementsFromView(toast);

      hideQuestModal();

      const menuView = document.querySelector(".mainNavCont.mainNavContPortrait") || document.querySelector(".mainNavCont.mainNavContLandscape");
      if (menuView) {
        await battleDelay(5);
        injectIntoDOM();
      }

      checkBattlePhase();

      await checkAndHandleBattleButton();

      clickGoBackButtons();

      hideRotateMessage();

      setScroll();
      setUnitContainer();
    });
  });
};

const observerOptions = { childList: true, subtree: true };
const observer = new MutationObserver(observerCallback);
const targetNode = document.body;
observer.observe(targetNode, observerOptions);

function hideElementsFromView(element) {
  if (element) {
    element.style.width = '0';
    element.style.height = '0';
  }
}

function hideQuestModal() {
  let questModal = document.querySelector(".modalScrim.modalOn");
  if (questModal && !questModal.innerText.includes("Leave battle") && !questModal.innerText.includes("PLACE ANYWAY")) {
    try {
      questModal.style.display = "none";
    } catch (error) { }
  }
}

function checkBattlePhase() {
  const battleLabel = document.querySelector(".battlePhaseTextCurrent");
  if (battleLabel && battleLabel.innerText === "Battle Ready" && window.getComputedStyle(battleLabel).getPropertyValue("color") === "rgb(49, 255, 49)") {
    goHome();
    return;
  }
}

async function checkAndHandleBattleButton() {
  let battleButton = document.querySelector(".placeUnitButtonItems");
  if (battleButton && (battleButton.innerText.includes("UNIT READY TO PLACE IN") || battleButton.innerText.includes("BATTLE STARTING SOON"))) {
    await battleDelay(15000);
    battleButton = document.querySelector(".placeUnitButtonItems");
    if (battleButton && (battleButton.innerText.includes("UNIT READY TO PLACE IN") || battleButton.innerText.includes("BATTLE STARTING SOON"))) {
      goHome();
      return;
    }
  }
}

function clickGoBackButtons() {
  const buttons = document.querySelectorAll(".button.actionButton.actionButtonPrimary");
  buttons.forEach((button) => {
    const buttonText = button.querySelector("div").textContent.trim();
    if (buttonText === "GO BACK") {
      button.click();
    }
  });
}

function hideRotateMessage() {
  const mainContainer = document.querySelector(".rotateMessageCont");
  if (mainContainer) {
    hideContainer(mainContainer);
  }
}

function resetCountersAndButtons() {
  isBattlefield = null;
  initialPlaceButton = null;
  initialConfirmButton = null;
  confirmButton = null;
  placeButton = null;
  placeUnitCounter = 0;
  confirmCounter = 0;
}

function hideContainer(container) {
  container.style.display = "none";
}
