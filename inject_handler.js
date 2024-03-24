/* This file injects buttons into the page so they can be used for user interaction.
This file also handles the state of these injected buttons. */

//Initializing variables
let dataArray = [];
let existingElement;
let newButton;
//Initializing css styles
const wipeStyles = `
background-color: #5fa695;
height: auto;
width: auto;
margin-right: 15px;
color: white;
padding: 15px;
font-weight: bold;
font-size: 25px;
`;
let elapsedTimeStyles = `
font-size: 30px;
font-weight: bold;
`;


//When invoked this function injects buttons into the page
function injectIntoDOM() {

    //Initialized a node list with all the captains slots
    const offlineSlots = document.querySelectorAll(".capSlot");
    // Initialize a counter for generating unique IDs
    let buttonCounter = 1;
    //Iterates though each slot
    offlineSlots.forEach(function (slot) {
        //Checks if button already exists on the current slot
        existingElement = slot.querySelector(".offlineButton");
        //Gets current slot status
        const slotStatus = slot.querySelector(".capSlotStatus");

        //If button doesn't exist, one is created and injected.
        if (!existingElement) {
            newButton = document.createElement("button");
            newButton.classList.add("offlineButton");
            // Generate a unique ID for the button
            newButton.setAttribute("id", `offlineButton_${buttonCounter}`);
            newButton.style.fontSize = "30px";
            newButton.style.marginLeft = "15px";
            newButton.style.color = "white";
            newButton.textContent = "--------------";
            newButton.style.backgroundColor = "#5fa695";
            slotStatus.appendChild(newButton);
            // Increment the counter for the next button
            buttonCounter++;
        }
    });

    const existingAfterButton = document.querySelector(".afterButton");

    if (!existingAfterButton) {
        newButton = document.createElement("button");
        newButton.className = "afterButton";
        newButton.innerHTML = "After <br>all";
        newButton.style.cssText = wipeStyles;
        let quantityItemsCont = document.querySelector(".quantityItemsCont");
        quantityItemsCont.insertBefore(newButton, quantityItemsCont.firstChild);
    }

    const existingDisableButton = document.querySelector(".disableButton");

    if (!existingDisableButton) {
        newButton = document.createElement("button");
        newButton.className = "disableButton";
        newButton.innerHTML = "Disable <br>all";
        newButton.style.cssText = wipeStyles;
        let quantityItemsCont = document.querySelector(".quantityItemsCont");
        quantityItemsCont.insertBefore(newButton, quantityItemsCont.firstChild);
    }

    // Checks if wipe button already exists
    const existingWipeButton = document.querySelector(".wipeButton");

    //If button doesn't exist one is created and injected.
    if (!existingWipeButton) {
        newButton = document.createElement("button");
        newButton.className = "wipeButton";
        newButton.innerHTML = "Wipe<br>states";
        newButton.style.cssText = wipeStyles;
        let quantityItemsCont = document.querySelector(".quantityItemsCont");
        quantityItemsCont.insertBefore(newButton, quantityItemsCont.firstChild);
    }

    // Checks if wipe button already exists
    const extSettingsBtn = document.querySelector(".extSettingsButton");

    //If button doesn't exist one is created and injected.
    if (!extSettingsBtn) {
        newButton = document.createElement("button");
        newButton.className = "extSettingsButton";
        newButton.innerHTML = "Settings";
        newButton.style.cssText = wipeStyles;
        let quantityItemsCont = document.querySelector(".quantityItemsCont");
        quantityItemsCont.insertBefore(newButton, quantityItemsCont.firstChild);
    }

    // Checks if label container already exists
    let elapsedTimeContainer = document.querySelector(".elapsedTimeContainer");
    //If button doesn't exist one is created and injected.
    if (!elapsedTimeContainer) {
        elapsedTimeContainer = document.createElement("div");
        elapsedTimeContainer.className = "elapsedTimeContainer";
        elapsedTimeContainer.style.cssText = elapsedTimeStyles;
        let quantityItemsCont = document.querySelector(".quantityItemsCont");
        quantityItemsCont.appendChild(elapsedTimeContainer);
    }
}

