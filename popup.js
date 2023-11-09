
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
    initializeSwitch("loyaltySwitch");
    initializeSwitch("battlepassSwitch");
    initializeSwitch("offlineSwitch");
    initializeSwitch("skipSwitch");
    initializeSwitch("dailySwitch");
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
            sendMessageToContentScript(switchId, switchState);

        });
    });
}

//Sends a message to the background script with the switch id and switch state so it can be passed to the content script.
function sendMessageToContentScript(switchId, switchState) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        let activeTab = tabs[0];
        chrome.runtime.sendMessage({
            type: "FROM_POPUP",
            switchId: switchId,
            switchState: switchState,
            tabId: activeTab.id
        });
    });
}

//Event listener to initialize the radio buttons as well as update their states
document.addEventListener("DOMContentLoaded", function () {
    // Function to save the new radio button state on the storage
    function handleRadioButtonChange() {
        let selectedOption = document.querySelector('input[name="potion"]:checked').value;
        chrome.storage.local.set({ selectedOption: selectedOption });
        sendMessageToContentScript2(selectedOption);
    }

    // Event listener for when the radio button is changed by the user
    let radioButtons = document.querySelectorAll('input[name="potion"]');
    radioButtons.forEach(function (radioButton) {
        radioButton.addEventListener("change", handleRadioButtonChange);
    });

    // Get radio button state from storage and set the button with the value for the user to visually see
    chrome.storage.local.get(["selectedOption"], function (result) {
        let savedOption = result.selectedOption;
        if (savedOption) {
            let radioToCheck = document.querySelector('input[value="' + savedOption + '"]');
            if (radioToCheck) {
                radioToCheck.checked = true;
            }
        }
    });

    //Sends a message to the background script with the radio button state so it can be passed to the content script.
    function sendMessageToContentScript2(selectedOption) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            let activeTab = tabs[0];
            chrome.runtime.sendMessage({
                type: "RADIO_FROM_POPUP",
                selectedOption: selectedOption,
                tabId: activeTab.id
            });
        });
    }

});