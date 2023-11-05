
let pause = String.fromCharCode(9208);
let play = String.fromCharCode(9654);
let pauseArray = [];
let existingElement
let newButton
const wipeStyles = `
background-color: #5fa695;
height: auto;
width: auto;
margin-right: 15px;
color: white;
padding: 15px;
font-size: 18px;
`;
const logStyles = `
height: 70px;
width: auto;
margin-right: 15px;
`;
let temporaryStyles = `
display: flex;
justify-content: center;
height: 100vh;
align-items: center;
font-size: 60px;
color: white;
text-align: center;
`

function injectIntoDOM() {
    let capSlotNameContList = document.querySelectorAll(".capSlotNameCont");

    // Iterate through the list of elements
    capSlotNameContList.forEach(function (capSlotNameCont) {
        // Check if the element already exists inside the current capSlotNameCont
        existingElement = capSlotNameCont.querySelector(".pauseButton");

        if (!existingElement) {
            // Create a new button element
            newButton = document.createElement("div");
            newButton.classList.add("pauseButton");
            newButton.innerText = play; // Set the button text
            newButton.style.paddingLeft = "40px";
            newButton.style.fontSize = "100px";
            // Append the new button to the capSlotNameCont element
            capSlotNameCont.appendChild(newButton);
        }

    });

    // Create a wipeButton
    existingButton = document.querySelector(".wipeButton");
    if (!existingButton) {

        newButton = document.createElement("button");
        newButton.className = "wipeButton";
        newButton.innerHTML = "Wipe<br>captain";
        newButton.style.cssText = wipeStyles;
        let quantityItemsCont = document.querySelector(".quantityItemsCont");

        quantityItemsCont.insertBefore(newButton, quantityItemsCont.firstChild);
    }

    //Create log button
    existingButton = document.querySelector(".log_img");
    if (!existingButton) {

        let logButton = document.createElement("img");
        logButton.className = "log_img";
        logButton.src = "https://i.imgur.com/GJnPXjx.png";
        logButton.alt = "Open log tab";
        logButton.style.cssText = logStyles;

        // Find the quantityItemsCont element
        let quantityItemsCont = document.querySelector(".quantityItemsCont");

        // Insert the new button before the quantityItem element
        quantityItemsCont.insertBefore(logButton, quantityItemsCont.firstChild);
    }
}

document.addEventListener("click", function (event) {
    if (event.target.classList.contains("pauseButton")) {
        let button = event.target;
        let capSlotNameCont = event.target.closest(".capSlotNameCont");
        let captainName = capSlotNameCont.querySelector(".capSlotName > div").innerText;
        if (button.innerText === pause) {
            //Play
            button.innerText = play;
            saveStateToStorage(captainName, false);
        } else {
            //Pause
            button.innerText = pause;
            saveStateToStorage(captainName, true);
        }
    }

    if (event.target.classList.contains("wipeButton")) {
        chrome.storage.local.remove(["dungeonCaptain", "clashCaptain", "duelCaptain", 'flaggedCaptains', 'captainLoyalty'], function () {
            loadBanner("Settings updated sucessfully", "#5fa695");
        });
    }

    if (event.target.classList.contains("log_img")) {
        let iframe = document.querySelector(".log_iframe")
        if (iframe) {
            iframe.remove()
        } else {
            const iconProgress = document.querySelector(".progressIcon");
            if (iconProgress) {
                iconProgress.remove();
            }
            let viewContainer = document.querySelector(".viewContainer");

            iframe = document.createElement('iframe');
            iframe.className = "log_iframe";
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
            iframe.style.position = 'fixed';
            iframe.style.top = '0';
            iframe.style.left = '0';
            iframe.style.backgroundColor = '#1b2a35';
            viewContainer.appendChild(iframe);

            iframe = iframe.contentDocument || iframe.contentWindow.document;
            let newParagraph = iframe.createElement('p');

            // Set the text content of the paragraph
            newParagraph.innerHTML = 'Captain Reliability and Battle Log System<br>Coming soon™';
            newParagraph.style.cssText = temporaryStyles;
            newParagraph.style.textAlign = 'center';
            iframe.body.appendChild(newParagraph);

        }
    }

});

let dataArray = [];

function saveStateToStorage(name, booleanValue) {
    // Check if an item with the same name already exists
    let existingItem = dataArray.find((item) => item.name === name);

    if (existingItem) {
        // Update the booleanValue of the existing item
        existingItem.booleanValue = booleanValue;
    } else {
        // Add a new object to the array
        dataArray.push({ name, booleanValue });

        // Check if the array length exceeds 10
        if (dataArray.length > 10) {
            // Remove the oldest item (first item in the array)
            dataArray.shift();
        }
    }

    // Save updated array to local storage, but only if it has 10 or fewer items
    if (dataArray.length <= 10) {
        chrome.storage.local.set({ "dataArray": dataArray }, function () {
            if (chrome.runtime.lastError) {
                loadBanner("Failed to update settings", "red");
            } else {
                loadBanner("Settings updated sucessfully", "#5fa695");
            }
        });
    }
}


// Function to retrieve data from local storage
function retrieveStateFromStorage(captainName) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get("dataArray", function (result) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                if (result.dataArray) {
                    dataArray = result.dataArray.slice(-10);
                    const matchingItem = dataArray.find((item) => item.name === captainName);
                    if (matchingItem) {
                        resolve(matchingItem.booleanValue);
                    } else {
                        resolve(false);
                    }
                } else {
                    resolve(false);
                }
            }
        });
    });
}