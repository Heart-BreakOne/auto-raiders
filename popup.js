document.addEventListener('DOMContentLoaded', function () {
    initializeSwitch('pauseSwitch');
    initializeSwitch('potionSwitch');
    initializeSwitch('legendarySwitch');
    initializeSwitch('scrollSwitch');
    initializeSwitch('uncommonSwitch');
    initializeSwitch('rareSwitch');
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
            console.log('Switch state saved');
            sendMessageToContentScript(switchId, switchState)

        });
    });
}
 




function sendMessageToContentScript(switchId, switchState) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var activeTab = tabs[0];
        chrome.runtime.sendMessage({type: "FROM_POPUP", switchId: switchId, switchState: switchState, tabId: activeTab.id});
    });
}