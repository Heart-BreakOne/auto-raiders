// This file handles situations in which the captain may be idling so a captain replacement can be obtained.

//Declaring/initializing variables
const idleDelay = ms => new Promise(res => setTimeout(res, ms));
const statusArray = ["Waiting for Captain to find battle!ENABLED", , "Waiting for Captain to start battle!ENABLED", "Waiting for Captain to collect reward!ENABLED"];
const diamondLoyaltyString = "https://d2k2g0zg1te1mr.cloudfront.net/env/prod1/mobile-lite/static/media/iconLoyaltyDiamond.66307240.png";
const goldLoyaltyString = "https://d2k2g0zg1te1mr.cloudfront.net/env/prod1/mobile-lite/static/media/iconLoyaltyGold.4bd4f730.png";
const silverLoyaltyString = "https://d2k2g0zg1te1mr.cloudfront.net/env/prod1/mobile-lite/static/media/iconLoyaltyBlue.d4328aba.png";
const bronzeLoyaltyString = "https://d2k2g0zg1te1mr.cloudfront.net/env/prod1/mobile-lite/static/media/iconLoyaltyWood.ad7f4cb5.png";
const favoriteString = "Adhafybh9zXMAAAAAElFTkSuQmCC";
let captainButton;

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
        const btn = slot.querySelector(".capSlotStatus .offlineButton");
        const buttonId = btn.getAttribute('id');
        //Checks if the user wants to switch idle captains by passing the button id
        const currentIdleState = await getIdleState(buttonId);
        if (!currentIdleState) {
            continue;
        }
        //If the select button exists with the innerText exists it means that the slot is empty
        if (selectButton && selectButton.innerText == "SELECT") {
            //Clicks select button to open the captains list
            selectButton.click();
            //Invokes function to get a captain replacement.
            switchIdleCaptain()
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
                //Closes captain slot
                let close = slot.querySelector(".fas.fa-square");
                close.click();
                //Checks if modal that appears on certain conditions exists and clicks to close it.
                const modal = document.querySelector(".modalScrim.modalOn");
                if (modal) {
                    await delay(2000);
                    close = modal.querySelector(".actionButton.actionButtonPrimary");
                    close.click();
                }
                await idleDelay(2000);
                //Clicks the select button to open captain selection list
                const selectButton = slot.querySelector(".actionButton.actionButtonPrimary.capSlotButton.capSlotButtonAction");
                selectButton.click();
                //Invokes function to get a captain replacement.
                switchIdleCaptain()
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
        chrome.storage.local.get(['idleData'], function (result) {
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
                //If the elapsed idle time is bigger than 15 minutes it returns true
                if (elapsedTime >= 900000) { // 900000 = 15 minutes
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
async function switchIdleCaptain() {

    //Clicks on the ALL captains tab to obtain the full list of online captains
    const allCaptainsTab = document.querySelector(".subNavItemText");
    allCaptainsTab.click();
    //Scrolls to the bottom
    await scroll();
    await idleDelay(3000);
    //Gets the full list of captains
    let fullCaptainList = document.querySelectorAll(".searchResult");
    //Invokes function to get list with gold loyalty captains
    let diamondLoyaltyList = createLoyaltyList(fullCaptainList, goldLoyaltyString);
    //Invokes function to get list with gold loyalty captains
    let goldLoyaltyList = createLoyaltyList(fullCaptainList, goldLoyaltyString);
    //Invokes function to get list with silver loyalty captains
    let silverLoyaltyList = createLoyaltyList(fullCaptainList, silverLoyaltyString);
    //Invokes function to get list with bronze loyalty captains
    let bronzeLoyaltyList = createLoyaltyList(fullCaptainList, bronzeLoyaltyString);
    //Gets list of favorited captains that are running campaign
    let favoriteList = Array.from(fullCaptainList).filter(captain => {
        //Gets favorite icon
        const imgElement = captain.querySelector('.favoriteButton img');
        //Gets the mode they are running
        const versusLabelElement = captain.querySelector('.versusLabelContainer');
        //Gets whether or not said captain has not been joined already
        const joinLabelElement = captain.querySelector('.searchResultJoinLabel');

        //Returns captain that are favorite and running campaign and have not been joined yet.
        return imgElement && imgElement.src.includes(favoriteString) &&
            versusLabelElement && versusLabelElement.textContent.trim() === 'Campaign' &&
            (!joinLabelElement || joinLabelElement.textContent.trim() !== 'Already joined Captain');
    });
    //If diamond loyalty captains exist, click on the first one
    if (diamondLoyaltyList.length != 0) {
        captainButton = diamondLoyaltyList[0].querySelector(".actionButton.actionButtonPrimary.searchResultButton");
        captainButton.click();
    }
    //If diamond loyalty captains exist, click on the first one
    else if (goldLoyaltyList.length != 0) {
        captainButton = goldLoyaltyList[0].querySelector(".actionButton.actionButtonPrimary.searchResultButton");
        captainButton.click();
    }
    //If silver loyalty captains exist, click on the first one
    else if (silverLoyaltyList.length != 0) {
        captainButton = silverLoyaltyList[0].querySelector(".actionButton.actionButtonPrimary.searchResultButton");
        captainButton.click();
    }
    //If bronze loyalty captains exist, click on the first one
    else if (bronzeLoyaltyList.length != 0) {
        captainButton = bronzeLoyaltyList[0].querySelector(".actionButton.actionButtonPrimary.searchResultButton");
        captainButton.click();
    }
    //If favorited captains exist, click on the first one
    else if (favoriteList.length != 0) {
        captainButton = favoriteList[0].querySelector(".actionButton.actionButtonPrimary.searchResultButton");
        captainButton.click()
    }
    //No special captains (no loyalty, not favorite) exist
    else {
        //Checks if the user wants to switch to non special captains, if not the list is closed
        const skipSwitch = await retrieveFromStorage("skipSwitch")
        if (skipSwitch) {
            //Closes the list
            closeAll();

        }
        //Any captain is selected
        else {
            for (let i = 0; i < fullCaptainList.length; i++) {
                //Iterates through the list of captains
                const captain = fullCaptainList[i];
                //Gets mode the current captain is running
                const modeLabel = captain.querySelector(".versusLabelContainer").innerText;
                //Gets the already joined from the current captain
                let alreadyJoined = captain.querySelector(".searchResultJoinLabel");
                //If the captain has not been joined the ".searchResultJoinLabel" does not exist, so alreadyJoined is null.
                if (alreadyJoined == null) {
                    alreadyJoined = "";
                }
                //If the captain is running campaign and has not been joined yet
                if (modeLabel === "Campaign" || alreadyJoined.innerText !== "Already joined captain") {
                    //If user wants to select any captain, the first captain from the list is clicked
                    captainButton = captain.querySelector(".actionButton.actionButtonPrimary.searchResultButton");
                    captainButton.click();
                    break;
                }
            }
        }
    }
}

/* This function receives the full captain list as well as a loyalty string
and returns an sub array with only captains that match the loyalty string and
captains that are running campaign and captains that have not been joined yet */

function createLoyaltyList(fullCaptainList, loyaltyString) {
    return Array.from(fullCaptainList).filter(captain => {
        //Gets loyalty icon for comparison
        const imgElement = captain.querySelector('.searchResultLoyalty img');
        //Gets game mode
        const versusLabelElement = captain.querySelector('.versusLabelContainer');
        //Gets whether or not the captain has been joined already.
        const joinLabelElement = captain.querySelector('.searchResultJoinLabel');

        //Returns captain if they match the loyalty string and the game mode campaign and have not been joined.
        return imgElement && imgElement.src === loyaltyString &&
            versusLabelElement && versusLabelElement.textContent.trim() === 'Campaign' &&
            (!joinLabelElement || joinLabelElement.textContent.trim() !== 'Already joined Captain');
    });
}


//Scroll to the bottom of the page and load all captains
async function scroll() {
    //Initialized the scrollable element
    const scroll = document.querySelector('.capSearchResults');
    //Scrolls to the bottom with a delay so the new dynamically elements can be loaded
    for (let i = 0; i < 15; i++) {
        scroll.scrollTop = scroll.scrollHeight;
        await idleDelay(450);
    }
}