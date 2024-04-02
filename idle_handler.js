// This file handles situations in which the captain may be idling so a captain replacement can be obtained.

//Declaring/initializing variables
const idleDelay = ms => new Promise(res => setTimeout(res, ms));
const statusArray = ["Waiting for Captain to find battle!ENABLED", , "Waiting for Captain to start battle!ENABLED", "Waiting for Captain to collect reward!ENABLED"];
const diamondLoyaltyString = "Diamond"; //"https://d2k2g0zg1te1mr.cloudfront.net/env/prod1/mobile-lite/static/media/iconLoyaltyDiamond.66307240.png";
const goldLoyaltyString = "Gold"; //"https://d2k2g0zg1te1mr.cloudfront.net/env/prod1/mobile-lite/static/media/iconLoyaltyGold.4bd4f730.png";
const silverLoyaltyString = "Silver"; //"https://d2k2g0zg1te1mr.cloudfront.net/env/prod1/mobile-lite/static/media/iconLoyaltyBlue.d4328aba.png";
const bronzeLoyaltyString = "Bronze"; //"https://d2k2g0zg1te1mr.cloudfront.net/env/prod1/mobile-lite/static/media/iconLoyaltyWood.ad7f4cb5.png";
let captainButton;
let isContentRunningIdle;

//This function checks if a captain is idling or if the slot is empty and gets a replacement
async function checkIdleCaptains() {
    //Checks if the game is on the main menu, returns if not.
    const battleView = document.querySelector(".battleView");
    if (!battleView) return;

    //Updates the list of captains that are NOT idling.
    await updateRunningCaptains();

    //Initialized a node list with all the captain slots
    const capSlots = document.querySelectorAll('.capSlot');

    //Iterates through the list of slots
    for (let index = 0; index < capSlots.length; index++) {
        //Gets the current slot
        const slot = capSlots[index];
        //Battle status is used to determine the idle status.
        const battleStatus = slot.querySelector(".capSlotStatus").innerText;
        //Select button signals that the slot is empty.
        const selectButton = slot.querySelector(".actionButton.actionButtonPrimary.capSlotButton.capSlotButtonAction");


        //Gets button id form the current slot
        try {
            const btn = slot.querySelector(".capSlotStatus .offlineButton");
            const buttonId = btn.getAttribute('id');
            //Checks if the user wants to switch idle captains by passing the button id
            const currentIdleState = await getIdleState(buttonId);
            if (!currentIdleState) {
                continue;
            }
        } catch (error) {
            return;
        }

        //If the select button exists with the innerText exists it means that the slot is empty
        if (selectButton && selectButton.innerText == "SELECT") {
            //Invokes function to get a captain replacement.
            if (isContentRunningIdle == true) {
              return;
            }
            isContentRunningIdle = true;
            await switchIdleCaptain(index)
            isContentRunningIdle = false;
            return;
        } else if (statusArray.includes(battleStatus)) {
            //If the captain is possibly on an idle state
            //Gets captain name
            const captainName = slot.querySelector(".capSlotName").innerText;
            //Invokes function to set the battle status with the captainName as a parameter.
            await setBattleStatus(captainName)
            //Gets whether or not the captain is idling for more than 15 minutes using the captainName as a parameter
            const isIdle = await getBattleStatus(captainName)
            //Captain is idle, switch and select a new one
            if (isIdle) {
                if (isContentRunningIdle == true) {
                  return;
                }
                isContentRunningIdle = true;
                await abandonBattle("Abandoned", slot, "abandoned", captainName);
                //Invokes function to get a captain replacement.
                await switchIdleCaptain(index);
                isContentRunningIdle = false;
                return;
            }
        }
    }

}

/*This function ensures that a captain that was previously on a possible idle state (less than 15 minutes of idling)
but is now running a battle is removed from the idle list. */

async function updateRunningCaptains() {
    //Get all captain slots
    const capSlots = document.querySelectorAll('.capSlot');
    for (let index = 0; index < capSlots.length; index++) {
        //Iterate through every slot to get the captain name and its current battle status
        const slot = capSlots[index];
        const status = slot.querySelector(".capSlotStatus");
        const capName = slot.querySelector(".capSlotName");
        //If the captain is on placement mode it can be removed from the idle list.
        if (status.innerText.includes("Unit ready") && capName) {
            const name = capName.innerText;
            //Retrieves the idle data from storage.
            chrome.storage.local.get(['idleData'], function (result) {
                let idleData = result.idleData || [];
                // Looks for a captain with the same name, removed it and saves back to storage.
                const existingCaptainIndex = idleData.findIndex(item => item.captainName === name);
                if (existingCaptainIndex !== -1) {
                    idleData.splice(existingCaptainIndex, 1);
                    chrome.storage.local.set({ idleData: idleData });
                }
            });
        }
    }
}

