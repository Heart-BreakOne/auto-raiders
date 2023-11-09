
const battleDelay = (ms) => new Promise((res) => setTimeout(res, ms));
setInterval(checkBattle, 15000);

//Handles some conditions in which the battle has started.
async function checkBattle() {
  //Attemps to check if it's stuck on battlefield
  checkAndReload(".leaderboardCont", 75000);
  //If the battlefield is opened at the same time as the timer reaches 00:00 it will freeze there, a reload fixes it.
  checkAndReload(".battleLoading", 50000);
  //If the first loading screen frseezes
  checkAndReload(".loadingView", 10000);
  //If the second loading screen freezes
  checkAndReload(".splashCont", 10000);
}

//Receives a selector, check if it exists, checks again in 10 seconds and reloads page since it means the game froze
async function checkAndReload(selector, battleDelayTimer) {
  let element = document.querySelector(selector);
  if (element) {
    await battleDelay(battleDelayTimer);
    element = document.querySelector(selector);
    if (element) {
      location.reload();
    }
  }
}