
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
    initializeSwitch("equipSwitch");
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
document.addEventListener("DOMContentLoaded", function () {
    // Function to save the new radio button state on the storage
    function handleRadioButtonChange() {
        let selectedOption = document.querySelector('input[name="potion"]:checked').value;
        chrome.storage.local.set({ selectedOption: selectedOption });
        if (chrome.runtime.lastError) {
            loadBanner(failureMessage, redColor)
        } else {
            loadBanner(successMessage, greenColor)
        }
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

    document.getElementById("instructions_button").addEventListener('click', function () {
        // Open the options page
        chrome.tabs.create({ url: "https://heart-breakone.github.io/webpages/how_to_play.html" });
    });

    //Event listener for a button to open the options page of the extension (log.html)
    document.getElementById("log_button").addEventListener('click', function () {
        // Open the options page
        const url = `chrome-extension://${chrome.runtime.id}/log.html`
        chrome.tabs.create({ url: url });
    });

    document.getElementById("whitelist_button").addEventListener('click', function () {
        // Open the options page
        const url = `chrome-extension://${chrome.runtime.id}/whitelist.html`
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
        color: white;
        position: fixed;
        font-size: xxx-large;
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
    setTimeout(function () {
        banner.remove();
    }, 400);
}