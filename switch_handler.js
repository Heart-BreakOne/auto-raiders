//This file receives the communications from the popup.js/background.js and sets the toggle switches/radio buttons
//It is also responsible for getting the values when requested
//It also injects a visual alert so the user knows if the set into storage was successful.

//Initializes some constants
const successMessage = "Settings updated sucessfully";
const failureMessage = "Failed to update settings";
const redColor = "red";
const greenColor = "#5fa695";

//Listens for messages from the background script containing the toggle switch states and id
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type === "FROM_BACKGROUND") {
        //Sets storage with switch id and value
        chrome.storage.local.set({ [request.switchId]: request.switchState }, function () {
            //Shows a red banner if failure and a green banner if successful
            if (chrome.runtime.lastError) {
                loadBanner(failureMessage, redColor)
            } else {
                loadBanner(successMessage, greenColor)
            }
        });

    }
    return true;
});

//When invoked this function receives the switch id and returns the switch value from storage.
function getSwitchState(switchId) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([switchId], function (result) {
            const res = result[switchId] || false;
            resolve(res);
        });
    });
}


//Listens for messages from the background script containing the radio button state
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type === "RADIO_FROM_BACKGROUND") {
        //Sets radio button with radio button state
        chrome.storage.local.set({ "radio": request.selectedOption }, function () {
            if (chrome.runtime.lastError) {
                //Shows a red banner if failure and a green banner if successful
                loadBanner(failureMessage, redColor)
            } else {
                loadBanner(successMessage, greenColor)
            }
        });
    }
    return true;
});

//When invoked this function returns the radio button value from storage
function getRadioButton() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["radio"], function (result) {
            resolve(result.radio);
        });
    });
}

//When invoked this function receives the message to be displayed and the color and injects it into the page
function loadBanner(message, color) {
    //If the user rapid clicks, it removes the button if it exists so a new one can be injected
    let customBanner = document.querySelector(".custom_banner");
    if (customBanner) {
        customBanner.remove();
    }

    //Banner styles so a retangle can be displayed on the center of the screen
    const bannerStyles = `
        background-color: ${color};
        color: white;
        position: fixed;
        font-size: 60px;
        text-align: center;
        padding: 10px;
        margin-top: 20%;
        margin-left: 30%;
        margin-right: 30%;
        border-radius: 25px;
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
    setTimeout(function() {
        banner.remove();
    }, 500);
}