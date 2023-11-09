/* This file injects buttons into the page so they can be used for user interaction.
This file also handles the state of these injected buttons. */

let pause = String.fromCharCode(9208);
let play = String.fromCharCode(9654);
let pauseArray = [];
let existingElement;
let newButton;
const wipeStyles = `
background-color: #5fa695;
height: auto;
width: auto;
margin-right: 15px;
color: white;
padding: 15px;
font-size: 18px;
`;
const logStyles = `
height: 70px;
width: auto;
margin-right: 15px;
`;
let temporaryStyles = `
display: flex;
justify-content: center;
height: 100vh;
align-items: center;
font-size: 60px;
color: white;
text-align: center;
`;

function injectIntoDOM() {

    const offlineSlots = document.querySelectorAll(".capSlot");
    // Initialize a counter for generating unique IDs
    let buttonCounter = 1;
    offlineSlots.forEach(function (slot) {
        existingElement = slot.querySelector(".offlineButton");
        const slotStatus = slot.querySelector(".capSlotStatus");

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

    let capSlotNameContList = document.querySelectorAll(".capSlotNameCont");
    // Iterate through the list of elements
    capSlotNameContList.forEach(function (capSlotNameCont) {
        // Check if the element already exists inside the current capSlotNameCont
        existingElement = capSlotNameCont.querySelector(".pauseButton");

        if (!existingElement) {
            // Create a new button element
            newButton = document.createElement("div");
            newButton.classList.add("pauseButton");
            newButton.innerText = play; // Set the button text
            newButton.style.paddingLeft = "40px";
            newButton.style.fontSize = "100px";
            // Append the new button to the capSlotNameCont element
            capSlotNameCont.appendChild(newButton);
        }

    });

    // Create a wipeButton
    existingButton = document.querySelector(".wipeButton");
    if (!existingButton) {

        newButton = document.createElement("button");
        newButton.className = "wipeButton";
        newButton.innerHTML = "Wipe<br>captain";
        newButton.style.cssText = wipeStyles;
        let quantityItemsCont = document.querySelector(".quantityItemsCont");

        quantityItemsCont.insertBefore(newButton, quantityItemsCont.firstChild);
    }

    //Create log button
    existingButton = document.querySelector(".log_img");
    if (!existingButton) {

        let logButton = document.createElement("img");
        logButton.className = "log_img";
        logButton.src = "https://i.imgur.com/GJnPXjx.png";
        logButton.alt = "Open log tab";
        logButton.style.cssText = logStyles;

        // Find the quantityItemsCont element
        let quantityItemsCont = document.querySelector(".quantityItemsCont");

        // Insert the new button before the quantityItem element
        quantityItemsCont.insertBefore(logButton, quantityItemsCont.firstChild);
    }
}

document.addEventListener("click", function (event) {
    if (event.target.classList.contains("pauseButton")) {
        let button = event.target;
        let capSlotNameCont = event.target.closest(".capSlotNameCont");
        let captainName = capSlotNameCont.querySelector(".capSlotName > div").innerText;
        if (button.innerText === pause) {
            //Play
            button.innerText = play;
            saveStateToStorage(captainName, false);
        } else {
            //Pause
            button.innerText = pause;
            saveStateToStorage(captainName, true);
        }
    }


    if (event.target.classList.contains("offlineButton")) {
        let button = event.target;
        let id;
        if (button.innerText === "ENABLED") {
            //Disable button
            button.innerText = "DISABLED";
            id = button.id;
            button.style.backgroundColor = "red";
            setOfflineState(id, false);
        } else {
            //Enable button
            button.innerText = "ENABLED";
            button.style.backgroundColor = "#5fa695";
            id = button.id;
            setOfflineState(id, true);
        }
    }




    if (event.target.classList.contains("wipeButton")) {
        chrome.storage.local.remove(["dungeonCaptain", "clashCaptain", "duelCaptain", 'flaggedCaptains', 'captainLoyalty', 'idleData', 'dataArray', 'offlinePermission'], function () {
            dataArray = [];
            loadBanner("Settings updated sucessfully", "#5fa695");
            let captainPauseSlots = document.querySelectorAll(".capSlotNameCont");
            captainPauseSlots.forEach(function (slot) {
                slot.querySelector(".pauseButton").innerText = play;
            });
        });
    }

    if (event.target.classList.contains("log_img")) {
        let iframe = document.querySelector(".log_iframe")
        if (iframe) {
            iframe.remove()
        } else {
            const iconProgress = document.querySelector(".progressIcon");
            if (iconProgress) {
                iconProgress.remove();
            }
            let viewContainer = document.querySelector(".viewContainer");

            iframe = document.createElement('iframe');
            iframe.className = "log_iframe";
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
            iframe.style.position = 'fixed';
            iframe.style.top = '0';
            iframe.style.left = '0';
            iframe.style.backgroundColor = '#1b2a35';
            viewContainer.appendChild(iframe);

            iframe = iframe.contentDocument || iframe.contentWindow.document;
            let newParagraph = iframe.createElement('p');

            // Set the text content of the paragraph
            newParagraph.innerHTML = 'Captain Reliability and Battle Log System<br>Coming soon™';
            newParagraph.style.cssText = temporaryStyles;
            newParagraph.style.textAlign = 'center';
            iframe.body.appendChild(newParagraph);

        }
    }

});

let dataArray = [];

function saveStateToStorage(name, booleanValue) {
    // Check if an item with the same name already exists
    let existingItem = dataArray.find((item) => item.name === name);

    if (existingItem) {
        // Update the booleanValue of the existing item
        existingItem.booleanValue = booleanValue;
    } else {
        // Add a new object to the array
        dataArray.push({ name, booleanValue });

        // Check if the array length exceeds 10
        if (dataArray.length > 4) {
            // Remove the oldest item (first item in the array)
            dataArray.shift();
        }
    }

    // Save updated array to local storage, but only if it has 3 or fewer items
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


// Function to retrieve data from local storage
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


function setOfflineState(id, booleanValue) {
    chrome.storage.local.get(['offlinePermission'], function (result) {
        let ids = result.offlinePermission || {};

        if (ids.hasOwnProperty(id)) {
            // ID already exists, update boolean value
            ids[id] = booleanValue;
        } else if (Object.keys(ids).length < 4) {
            // ID doesn't exist and we have less than 4 IDs, add it
            ids[id] = booleanValue;
        } else {
            console.log('Maximum limit of 4 IDs reached.');
            return;
        }

        chrome.storage.local.set({ offlinePermission: ids }, function () {
            if (chrome.runtime.lastError) {
                loadBanner("Failed to update settings", "red");
            } else {
                loadBanner("Settings updated successfully", "#5fa695");
            }
        });
    });
}



function getIdleState(id) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['offlinePermission'], function (result) {
            let ids = result.offlinePermission || {};
            let booleanValue = ids[id];
            resolve(booleanValue !== undefined ? booleanValue : true);
        });
    });
}