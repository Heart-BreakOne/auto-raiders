chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === "FROM_POPUP") {
        var tabId = request.tabId;
        chrome.tabs.sendMessage(tabId, {type: "FROM_BACKGROUND", switchId: request.switchId, switchState: request.switchState });
    }
});


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === "RADIO_FROM_POPUP") {
        var tabId = request.tabId;
        chrome.tabs.sendMessage(tabId, {type: "RADIO_FROM_BACKGROUND", selectedOption: request.selectedOption });
    }
});
