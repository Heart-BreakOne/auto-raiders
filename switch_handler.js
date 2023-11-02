const successMessage = 'Settings updated sucessfully';
const failureMessage = 'Failed to update settings';
const redColor = 'red';
const greenColor = 'green';

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
        chrome.storage.local.set({ 'radio': request.selectedOption }, function () {
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
        chrome.storage.local.get(['radio'], function (result) {
            resolve(result.radio);
        });
    });
}

function loadBanner(message, color) {
    let customBanner = document.querySelector('.custom_banner');
    if(customBanner) {
        customBanner.remove()
    }
    // Create a new banner element
    var banner = document.createElement('div');
    banner.className = 'custom_banner';
    banner.textContent = message;
    // Apply styles
    banner.style.backgroundColor = color;
    banner.style.color = 'white';
    banner.style.position = 'fixed';
    banner.style.fontSize = "60px";
    banner.style.textAlign = 'center';
    banner.style.height = '8%';
    banner.style.padding = '20px';
    banner.style.marginTop = '80%';
    banner.style.marginLeft = '30%';
    banner.style.marginRight = '30%';
    banner.style.borderRadius = '25px';
    // Get the main div element
    var mainDiv = document.querySelector('.main');
    // Append the banner element to the main div
    mainDiv.appendChild(banner);

    setTimeout(function() {
        banner.remove();
      }, 500);
}