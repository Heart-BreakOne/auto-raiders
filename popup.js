document.addEventListener('DOMContentLoaded', function () {
    initializeSwitch('questSwitch');
    initializeSwitch('scrollSwitch');
    initializeSwitch('extraSwitch');
    initializeSwitch('commonSwitch');
    initializeSwitch('uncommonSwitch');
    initializeSwitch('rareSwitch');
    initializeSwitch('legendarySwitch');
    initializeSwitch('dungeonSwitch');
    initializeSwitch('duelSwitch');
    initializeSwitch('clashSwitch');
    initializeSwitch('loyaltySwitch');
    initializeSwitch('battlepassSwitch');
});

function initializeSwitch(switchId) {
    const switchElement = document.getElementById(switchId);

    // Load switch state from storage
    chrome.storage.local.get([switchId], function (result) {
        switchElement.checked = result[switchId] || false;
    });

    switchElement.addEventListener('change', function () {
        const switchState = this.checked;
        chrome.storage.local.set({ [switchId]: switchState }, function () {
            sendMessageToContentScript(switchId, switchState)

        });
    });
}

function sendMessageToContentScript(switchId, switchState) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var activeTab = tabs[0];
        chrome.runtime.sendMessage({ type: "FROM_POPUP", switchId: switchId, switchState: switchState, tabId: activeTab.id });
    });
}



function sendMessageToContentScript2(selectedOption) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var activeTab = tabs[0];
        chrome.runtime.sendMessage({ type: "RADIO_FROM_POPUP", selectedOption: selectedOption, tabId: activeTab.id });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    // Function to handle radio button change event
    function handleRadioButtonChange() {
        var selectedOption = document.querySelector('input[name="potion"]:checked').value;
        chrome.storage.sync.set({ selectedOption: selectedOption });
        sendMessageToContentScript2(selectedOption)
    }

    // Add event listener to radio buttons
    var radioButtons = document.querySelectorAll('input[name="potion"]');
    radioButtons.forEach(function (radioButton) {
        radioButton.addEventListener('change', handleRadioButtonChange);
    });

    // Check Chrome storage for saved value
    chrome.storage.sync.get(['selectedOption'], function (result) {
        var savedOption = result.selectedOption;
        if (savedOption) {
            var radioToCheck = document.querySelector('input[value="' + savedOption + '"]');
            if (radioToCheck) {
                radioToCheck.checked = true;
            }
        }
    });



});