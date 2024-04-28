//This file switches slots for masterlisted captains.

//Get slot state, captain name, check if it's master, check if it's in front of the masterlist.
//If not seek a replacement.

const findBattle = "Waiting for Captain to find battle!";
const readyToPlace = "Unit ready to place!";
let masterlistRunning;

async function switchToMasterList(forceMaster, replaceMaster) {
    if (masterlistRunning) return;

    masterlistRunning = true;
    let switchSuccessful = false;
    const allCaptains = document.querySelectorAll(".capSlot");
    const allCaptainNames = Array.from(allCaptains).map(capSlot => {
        const cpNm = capSlot.querySelector('.capSlotName');
        return cpNm ? cpNm.innerText.toUpperCase() : null;
    });

    for (let i = 0; i < allCaptains.length; i++) {

        const slot = allCaptains[i];

        if (slot.innerHTML.includes("DISABLED")) continue;
        
        const close = slot.querySelector(".capSlotClose");
        
        //Remove captains with passwords
        if (slot.innerHTML.includes("ENTER_CODE")) {
            close.click();
            switchSuccessful = false;
        }

        //Check master switching

        //User does not want to master switch
        if (!forceMaster && !replaceMaster) continue;

        //Captain is in a state that allows switching and user wants some kind of master switching
        if (close && (slot.innerHTML.includes(findBattle) || slot.innerHTML.includes(readyToPlace))) {

            //Get list of idlers so they aren't put back
            //Makes sure the idler list is not empty
            let idlers;
            if (idlers != undefined) switchSuccessful = false;
            const storageData = await chrome.storage.local.get(['idleData']);
            idlers = storageData.idleData || [];
            if (idlers === undefined) switchSuccessful = false;

            //Get the captain names that are currently idling
            const presentTime = Date.now();
            const uITi = await getUserIdleTime();
            const fifteenMinutes = uITi * 60 * 1000;

            const idlersList = idlers
                .filter(entry => presentTime - entry.presentTime < fifteenMinutes)
                .map(entry => entry.captainName.toUpperCase());

            const capName = slot.querySelector(".capSlotName").innerText.toUpperCase();
            // Handle the retrieved data
            let masterlistResult = await chrome.storage.local.get(['masterlist']);
            let masterlist = masterlistResult.masterlist;

            //Check if the array exists and is an array with at least one element
            if (Array.isArray(masterlist) && masterlist.length > 0) {
                //Remove idlers from the masterlist
                masterlist = masterlist.map(item => item.toUpperCase());
                masterlist = masterlist.filter(name => !idlersList.includes(name));

                if (masterlist.includes(capName)) {
                    if (replaceMaster) {
                        //User wants to replace master captain with a higher priority captain
                        //Get all captains that have a higher priority than the current captain.
                        const capIndex = masterlist.indexOf(capName);
                        const stringsBeforeCap = capIndex !== -1 ? masterlist.slice(0, capIndex) : [];
                        const higherPriorityCaptains = stringsBeforeCap.filter(str => !allCaptainNames.includes(str));

                        if (higherPriorityCaptains.length === 0) {
                            //There are no captains with a higher priority than the current captain. Do nothing.
                            switchSuccessful = false;
                        } else {
                            //There are captains with a higher priority than the current captain. Switch.
                            //Use the high priority list array to find an active captain that is within that list.
                            close.click();
                            switchSuccessful = await switchCaptains(capName, higherPriorityCaptains, i);
                        }

                    }

                } else {
                    if (forceMaster) {
                        //Check if current captain is masterlisted
                        const capIndex = masterlist.indexOf(capName);
                        if (capIndex == -1) {

                            const higherPriorityCaptains = [...new Set(masterlist)];
                            allCaptainNames.forEach(captain => {
                                const index = higherPriorityCaptains.indexOf(captain);
                                if (index !== -1) higherPriorityCaptains.splice(index, 1);
                            });
                            if (higherPriorityCaptains.length === 0) {
                                switchSuccessful = false;
                            } else {
                                close.click();
                                switchSuccessful = await switchCaptains(capName, higherPriorityCaptains, i);
                            }
                        }

                    }
                }
            }
        }
    }
    masterlistRunning = false;
    return switchSuccessful;
}

//Switch captains to a higher one if available
async function switchCaptains(currentCaptain, higherPriorityCaptains, index) {
  if (higherPriorityCaptains.length == 0) return false;
  
  await delay(1000);
  const selectButton = document.querySelectorAll(".actionButton.actionButtonPrimary.capSlotButton.capSlotButtonAction")[index];
  if (selectButton && selectButton.innerText == "SELECT") {
    //Clicks select button to open the captains list
    selectButton.click();

    let captainsArray = [];

    let idlersList;
    const storageData = await chrome.storage.local.get(['idleData']);
    const idlers = storageData.idleData || [];

    if (idlers) {
      const presentTime = Date.now();
      const uIT = await getUserIdleTime();
      idlersList = idlers
        .filter(entry => presentTime - entry.presentTime < uIT)
        .map(entry => entry.captainName.toUpperCase());
    } else {
      idlersList = [];
    }

    //Clicks on the ALL captains tab to obtain the full list of online captains
    const allCaptainsTab = document.querySelector(".subNavItemText");
    allCaptainsTab.click();
    //Scrolls to the bottom
    await scroll();
    await idleDelay(3000);
    //Gets the full list of captains

    let fullCaptainList = await retrieveFromStorage("captainSearchData");
    fullCaptainList = fullCaptainList.filter(captain => !idlersList.includes(captain.twitchDisplayName.toUpperCase()));

    let blackList = await filterCaptainList('blacklist', fullCaptainList);
    const acceptableList = fullCaptainList.filter(
      entry => !blackList.includes(entry)
    );
    let masterList = await filterCaptainList('masterlist', acceptableList);

    for (let i = 0; i < higherPriorityCaptains.length; i++) {
      for (let j = 0; j  < masterList.length; j++) {
        const current = masterList[i];
        const name = current.twitchUserName.toUpperCase();
        const type = current.type;
        const isSelected = current.isSelected;
        const id = current.userId;
        if (name == higherPriorityCaptains[i] && !isSelected && type == 1) {
          captainsArray.push({
            name, id
          });
        }
      }
    }

    //Sort live captains based on their order on the masterlist
    captainsArray.sort((a, b) => {
      return higherPriorityCaptains.indexOf(a.name) - higherPriorityCaptains.indexOf(b.name);
    });

    //Extract the name from the sorted captains
    const firstCaptainName = captainsArray.length > 0 ? captainsArray[0].name : null;

    if (firstCaptainName != undefined) {
      await joinCaptainToAvailableSlot(firstCaptainName);
      await delay(2000);
      closeAll();
      goHome();
      return true;
    }
  }
  //If no other captain to switch to, rejoin first captain
  await joinCaptainToAvailableSlot(currentCaptain);
  await delay(2000);
  closeAll();
  goHome();
  return false;
}