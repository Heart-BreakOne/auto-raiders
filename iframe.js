
let unitsArrayList = undefined;
let arrayOfFetchedUnits = [];
//This script handles the user interaction with the toggle switches and radio buttons on the popup of the extension.

//Event listener to initialize the switches as well as update their states
document.addEventListener("DOMContentLoaded", function () {
    initializeSwitch("questSwitch");
    initializeSwitch("scrollSwitch");
    initializeSwitch("extraSwitch");
    initializeSwitch("commonSwitch");
    initializeSwitch("uncommonSwitch");
    initializeSwitch("rareSwitch");
    initializeSwitch("legendarySwitch");
    initializeSwitch("dungeonSwitch");
    initializeSwitch("duelSwitch");
    initializeSwitch("clashSwitch");
    initializeSwitch("campaignSwitch");
    initializeSwitch("battlepassSwitch");
    initializeSwitch("offlineSwitch");
    initializeSwitch("skipSwitch");
    initializeSwitch("dailySwitch");
    initializeSwitch("equipSwitch");
    initializeSwitch("favoriteSwitch");
    initializeSwitch("liveMasterSwitch");
    initializeSwitch("priorityMasterSwitch");
    initializeSwitch("idleMasterSwitch");
    initializeSwitch("skipIdleMasterSwitch");
    initializeSwitch("priorityListSwitch");
    initializeReloader("reloaderInput");

});

//When the user interacts with the toggle switches, it gets the current stored value and update them with the value.
function initializeSwitch(switchId) {
    const switchElement = document.getElementById(switchId);

    // Load switch state from storage
    chrome.storage.local.get([switchId], function (result) {
        switchElement.checked = result[switchId] || false;
    });

    //Listen to changes on the switch states and set the new value.
    switchElement.addEventListener("change", function () {
        const switchState = this.checked;
        chrome.storage.local.set({ [switchId]: switchState }, function () {
            if (chrome.runtime.lastError) {
                loadBanner(failureMessage, redColor)
            } else {
                loadBanner(successMessage, greenColor)
            }
        });
    });
}

//Event listener to initialize the radio buttons as well as update their states
document.addEventListener("DOMContentLoaded", async function () {
    //Function to save the new radio button state on the storage
    function handlePotionRadioButtonChange() {
        let selectedOption = document.querySelector('input[name="potion"]:checked').value;
        chrome.storage.local.set({ selectedOption: selectedOption }, function () {
            if (chrome.runtime.lastError) {
                loadBanner(failureMessage, redColor);
            } else {
                loadBanner(successMessage, greenColor);
            }
        });
    }

    await loadUnitsFromStorage();

    //TIme in minutes to reload
    document.getElementById('reloaderButton').addEventListener('click', function () {

        const inputValue = document.getElementById('reloaderInput').value;
        if (inputValue != undefined || inputValue != null) {
            chrome.storage.local.set({ reloaderInput: inputValue }, function () {
                if (chrome.runtime.lastError) {
                    loadBanner(failureMessage, redColor);
                } else {
                    loadBanner(successMessage, greenColor);
                }
            });
        }
    });


    document.getElementById("getUnits_button").addEventListener("click", async function () {
        await getUnits();
        displayUnits();
    });

    document.getElementById("setUnits_button").addEventListener("click", async function () {
        await saveUnits();
        await loadUnitsFromStorage()
    });

    //Event listener for when the potion radio button is changed by the user
    let potionRadioButtons = document.querySelectorAll('input[name="potion"]');
    potionRadioButtons.forEach(function (radioButton) {
        radioButton.addEventListener("change", handlePotionRadioButtonChange);
    });

    //Get potion radio button state from storage and set the button with the value for the user to visually see
    chrome.storage.local.get(["selectedOption"], function (result) {
        let savedOption = result.selectedOption;
        if (savedOption) {
            let radioToCheck = document.querySelector('input[name="potion"][value="' + savedOption + '"]');
            if (radioToCheck) {
                radioToCheck.checked = true;
            }
        }
    });

    //Function to save the new radio button state on the storage
    function handleLoyaltyRadioButtonChange() {
        let loyaltyOption = document.querySelector('input[name="loyalty"]:checked').value;
        chrome.storage.local.set({ loyalty: loyaltyOption }, function () {
            if (chrome.runtime.lastError) {
                loadBanner(failureMessage, redColor);
            } else {
                loadBanner(successMessage, greenColor);
            }
        });
    }

    // Event listener for when the loyalty radio button is changed by the user
    let loyaltyRadioButtons = document.querySelectorAll('input[name="loyalty"]');
    loyaltyRadioButtons.forEach(function (radioButton) {
        radioButton.addEventListener("change", handleLoyaltyRadioButtonChange);
    });

    //Get loyalty radio button state from storage and set the button with the value for the user to visually see
    chrome.storage.local.get(["loyalty"], function (result) {
        let savedOption = result.loyalty;
        if (savedOption) {
            let radioToCheck = document.querySelector('input[name="loyalty"][value="' + savedOption + '"]');
            if (radioToCheck) {
                radioToCheck.checked = true;
            }
        }
    });

    document.getElementById("instructions_button").addEventListener('click', function () {
        //Open the options page
        chrome.tabs.create({ url: "/html/how_to_play.html" });
    });

    //Event listener for a button to open the options page of the extension (log.html)
    document.getElementById("log_button").addEventListener('click', function () {
        //Open the options page
        const url = `chrome-extension://${chrome.runtime.id}/html/log.html`
        chrome.tabs.create({ url: url });
    });

    document.getElementById("whitelist_button").addEventListener('click', function () {
        // Open the options page
        const url = `chrome-extension://${chrome.runtime.id}/html/whitelist.html`
        chrome.tabs.create({ url: url });
    });

});