//This function saves a captain that is possibly idling into the storage using the captainName as a parameter
async function setBattleStatus(captainName) {
    //Get current time
    const currentTime = new Date().getTime();
    //Gets idle data from storage
    chrome.storage.local.get(['idleData'], function (result) {
        let idleData = result.idleData || [];
        // Find the captain with the same name so the value can be updated
        const existingCaptainIndex = idleData.findIndex(item => item.captainName === captainName);
        //If the captain exists
        if (existingCaptainIndex !== -1) {
            // 1200000 = 20 minutes  - 3600000 = 60 minutes
            //If the captain already exists check for old time data is performed, if the idle time is bigger than an hour the value
            // is updated since it means the captain was not recently added into storage.
            const lastUpdateTime = idleData[existingCaptainIndex].currentTime;
            if (currentTime - new Date(lastUpdateTime).getTime() > 3600000) {
                // Update the currentTime
                idleData[existingCaptainIndex].currentTime = new Date(currentTime).toISOString();
                // Save updated data back to local storage
                chrome.storage.local.set({ idleData: idleData });
            }
        } else {
            // If the captain does not exist, the data is added
            idleData.push({ captainName, currentTime });
            //Keeps the array to a maximum size of 15 items.
            if (idleData.length > 15) {
                idleData.shift();
            }
            // Save updated data back to local storage
            chrome.storage.local.set({ idleData: idleData });
        }
    });
}

//When invoked this function receives the captain name returns a true or false as to whether or not the captain is idling for more than 15 minutes.
async function getBattleStatus(captainName) {
    return new Promise((resolve, reject) => {
        //Gets the idle data from storage
        chrome.storage.local.get(['idleData'], async function (result) {
            let idleData = result.idleData || [];
            //Gets current time for comparison with the stored time data
            const currentTime = new Date().getTime();

            //Checks if the captain exists in the idle database
            const existingCaptain = idleData.find(item => item.captainName === captainName);

            //Captain exists
            if (existingCaptain) {
                //If the captain exists the idle time is calculated based on when the captain was flagged as idling and the current time
                const lastUpdateTime = new Date(existingCaptain.currentTime).getTime();
                const elapsedTime = currentTime - lastUpdateTime;
                //If the elapsed idle time is greater than the user defined idle time, it returns true
                const uITi = await getUserIdleTime()
                if (elapsedTime >= uITi) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            } else {
                //Captain is not on the idle database.
                resolve(false);
            }
        });
    });
}

