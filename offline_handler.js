
const statusArray = ["Waiting for Captain to find battle!", , "Waiting for Captain to start battle!", "Waiting for Captain to collect reward!"];
const offlineDelay = ms => new Promise(res => setTimeout(res, ms));
let captainButton;
const goldLoyaltyString = "https://d2k2g0zg1te1mr.cloudfront.net/env/prod1/mobile-lite/static/media/iconLoyaltyGold.4bd4f730.png";
const silverLoyaltyString = "https://d2k2g0zg1te1mr.cloudfront.net/env/prod1/mobile-lite/static/media/iconLoyaltyBlue.d4328aba.png";
const bronzeLoyaltyString = "https://d2k2g0zg1te1mr.cloudfront.net/env/prod1/mobile-lite/static/media/iconLoyaltyWood.ad7f4cb5.png";

async function checkOfflineCaptains() {

    const battleView = document.querySelector(".battleView");
    if (!battleView) return;

    await updateRunningCaptains();

    const capSlots = document.querySelectorAll('.capSlot');

    for (let index = 0; index < capSlots.length; index++) {
        const slot = capSlots[index];
        const battleStatus = slot.querySelector(".capSlotStatus").innerText;
        const selectButton = slot.querySelector(".actionButton.actionButtonPrimary.capSlotButton.capSlotButtonAction");

        if (selectButton && selectButton.innerText == "SELECT") {
            selectButton.click();
            await scroll();
            switchOfflineCaptain()
            return;
        } else if (statusArray.includes(battleStatus)) {
            const captainName = slot.querySelector(".capSlotName").innerText;
            await setBattleStatus(captainName)
            const isIdle = await getBattleStatus(captainName)
            //Captain is idle, switch and select a new one
            if (isIdle) {
                let close = slot.querySelector(".fas.fa-square");
                close.click();
                const modal = document.querySelector(".modalScrim.modalOn");
                if (modal) {
                    await delay(2000);
                    close = modal.querySelector(".actionButton.actionButtonPrimary");
                    close.click();
                }
                await offlineDelay(2000);
                const selectButton = slot.querySelector(".actionButton.actionButtonPrimary.capSlotButton.capSlotButtonAction");
                selectButton.click();
                scroll();
                switchOfflineCaptain()
                return;
            }
        }
    }

}

async function updateRunningCaptains() {
    const capSlots = document.querySelectorAll('.capSlot');
    for (let index = 0; index < capSlots.length; index++) {
        const slot = capSlots[index];
        const status = slot.querySelector(".capSlotStatus");
        const capName = slot.querySelector(".capSlotName");
        if (status.innerText.includes("Unit ready") && capName) {
            const name = capName.innerText;
            chrome.storage.local.get(['idleData'], function (result) {
                let idleData = result.idleData || [];
                // Find the captain with the same name
                const existingCaptainIndex = idleData.findIndex(item => item.captainName === name);
                if (existingCaptainIndex !== -1) {
                    idleData.splice(existingCaptainIndex, 1);
                    chrome.storage.local.set({ idleData: idleData });
                }
            });
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
            // 1200000 = 20 minutes  - 3600000 = 60 minutes
            const lastUpdateTime = idleData[existingCaptainIndex].currentTime;
            if (currentTime - new Date(lastUpdateTime).getTime() > 3600000) {
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

                if (elapsedTime >= 900000) { // 900000 = 15 minutes
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

//Scroll to the bottom and load all captains
async function scroll() {
    let scroll = document.querySelector('.capSearchResults');
    let prevScrollHeight;

    do {
        prevScrollHeight = scroll.scrollHeight;
        scroll.scrollTop = prevScrollHeight;
        await offlineDelay(500);
    } while (scroll.scrollHeight > prevScrollHeight);
}

async function switchOfflineCaptain() {
    //Switch captains

    const allCaptainsTab = document.querySelector(".subNavItemText");
    allCaptainsTab.click();
    await offlineDelay(3000);
    let fullCaptainList = document.querySelectorAll(".searchResult");
    let goldLoyaltyList = createLoyaltyList(fullCaptainList, goldLoyaltyString);
    let silverLoyaltyList = createLoyaltyList(fullCaptainList, silverLoyaltyString);
    let bronzeLoyaltyList = createLoyaltyList(fullCaptainList, bronzeLoyaltyString);

    if (goldLoyaltyList.length != 0) {
        captainButton = goldLoyaltyList[0].querySelector(".actionButton.actionButtonPrimary.searchResultButton");
        captainButton.click();
    } else if (silverLoyaltyList.length != 0) {
        captainButton = silverLoyaltyList[0].querySelector(".actionButton.actionButtonPrimary.searchResultButton");
        captainButton.click();
    } else if (bronzeLoyaltyList.length != 0) {
        captainButton = bronzeLoyaltyList[0].querySelector(".actionButton.actionButtonPrimary.searchResultButton");
        captainButton.click();
    } else {
        //use whatever is available
        for (let i = 0; i < fullCaptainList.length; i++) {
            const captain = fullCaptainList[i];
            const modeLabel = captain.querySelector(".versusLabelContainer").innerText;
            let alreadyJoined = captain.querySelector(".searchResultJoinLabel");
            if (alreadyJoined == null) {
                alreadyJoined = "";
            }
            if (modeLabel === "Campaign" || alreadyJoined.innerText !== "Already joined captain") {
                if (await retrieveFromStorage("skipSwitch")) {
                    //Add logic for loyalty
                    //Check loyalty setting, if there's no loyalty, cancel and don't join.
                    var menus = document.querySelectorAll('.slideMenuTop');

                    menus.forEach(function (menu) {
                        var menuText = menu.querySelector('div:nth-child(1)');
                        if (menuText.innerText === 'Search Captain') {
                            var closeButton = menu.querySelector('.far.fa-times');
                            if (closeButton) {
                                closeButton.click();
                            }
                        }
                    });
                    break;
                } else {
                    captainButton = captain.querySelector(".actionButton.actionButtonPrimary.searchResultButton");
                    captainButton.click();
                    break;
                }

            }
        }
    }
}

function createLoyaltyList(fullCaptainList, loyaltyString) {
    return Array.from(fullCaptainList).filter(captain => {
        const imgElement = captain.querySelector('.searchResultLoyalty img');
        const versusLabelElement = captain.querySelector('.versusLabelContainer');
        const joinLabelElement = captain.querySelector('.searchResultJoinLabel');

        return imgElement && imgElement.src === loyaltyString &&
            versusLabelElement && versusLabelElement.textContent.trim() === 'Campaign' &&
            (!joinLabelElement || joinLabelElement.textContent.trim() !== 'Already joined Captain');
    });
}