const successMessage = "Settings updated sucessfully";
const failureMessage = "Failed to update settings";
const redColor = "red";
const greenColor = "#5fa695";


function loadBanner(message, color) {
    //If the user rapid clicks, it removes the button if it exists so a new one can be injected
    let customBanner = document.querySelector(".custom_banner");
    if (customBanner) {
        customBanner.remove();
    }

    //Banner styles so a retangle can be displayed on the center of the screen
    const bannerStyles = `
        background-color: ${color};
        zIndex: 9999;
        color: white;
        position: fixed;
        font-size: xxx-large;
        text-align: center;
        padding: 10px;
        width: 100%;
    `;

    //Creates the element
    const banner = document.createElement("div");
    banner.className = "custom_banner";
    banner.textContent = message;
    banner.style.cssText = bannerStyles;

    //Injects the element
    const mainDiv = document.querySelector(".main");
    mainDiv.appendChild(banner);

    //Removes the element after 500 milliseconds.
    setTimeout(function () {
        banner.remove();
    }, 400);
}
async function initializeReloader() {

    chrome.storage.local.get(['reloaderInput'], function (result) {
    
        const reloaderInput = result.reloaderInput;
        if (reloaderInput !== undefined) {
            document.getElementById('reloaderInput').value = reloaderInput;
        }
    });
}

const contport = chrome.runtime.connect({ name: "content-script" });

async function getUnits() {
    unitsArrayList = null;
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error('Timeout while waiting for response'));
        }, 8000);

        const responseListener = (response) => {
            clearTimeout(timeout);
            // Handle the response (true/false)
            if (response !== undefined) {
                unitsArrayList = response.response;

                resolve(unitsArrayList);
            } else {
                reject(new Error('Invalid response format from background script'));
            }
        };

        contport.onMessage.addListener(responseListener);

        contport.postMessage({ action: "getUnits" });
    });
}