//When invoked this function gets a captain replacement for the current empty slot
//When invoked, the captain selection will be into view
async function switchIdleCaptain(index) {

    let idlersList;
    const storageData = await chrome.storage.local.get(['idleData']);
    const idlers = storageData.idleData || [];

    if (idlers) {
        const presentTime = Date.now();
        const uIT = await getUserIdleTime()
        idlersList = idlers
            .filter(entry => presentTime - entry.presentTime < uIT)
            .map(entry => entry.captainName.toUpperCase());
    } else {
        idlersList = []
    }

    let captainName;
    let fullCaptainList;
    let slotNum = index + 1;
    let idleKeysArray = ['idleSwitch0_Campaign', 'idleSwitch' + slotNum + '_Campaign', 'idleSwitch0_Dungeon', 'idleSwitch' + slotNum + '_Dungeon', 'idleSwitch0_Clash', 'idleSwitch' + slotNum + '_Clash', 'idleSwitch0_Duel', 'idleSwitch' + slotNum + '_Duel', ];
    let idleKeys = await retrieveMultipleFromStorage(idleKeysArray);
    let idleSwitchAll_Campaign = idleKeys.idleSwitch0_Campaign;
    let idleSwitchSlot_Campaign = idleKeys['idleSwitch' + slotNum + '_Campaign'];
    let idleSwitchAll_Dungeon = idleKeys.idleSwitch0_Dungeon;
    let idleSwitchSlot_Dungeon = idleKeys['idleSwitch' + slotNum + '_Dungeon'];
    let idleSwitchAll_Clash = idleKeys.idleSwitch0_Clash;
    let idleSwitchSlot_Clash = idleKeys['idleSwitch' + slotNum + '_Clash'];
    let idleSwitchAll_Duel = idleKeys.idleSwitch0_Duel;
    let idleSwitchSlot_Duel = idleKeys['idleSwitch' + slotNum + '_Duel'];
    let mode;
    
    if (idleSwitchAll_Dungeon || idleSwitchSlot_Dungeon) {
      mode = "dungeons";
    } else if (idleSwitchAll_Clash || idleSwitchSlot_Clash) {
      mode = "clash";
    } else if (idleSwitchAll_Duel || idleSwitchSlot_Duel) {
      mode = "duel";
    } else if (idleSwitchAll_Campaign || idleSwitchSlot_Campaign) {
      mode = "campaign";
    } else {
      mode = "campaign";
    }

    fullCaptainList = await getCaptainsForSearch(mode);
    if (fullCaptainList != null && fullCaptainList != "") {
      let blackList = await filterCaptainList('blacklist', fullCaptainList);
      const acceptableList = fullCaptainList.filter(
          entry => !blackList.includes(entry)
      );
      if (mode != "campaign") {
        for (let i = 0; i < acceptableList.length; i++) {
            //Iterates through the list of captains
            const captain = acceptableList[i];
            //Gets the already joined from the current captain
            let alreadyJoined = captain[3];
            //If the captain is running campaign and has not been joined yet
            if (!alreadyJoined) {
                //If user wants to select any captain, the first captain from the list is clicked
                captainId = captain[0];
                captainName = captain[1];
                await joinCaptain(captainId, index);
                await delay(3000);
                await checkCodeAndRetry(mode, captainName, acceptableList);                
                break;
            }
        }
      } else {
        let whiteList = await filterCaptainList('whitelist', acceptableList);
        let masterList = await filterCaptainList('masterlist', acceptableList);

        //Manage masterlist states
        const skipIdleMasterSwitch = await getSwitchState("skipIdleMasterSwitch");
        const idleMasterSwitch = await getSwitchState("idleMasterSwitch");
        //User wants to leave slot blank if there no masterlisted captains online
        if (skipIdleMasterSwitch && masterList.length == 0) {
            return;
        }
        //If masterlist captain exists, click the first one
        if (idleMasterSwitch && masterList.length != 0) {
            captainId = masterList[0][0];
            await joinCaptain(captainId, index);
            return;
        }
        
        //Invokes function to get list with gold loyalty captains
        let diamondLoyaltyList = createLoyaltyList(acceptableList, diamondLoyaltyString, blackList);
        //Invokes function to get list with gold loyalty captains
        let goldLoyaltyList = createLoyaltyList(acceptableList, goldLoyaltyString, blackList);
        //Invokes function to get list with silver loyalty captains
        let silverLoyaltyList = createLoyaltyList(acceptableList, silverLoyaltyString, blackList);
        //Invokes function to get list with bronze loyalty captains
        let bronzeLoyaltyList = createLoyaltyList(acceptableList, bronzeLoyaltyString, blackList);
        //Gets list of favorited captains that are running campaign
        let favoriteList = []
        try {
          let favoriteCaptainIds = await getFavoriteCaptainIds();
          let favoriteCaptainIdsArray = favoriteCaptainIds.split(",");
          favoriteList = acceptableList.filter(
              entry => (favoriteCaptainIdsArray.includes(entry[0]) && !blackList.includes(entry) && entry[3] !== true)
          );
        } catch(error) {
          favoriteList = []
        }
        
        //If diamond loyalty captains exist, click on a random one
        if (diamondLoyaltyList.length != 0) {
            captainId = diamondLoyaltyList[getRandomIndex(diamondLoyaltyList.length)][0];
            await joinCaptain(captainId, index);
        }
        //If gold loyalty captains exist, click on a random one
        else if (goldLoyaltyList.length != 0) {
            captainId = goldLoyaltyList[getRandomIndex(goldLoyaltyList.length)][0];
            await joinCaptain(captainId, index);
        }
        //If silver loyalty captains exist, click on a random one
        else if (silverLoyaltyList.length != 0) {
            captainId = silverLoyaltyList[getRandomIndex(silverLoyaltyList.length)][0];
            await joinCaptain(captainId, index);
        }
        //If bronze loyalty captains exist, click on a random one
        else if (bronzeLoyaltyList.length != 0) {
            captainId = bronzeLoyaltyList[getRandomIndex(bronzeLoyaltyList.length)][0];
            await joinCaptain(captainId, index);
        }
        //Get a whitelisted captain
        else if (whiteList.length != 0) {
            captainId = whiteList[0][0];
            await joinCaptain(captainId, index);
        }
        //If favorited captains exist, click on a random one
        else if (favoriteList.length != 0) {
            captainId = favoriteList[getRandomIndex(favoriteList.length)][0];
            await joinCaptain(captainId, index);
        }
        else {
            //Checks if the user wants to switch to non special captains, if not the list is closed
            const skipSwitch = await retrieveFromStorage("skipSwitch")
            if (skipSwitch) {
                return;
            }
            //Get an acceptable captain
            if (acceptableList.length != 0) {
                captainId = acceptableList[0][0];
                await joinCaptain(captainId, index);
            }
            //No special captains (no loyalty, not favorite, no whitelist, no acceptable captains) exist
            else {
                for (let i = 0; i < acceptableList.length; i++) {
                    //Iterates through the list of captains
                    const captain = acceptableList[i];
                    //Gets the already joined from the current captain
                    let alreadyJoined = captain[3];
                    //If the captain is running campaign and has not been joined yet
                    if (!alreadyJoined) {
                        //If user wants to select any captain, the first captain from the list is clicked
                        captainId = captain[0];
                        await joinCaptain(captainId, index);
                        break;
                    }
                }
            }
        }
      }
    }
}

