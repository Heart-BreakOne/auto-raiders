
const battleDelay = ms => new Promise(res => setTimeout(res, ms));
setInterval(checkBattle, 15000);

//A warning popups under certain conditions, by clicking back the issue can be resolved.
setInterval(function () {
  try {
    const rewardModal = document.querySelectorAll(".rewardsScrim");
    rewardModal.remove()
  } catch (error){}

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
  /*const rootElement = document.getElementById('root');
  if (rootElement && rootElement.childElementCount === 0 && rootElement.textContent.trim() === '') {
    location.reload()
  }*/

  let battleButton = document.querySelector('.placeUnitButtonItems');
  if (battleButton && (battleButton.innerText.includes('UNIT READY TO PLACE IN') || battleButton.innerText.includes('BATTLE STARTING SOON'))) {
    await battleDelay(15000);
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