function displayUnits() {
    arrayOfFetchedUnits = []
    if (unitsArrayList != null && unitsArrayList !== undefined) {
        let table = document.querySelector("#tableOfUnits")
        if (table) {
            table.remove();
        }
        table = document.createElement('table');
        table.id = "tableOfUnits"

        const headerRow = table.insertRow(0);
        const headers = ['Index', 'Unit Name', 'Unit Level', 'Unit Specialization', 'Select Priority (0 to skip, 1 is the highest)'];

        headers.forEach((headerText) => {
            const headerCell = headerRow.insertCell();
            headerCell.textContent = headerText;
        });

        for (let i = 0; i < unitsArrayList.data.length; i++) {
            const position = unitsArrayList.data[i];
            const row = table.insertRow(i + 1);

            const indexCell = row.insertCell(0);
            indexCell.textContent = i + 1;

            const unitNameCell = row.insertCell(1);
            unitNameCell.textContent = position.unitType;

            const unitLevelCell = row.insertCell(2);
            unitLevelCell.textContent = position.level;

            const unitSpecializationCell = row.insertCell(3);
            unitSpecializationCell.textContent = position.specializationUid;

            const inputCell = row.insertCell(4);
            const inputSpinner = document.createElement('input');
            inputSpinner.type = 'number';
            inputSpinner.min = 0;
            inputSpinner.value = 0;

            const rowData = {
                index: i + 1,
                unitType: position.unitType,
                unitLevel: position.level,
                specializationUid: position.specializationUid
            };

            arrayOfFetchedUnits.push(rowData);


            inputSpinner.id = `${i}`;

            inputCell.appendChild(inputSpinner);
        }


        const unitsTableContainer = document.getElementById('unitTableContainer');
        unitsTableContainer.appendChild(table);
    }
}


let attempt = 0;
async function saveUnits() {
    const table = document.getElementById('tableOfUnits');

    const dataArray = [];

    try {
        attempt++;
        for (let i = 1; i < table.rows.length; i++) {
            const row = table.rows[i];
            const unitName = row.cells[1].textContent;
            const unitLevel = row.cells[2].textContent;
            const specializationUid = row.cells[3].textContent;
            const inputNumber = document.getElementById(`${i}`);
            const inputValue = inputNumber.value;

            const rowData = {
                unitName,
                unitLevel,
                specializationUid,
                inputValue
            };
            dataArray.push(rowData);

            attempt = 0
        }
    } catch (error) {
        if (attempt === 1) {
            saveUnits();
        }
    }

    dataArray.sort((a, b) => {
        if (a.inputValue === 0 && b.inputValue === 0) {
            return 0;
        } else if (a.inputValue === 0) {
            return 1;
        } else if (b.inputValue === 0) {
            return -1;
        } else {
            return a.inputValue - b.inputValue;
        }
    });

    const storageObject = {};
    storageObject['unitList'] = dataArray;

    //Save the array to Chrome's local storage
    chrome.storage.local.set(storageObject, function () {
        if (chrome.runtime.lastError) {
            loadBanner(failureMessage, "red")
        } else {
            loadBanner(successMessage, greenColor);
        }
    });
}




async function loadUnitsFromStorage() {

    await chrome.storage.local.get(['unitList'], (result) => {
        const array = result.unitList;
        // Handle the retrieved data

        if (array.length > 0) {
            let table = document.querySelector("#tableOfUnits")
            if (table) {
                table.remove();
            }
            table = document.createElement('table');
            table.id = "tableOfUnits"

            const headerRow = table.insertRow(0);
            const headers = ['Index', 'Unit Name', 'Unit Level', 'Unit Specialization', 'Select Priority (0 to skip it)'];

            headers.forEach((headerText) => {
                const headerCell = headerRow.insertCell();
                headerCell.textContent = headerText;
            });

            for (let i = 0; i < array.length; i++) {
                const position = array[i];
                const row = table.insertRow(i + 1);

                const indexCell = row.insertCell(0);
                indexCell.textContent = i + 1;

                const unitNameCell = row.insertCell(1);
                unitNameCell.textContent = position.unitName;

                const unitLevelCell = row.insertCell(2);
                unitLevelCell.textContent = position.unitLevel;

                const unitSpecializationCell = row.insertCell(3);
                unitSpecializationCell.textContent = position.specializationUid;

                const inputCell = row.insertCell(4);
                const inputSpinner = document.createElement('input');
                inputSpinner.type = 'number';
                inputSpinner.min = 0;
                inputSpinner.value = position.inputValue;

                inputSpinner.id = `${i}`;

                inputCell.appendChild(inputSpinner);
            }


            const unitsTableContainer = document.getElementById('unitTableContainer');
            unitsTableContainer.appendChild(table);
        }
    });

}