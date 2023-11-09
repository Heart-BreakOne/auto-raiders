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

//Mutator observer to set domChanged variable to true whenever a change happens.
const obsv = new MutationObserver((mutations) => {
  domChanged = true;
});

const conf = { childList: true, subtree: true };
obsv.observe(document, conf);

//When invoked, this function clicks on all close buttons to close any popup that may exist
function closeAll() {
  const closeButton = document.querySelectorAll(".far.fa-times");
  if (closeButton.length > 0) {
      closeButton.forEach(button => {
          button.click();
      })
  }
}