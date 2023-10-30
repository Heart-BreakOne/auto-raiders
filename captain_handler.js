
async function flagCaptain() {
    return new Promise((resolve, reject) => {
        // Retrieve existing data from local storage
        chrome.storage.local.get(['flaggedCaptains'], function (result) {
            let flaggedCaptains = result.flaggedCaptains || [];

            const captainButtons = document.querySelectorAll('.captainButton');

            captainButtons.forEach((button, index) => {
                let isActive;
                try {
                    isActive = button.querySelector('.captainButtonImg').classList.contains('captainButtonActive');
                } catch {
                    isActive = false;
                }

                if (isActive) {
                    const captainId = index + 1;
                    const captainName = button.querySelector('.captainButtonImg').getAttribute('alt');
                    const currentTime = new Date();

                    // Check if an entry with the same captainId exists
                    const indexToUpdate = flaggedCaptains.findIndex(entry => entry.captainId === captainId);

                    if (indexToUpdate !== -1) {
                        // Replace existing entry
                        flaggedCaptains[indexToUpdate] = {
                            captainId: captainId,
                            captainName: captainName,
                            currentTime: currentTime.toString()
                        };
                    } else {
                        // Add new entry
                        flaggedCaptains.push({
                            captainId: captainId,
                            captainName: captainName,
                            currentTime: currentTime
                        });
                    }
                }
            });

            // Save the updated data back to local storage
            chrome.storage.local.set({ flaggedCaptains }, function () {
                resolve(flaggedCaptains);
            });
        });
        /*
        chrome.storage.local.get(['flaggedCaptains'], function (result) {
            const flaggedCaptains = result.flaggedCaptains || [];
        });
        */
    });
}


async function getCaptainFlag(captainName) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['flaggedCaptains'], function (result) {
            const flaggedCaptains = result.flaggedCaptains || [];
            const foundCaptain = flaggedCaptains.find(captain => captain.captainName === captainName);

            if (foundCaptain) {
                const currentTime = new Date();
                const pastTime = new Date(foundCaptain.currentTime);
                const elapsedTimeInMinutes = (currentTime - pastTime) / (1000 * 60);

                if (elapsedTimeInMinutes >= 5) {
                    resolve(false);
                } else {
                    resolve(true); 
                }
            } else {
                resolve(false);
            }
        });
    });
}