async function checkCodeAndRetry(mode, captainName, acceptableList) {
  if (await checkIfCodeLocked(captainName)) {
    for (let j = 0; j < acceptableList.length; j++) {
      if (acceptableList[j][1].toLowerCase() == captainName.toLowerCase()) {
        delete acceptableList[j];
      }
    }
    let result = await checkCodeAndRetry(mode, captainName, acceptableList);
    return result;
  }
  
  await saveToStorage(mode + "Captain", "," + captainName + ",");
}

//Returns a random index number for the captains special list
function getRandomIndex(max) {
    return Math.floor(Math.random() * max);
}

/* This function receives the full captain list as well as a loyalty string
and returns an sub array with only captains that match the loyalty string and
captains that are running campaign and captains that have not been joined yet */

function createLoyaltyList(acceptableList, loyaltyString, blackList) {

    const filteredList = acceptableList.filter(item => !blackList.includes(item));

    return Array.from(filteredList).filter(captain => {
        let loyalty;
        //Gets loyalty for comparison
        if (captain[4] >= 100) {
            loyalty = "Diamond";
        } else if (captain[4] >= 50 && captain[4] < 100) {
            loyalty = "Gold";
        } else if (captain[4] >= 25 && captain[4] < 50) {
            loyalty = "Silver";
        } else if (captain[4] >= 1 && captain[4] < 25) {
            loyalty = "Bronze";
        }
        //Gets whether or not the captain has been joined already.
        const alreadyJoined = captain[3];

        //Returns captain if they match the loyalty string and the game mode campaign and have not been joined.
        return loyalty && loyalty === loyaltyString && !alreadyJoined;
    });
}


//This function receives the list type and the full list and sorts the matching captains
async function filterCaptainList(type, acceptableList) {

    let filteredArray = [];
    function getListedCaptains() {
        return new Promise((resolve) => {
            chrome.storage.local.get({ [type]: [] }, function (result) {
                resolve(result[type] || []);
            });
        });
    }

    // Use async/await to wait for the storage data
    const listArray = await getListedCaptains();

    //Create a filtered nodeList array of captains with the order of favoritism
    for (let i = 0; i < listArray.length; i++) {
        //Get favorite captain in order
        const listedCaptain = listArray[i];
        //Check if the captainName and other condition match, add it to filtered array
        for (let j = 0; j < acceptableList.length; j++) {
            const captain = acceptableList[j];
            const captainName = captain[1];
            //Gets whether or not the captain has been joined already.
            const alreadyJoined = captain[3];

            if (captainName.toUpperCase() === listedCaptain.toUpperCase() && !alreadyJoined) {
                filteredArray.push(captain);
            }
        }
    }
    return filteredArray;
}

//Abandon the battle and select a new captain
async function abandonBattle(status, slot, status1, captainName) {
    let captainLoyalty = await getCaptainLoyalty(captainName);
    let raidId = captainLoyalty[0];
    let captId = captainLoyalty[2];
    //Store battle result as abandoned on storage log
    await setLogResults(status, captainName, status1, "N/A", "N/A", "N/A", "N/A", "N/A", raidId, "N/A", "N/A");
    //Closes captain slot
    await removeOldCaptain(captId);
}

async function getUserIdleTime(){
    try {
        let userIdleTime = await retrieveNumberFromStorage("userIdleTimeInput")
        if (userIdleTime == -100) {
            return 900000
        } else {
            return userIdleTime * 60000
        }
    } catch (error) {
        return 900000
    }
}