document.addEventListener("click", function (event) {

    (async () => {
        /* User clicked on the offline slot button.
        The offline button prevents the idle switcher from replacing
        captains on this slot even if the captains are idling or the slot is empty */
        if (event.target.classList.contains("offlineButton")) {
            let button = event.target;
            let id;
            //Checks button current state, updates it and save the slot id and state on the storage
            if (button.innerText === "ENABLED") {
                //Disable button
                button.innerText = "DISABLED";
                id = button.id;
                button.style.backgroundColor = "red";
                await setIdleState(id, 0);
            } else if (button.innerText === "DISABLED") {
                //Leave button
                button.innerText = "LEAVE AFTER";
                id = button.id;
                button.style.backgroundColor = "green";
                await setIdleState(id, 2);
            } else {
                //Enable button
                button.innerText = "ENABLED";
                button.style.backgroundColor = "#5fa695";
                id = button.id;
                await setIdleState(id, 1);
            }
        }

        //User clicked settings
        if (event.target.classList.contains("extSettingsButton")) {
            //Using the unique key identifiers all data is removed from storage
            const extensionId = chrome.runtime.id;
            const url = "chrome-extension://" + extensionId + "/settings.html"
            window.open(url, '_blank').focus();
        }

        //User clicked the wipe button.
        if (event.target.classList.contains("wipeButton")) {
            //Using the unique key identifiers all data is removed from storage
            chrome.storage.local.remove(['dungeonCaptain', 'clashCaptain', 'duelCaptain', 'flaggedCaptains', 'captainLoyalty', 'idleData', 'dataArray', 'offlinePermission', 'oddIdofflineButton_1', 'oddIdofflineButton_2', 'oddIdofflineButton_3', 'oddIdofflineButton_4', 'maxUnitsPlaced'], function () {
                //Resets dataArray to prevent data from being added from the array back to the storage.
                dataArray = [];
                loadBanner("Settings updated successfully", "#5fa695");
                //Resets button properties on the user interface.
                isContentRunning = false;
                let captainPauseSlots = document.querySelectorAll(".capSlot");
                captainPauseSlots.forEach(function (slot) {
                    slot.querySelector(".offlineButton").innerText = "ENABLED";
                    slot.querySelector(".offlineButton").style.backgroundColor = "#5fa695";
                });
                start();
            });
        }

        if (event.target.classList.contains("disableButton")) {
            //Resets dataArray to prevent data from being added from the array back to the storage.
            dataArray = [];
            //Resets button properties on the user interface.
            let captainPauseSlots = document.querySelectorAll(".capSlot");
            await setIdleState("offlineButton_1", 0)
            await setIdleState("offlineButton_2", 0)
            await setIdleState("offlineButton_3", 0)
            await setIdleState("offlineButton_4", 0)
            captainPauseSlots.forEach(async function (slot) {
                slot.querySelector(".offlineButton").innerText = "DISABLED";
                slot.querySelector(".offlineButton").style.backgroundColor = "red";
            });
            loadBanner("Settings updated successfully", "#5fa695");
        }

        if (event.target.classList.contains("afterButton")) {
            //Resets dataArray to prevent data from being added from the array back to the storage.
            dataArray = [];
            //Resets button properties on the user interface.
            let captainPauseSlots = document.querySelectorAll(".capSlot");
            await setIdleState("offlineButton_1", 2)
            await setIdleState("offlineButton_2", 2)
            await setIdleState("offlineButton_3", 2)
            await setIdleState("offlineButton_4", 2)
            captainPauseSlots.forEach(async function (slot) {
                slot.querySelector(".offlineButton").innerText = "LEAVE AFTER";
                slot.querySelector(".offlineButton").style.backgroundColor = "green";
            });
            loadBanner("Settings updated successfully", "#5fa695");
        }
    })();
});

/* This function is invoked when user clicks on a pause button.
It updates the states of whether or not a unit can be placed on the slot
It receives the captain name and the new slot state to save in storage */
function saveStateToStorage(name, booleanValue) {
    //Check if an item with the same name already exists
    let existingItem = dataArray.find((item) => item.name === name);

    //Item exists so the value is updated
    if (existingItem) {
        //Update the booleanValue of the existing item
        existingItem.booleanValue = booleanValue;
    }
    //Item does not exist so the item is added
    else {
        //Add a new object to the array
        dataArray.push({ name, booleanValue });

        //Check if the array length exceeds 4 as there are 4 slots
        if (dataArray.length > 4) {
            // Remove the oldest item (first item in the array)
            dataArray.shift();
        }
    }

    //Save updated array to local storage, but only if it has 3 or fewer items
    //Loads a banner signaling completion
    if (dataArray.length <= 4) {
        chrome.storage.local.set({ "dataArray": dataArray }, function () {
            if (chrome.runtime.lastError) {
                loadBanner("Failed to update settings", "red");
            } else {
                loadBanner("Settings updated sucessfully", "#5fa695");
            }
        });
    }
}


// This function retrieves the captain name and returns the pause button state from storage
function retrieveStateFromStorage(captainName) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get("dataArray", function (result) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                if (result.dataArray) {
                    dataArray = result.dataArray;
                    const matchingItem = dataArray.find((item) => item.name === captainName);
                    if (matchingItem) {
                        resolve(matchingItem.booleanValue);
                    } else {
                        resolve(false);
                    }
                } else {
                    resolve(false);
                }
            }
        });
    });
}


/* This function is invoked when user clicks on a idle enabled button.
It updates the state of whether or not a captain replacement should be selected for individual slots
It the slot id and the new switch state to save on storage */

async function setIdleState(id, booleanValue) {
    try {
        const result = await new Promise(resolve =>
            chrome.storage.local.get(['offlinePermission'], resolve)
        );

        let ids = result.offlinePermission || {};

        if (ids.hasOwnProperty(id) || Object.keys(ids).length < 4) {
            // id already exists or there are less than 4 in storage, update or save state
            ids[id] = booleanValue;

            await new Promise(resolve =>
                chrome.storage.local.set({ offlinePermission: ids }, resolve)
            );

            loadBanner("Settings updated successfully", "#5fa695");
        } else {
            loadBanner("Failed to update settings", "red");
        }
    } catch (error) {
        loadBanner("Failed to update settings", "red");
    }
}


//This function receives the slot id and returns the switch state value from storage
//If undefined (not been set by the user yet) it returns true as the default value
function getIdleState(id) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['offlinePermission'], function (result) {
            let ids = result.offlinePermission || {};
            let booleanValue = ids[id];
            resolve(booleanValue !== undefined ? booleanValue : true);
        });
    });
}