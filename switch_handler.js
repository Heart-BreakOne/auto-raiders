const successMessage = "Settings updated sucessfully";
const failureMessage = "Failed to update settings";
const redColor = "red";
const greenColor = "#5fa695";

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type === "FROM_BACKGROUND") {
        chrome.storage.local.set({ [request.switchId]: request.switchState }, function () {
            if (chrome.runtime.lastError) {
                loadBanner(failureMessage, redColor)
            } else {
                loadBanner(successMessage, greenColor)
            }
        });

    }
    return true;
});

function getSwitchState(switchId) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([switchId], function (result) {
            const res = result[switchId] || false;
            resolve(res);
        });
    });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type === "RADIO_FROM_BACKGROUND") {
        chrome.storage.local.set({ "radio": request.selectedOption }, function () {
            if (chrome.runtime.lastError) {
                loadBanner(failureMessage, redColor)
            } else {
                loadBanner(successMessage, greenColor)
            }
        });
    }
    return true;
});

function getRadioButton() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["radio"], function (result) {
            resolve(result.radio);
        });
    });
}


function loadBanner(message, color) {

    let customBanner = document.querySelector(".custom_banner");
    if (customBanner) {
        customBanner.remove();
    }

    const bannerStyles = `
        background-color: ${color};
        color: white;
        position: fixed;
        font-size: 60px;
        text-align: center;
        height: 8%;
        padding: 20px;
        margin-top: 80%;
        margin-left: 30%;
        margin-right: 30%;
        border-radius: 25px;
    `;

    const banner = document.createElement("div");
    banner.className = "custom_banner";
    banner.textContent = message;
    banner.style.cssText = bannerStyles;

    const mainDiv = document.querySelector(".main");
    mainDiv.appendChild(banner);

    setTimeout(function() {
        banner.remove();
    }, 500);
}