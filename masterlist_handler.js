//This file switches slots for masterlisted captains.

//Get slot state, captain name, check if it's master, check if it's in front of the masterlist.
//If not seek a replacement.

const findBattle = "Waiting for Captain to find battle!";
const readyToPlace = "Unit ready to place!";
const password = "ENTER_CODE";
let masterPort;

async function switchToMasterList() {
    masterPort = chrome.runtime.connect({ name: "content-script" });
    const allCaptains = document.querySelectorAll(".capSlot");
    const allCaptainNames = Array.from(allCaptains).map(capSlot => {
        const cpNm = capSlot.querySelector('.capSlotName');
        return cpNm ? cpNm.innerText.toUpperCase() : null;
    });

    for (let i = 0; i < allCaptains.length; i++) {

        const slot = allCaptains[i];

        if (slot.innerHTML.includes("DISABLED")) {
            continue;
        }
		
        /* Moving this task to the content script slot managing.
        const close = slot.querySelector(".capSlotClose");
		//Remove captains with LEAVE
		if (slot.innerHTML.includes("LEAVE BEFORE") && close) {
            close.click();
			await delay(1000);
			const closeConfirm = document.querySelectorAll(".actionButton");
			for (let i = 0; i <= 2; i++) {
				let closeConfirmItem = closeConfirm[i];
				if (closeConfirmItem.innerText == "CONFIRM") {
					closeConfirmItem.click();
				}
			}
			slot.querySelector(".offlineButton").innerText = "ENABLED";
            return false;
        }
        */
		//Remove captains with passwords
        if (slot.innerHTML.includes("ENTER_CODE")) {
            close.click();
            return false;
        }

        //Check master switching

        //Check if user wants master switching of some kind
        const forceMaster = await getSwitchState("liveMasterSwitch");
        const replaceMaster = await getSwitchState("priorityMasterSwitch");

        //User does not want to master switch
        if (!forceMaster && !replaceMaster) {
            continue;
        }
        //Captain is in a state that allows switching and user wants some kind of master switching
        if (close && (slot.innerHTML.includes(findBattle) || slot.innerHTML.includes(readyToPlace))) {

            //Get list of idlers so they aren't put back
            //Makes sure the idler list is not empty
            let idlers;
            if (idlers != undefined) {
                return false;
            }
            const storageData = await chrome.storage.local.get(['idleData']);
            idlers = storageData.idleData || [];
            if (idlers === undefined) {
                return false;
            }

            //Get the captain names that are currently idling
            const presentTime = Date.now();
            const fifteenMinutes = 15 * 60 * 1000;

            const idlersList = idlers
                .filter(entry => presentTime - entry.presentTime < fifteenMinutes)
                .map(entry => entry.captainName.toUpperCase());

            const capName = slot.querySelector(".capSlotName").innerText.toUpperCase();
            chrome.storage.local.get({ ['masterlist']: [] }, function (result) {
                // Handle the retrieved data
                let masterlist = result['masterlist'];

                //Check if the array exists and is an array with at least one element
                if (Array.isArray(masterlist) && masterlist.length > 0) {
                    //Remove idlers from the masterlist
                    masterlist = masterlist.map(item => item.toUpperCase());
                    masterlist = masterlist.filter(name => !idlersList.includes(name));

                    if (masterlist.includes(capName)) {
                        if (replaceMaster) {
                            //User wants to replace master captain with a higher priority captain
                            //Get all captains that have a higher priority than the current captain.
                            const capIndex = masterlist.indexOf(capName);
                            const stringsBeforeCap = capIndex !== -1 ? masterlist.slice(0, capIndex) : [];
                            const higherPriorityCaptains = stringsBeforeCap.filter(str => !allCaptainNames.includes(str));

                            if (higherPriorityCaptains.length === 0) {
                                //There are no captains with a higher priority than the current captain. Do nothing.
                                return false;
                            } else {
                                //There are captains with a higher priority than the current captain. Switch.
                                //Use the high priority list array to find an active captain that is within that list.

                                return new Promise((resolve, reject) => {
                                    const timeout = setTimeout(() => {
                                        reject(new Error('Timeout while waiting for response'));
                                        masterPort.onMessage.removeListener(responseListener);
                                        return false
                                    }, 8000);

                                    const responseListener = (response) => {
                                        clearTimeout(timeout);
                                        masterPort.onMessage.removeListener(responseListener);
                                        if (response !== undefined) {
                                            unitsArrayList = response.response;
                                            resolve(unitsArrayList);
                                            return true;
                                        } else {
                                            reject(new Error('Invalid response format from background script'));
                                            return false
                                        }
                                    };
                                    masterPort.onMessage.addListener(responseListener);
                                    masterPort.postMessage({ action: "switchCaptain", msg: capName, higherPriorityCaptains, i});
                                });
                            }

                        }

                    } else {
                        if (forceMaster) {
                            //Check if current captain is masterlisted
                            const capIndex = masterlist.indexOf(capName);
                            if (capIndex == -1) {

                                const higherPriorityCaptains = [...new Set(masterlist)];
                                allCaptainNames.forEach(captain => {
                                    const index = higherPriorityCaptains.indexOf(captain);
                                    if (index !== -1) {
                                        higherPriorityCaptains.splice(index, 1);
                                    }
                                });
                                if (higherPriorityCaptains.length === 0) {
                                    return false;
                                } else {
                                    return new Promise((resolve, reject) => {
                                        const timeout = setTimeout(() => {
                                            reject(new Error('Timeout while waiting for response'));
                                            masterPort.onMessage.removeListener(responseListener);
                                            return false;
                                        }, 8000);

                                        const responseListener = (response) => {
                                            clearTimeout(timeout);
                                            masterPort.onMessage.removeListener(responseListener);
                                            if (response !== undefined) {
                                                unitsArrayList = response.response;
                                                resolve(unitsArrayList);
                                                return true;
                                            } else {
                                                reject(new Error('Invalid response format from background script'));
                                                return false
                                            }
                                        };
                                        masterPort.onMessage.addListener(responseListener);
                                        masterPort.postMessage({ action: "switchCaptain", msg: capName, higherPriorityCaptains, i });
                                    });
                                }
                            }

                        }
                    }
                }
            });
        }
    }
    return false;
}