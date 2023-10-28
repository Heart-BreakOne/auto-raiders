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