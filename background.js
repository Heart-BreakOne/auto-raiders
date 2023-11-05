chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type === "FROM_POPUP") {
        const tabId = request.tabId;
        chrome.tabs.sendMessage(tabId, {
            switchId:request.switchId,
            switchState: request.switchState,
            type: "FROM_BACKGROUND"
        });
    }
});


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type === "RADIO_FROM_POPUP") {
        const tabId = request.tabId;
        chrome.tabs.sendMessage(tabId, {
            selectedOption: request.selectedOption ,
            type: "RADIO_FROM_BACKGROUND"
        });
    }
});
