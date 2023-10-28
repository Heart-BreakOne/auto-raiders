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