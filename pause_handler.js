
let pause = String.fromCharCode(9208);
let play = String.fromCharCode(9654);
let pauseArray = [];

function injectIntoDOM() {
    // Find all elements with class 'capSlotNameCont'
    var capSlotNameContList = document.querySelectorAll('.capSlotNameCont');

    // Iterate through the list of elements
    capSlotNameContList.forEach(function (capSlotNameCont) {
        // Check if the element already exists inside the current capSlotNameCont
        let existingElement = capSlotNameCont.querySelector('.pauseButton');

        if (!existingElement) {
            // Create a new button element
            var newButton = document.createElement('div');
            newButton.classList.add('pauseButton');
            newButton.innerText = play; // Set the button text
            newButton.style.paddingLeft = "40px";
            newButton.style.fontSize = '100px';
            // Append the new button to the capSlotNameCont element
            capSlotNameCont.appendChild(newButton);
        }

    });
}


document.addEventListener('click', function (event) {
    if (event.target.classList.contains('pauseButton')) {
        var button = event.target;
        var capSlotNameCont = event.target.closest('.capSlotNameCont');
        var captainName = capSlotNameCont.querySelector('.capSlotName > div').innerText;
        if (button.innerText == pause) {
            //Play
            button.innerText = play;
            saveStateToStorage(captainName, false)
        } else {
            //Pause
            button.innerText = pause;
            saveStateToStorage(captainName, true)
        }
    }
});


var dataArray = [];

function saveStateToStorage(name, booleanValue) {
    // Check if an item with the same name already exists
    var existingItem = dataArray.find(item => item.name === name);

    if (existingItem) {
        // Update the booleanValue of the existing item
        existingItem.booleanValue = booleanValue;
    } else {
        // Add a new object to the array
        dataArray.push({ name: name, booleanValue: booleanValue });

        // Check if the array length exceeds 10
        if (dataArray.length > 10) {
            // Remove the oldest item (first item in the array)
            dataArray.shift();
        }
    }

    // Save updated array to local storage, but only if it has 10 or fewer items
    if (dataArray.length <= 10) {
        chrome.storage.local.set({ 'dataArray': dataArray }, function () {
            if (chrome.runtime.lastError) {
                loadBanner("Failed to update settings", "red")
            } else {
                loadBanner("Settings updated sucessfully", "green")
            }
        });
    }
}


// Function to retrieve data from local storage
function retrieveStateFromStorage(captainName) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get('dataArray', function (result) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                if (result.dataArray) {
                    dataArray = result.dataArray.slice(-10);
                    const matchingItem = dataArray.find(item => item.name === captainName);
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