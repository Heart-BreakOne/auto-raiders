
const statusArray = ["Waiting for Captain to find battle!", , "Waiting for Captain to start battle!", "Waiting for Captain to collect reward!"];
let offlineDelay = ms => new Promise(res => setTimeout(res, ms));

async function checkOfflineCaptains() {

    const battleView = document.querySelector(".battleView");
    if (!battleView) return;

    const capSlots = document.querySelectorAll('.capSlot');

    for (let index = 0; index < capSlots.length; index++) {
        const slot = capSlots[index];
        const battleStatus = slot.querySelector(".capSlotStatus").innerText;
        const captainName = slot.querySelector(".capSlotName").innerText;

        // Flag captain for check
        if (statusArray.includes(battleStatus)) {
            const isIdle = await getBattleStatus(captainName)
            //Captain is idle, switch and select a new one
            if (isIdle) {
                const close = slot.querySelector(".fal.fa-times-square");
                close.click();
                const modal = document.querySelector(".modalScrim.modalOn");
                if (modal) {
                    close = modal.querySelector(".actionButton.actionButtonPrimary");
                    close.click();
                }
                await offlineDelay(2000);
                const selectButton = slot.querySelector(".actionButton.actionButtonPrimary.capSlotButton.capSlotButtonAction");
                selectButton.click();
                switchOfflineCaptain()
                return;
            } else {
                setBattleStatus(captainName)
            }
        }
    }

}

async function setBattleStatus(captainName) {

    const currentTime = new Date().getTime();
    chrome.storage.local.get(['idleData'], function (result) {
        let idleData = result.idleData || [];
        // Find the captain with the same name
        const existingCaptainIndex = idleData.findIndex(item => item.captainName === captainName);
        if (existingCaptainIndex !== -1) {
            // Check if the time difference is more than 1:30 hours (5400000 milliseconds)
            const lastUpdateTime = idleData[existingCaptainIndex].currentTime;
            if (currentTime - new Date(lastUpdateTime).getTime() > 5400000) {
                // Update the currentTime
                idleData[existingCaptainIndex].currentTime = new Date(currentTime).toISOString();
                // Save updated data back to local storage
                chrome.storage.local.set({ idleData: idleData });
            }
        } else {
            // Captain not found, add new data
            idleData.push({ captainName, currentTime });

            if (idleData.length > 15) {
                idleData.shift();
            }
            // Save updated data back to local storage
            chrome.storage.local.set({ idleData: idleData });
        }
    });
}

async function getBattleStatus(captainName) {
    //Using the captain name check for how long it has been idle, if more than fifteen minutes return true, else return false
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['idleData'], function (result) {
            let idleData = result.idleData || [];
            const currentTime = new Date().getTime();

            const existingCaptain = idleData.find(item => item.captainName === captainName);

            if (existingCaptain) {
                const lastUpdateTime = new Date(existingCaptain.currentTime).getTime();
                const elapsedTime = currentTime - lastUpdateTime;

                if (elapsedTime >= 900000) { // 15 minutes in milliseconds = 900000
                    resolve(true);
                } else {
                    resolve(false);
                }
            } else {
                resolve(false);
            }
        });
    });
}


async function switchOfflineCaptain() {
    //Switch captains

    const allCaptainsTab = document.querySelector(".subNavItemText");
    allCaptainsTab.click();
    await offlineDelay(3000);
    let allCaptainsList = document.querySelectorAll(".searchResult");
    let captainsToRemove = [];

    //Remove all non-campaign and non-loyalty captains.
    allCaptainsList.forEach(captain => {
        const modeLabel = captain.querySelector('.versusLabelContainer');
        if (modeLabel.innerText !== 'Campaign') {
            captainsToRemove.push(captain);
        }

        const loyaltyImage = captain.querySelector('.searchResultLoyalty img');
        if (!loyaltyImage || loyaltyImage == null) {
            captainsToRemove.push(captain);
        }
    });
    if (allCaptainsList.length - captainsToRemove.length > 0) {
        captainsToRemove.forEach(captain => captain.remove());
    }
    
    captainsToRemove = [];

    // Remove bronze and silver captains.
    allCaptainsList = document.querySelectorAll(".searchResult");
    allCaptainsList.forEach(captain => {
        const loyaltyImage = captain.querySelector('.searchResultLoyalty img');
        if(loyaltyImage.src !== "https://d2k2g0zg1te1mr.cloudfront.net/env/prod1/mobile-lite/static/media/iconLoyaltyGold.4bd4f730.png") {
            captainsToRemove.push(captain);
        }
    });

    if (allCaptainsList.length - captainsToRemove.length > 0) {
        captainsToRemove.forEach(captain => captain.remove());
    }

    const captainButton = document.querySelector(".actionButton.actionButtonPrimary.searchResultButton");
    captainButton.click();

}