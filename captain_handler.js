async function flagCaptain(flag) {
    return new Promise((resolve, reject) => {
        // Retrieve existing data from local storage
        chrome.storage.local.get([flag], function (result) {
            let flaggedData = result[flag] || [];

            const captainButtons = document.querySelectorAll(".captainButton");

            captainButtons.forEach((button, index) => {
                let isActive;
                try {
                    isActive = button.querySelector(".captainButtonImg").classList.contains("captainButtonActive");
                } catch {
                    isActive = false;
                }

                if (isActive) {
                    const captainId = index + 1;
                    const captainName = button.querySelector(".captainButtonImg").getAttribute("alt");
                    const currentTime = new Date();

                    // Check if an entry with the same captainId exists
                    const indexToUpdate = flaggedData.findIndex((entry) => entry.captainId === captainId);

                    if (indexToUpdate !== -1) {
                        // Replace existing entry
                        flaggedData[indexToUpdate] = {
                            captainId: captainId,
                            captainName: captainName,
                            currentTime: currentTime.toISOString()
                        };
                    } else {
                        // Add new entry
                        flaggedData.push({
                            captainId: captainId,
                            captainName: captainName,
                            currentTime: currentTime.toISOString()
                        });
                    }
                }
            });

            // Save the updated data back to local storage
            chrome.storage.local.set({ [flag]: flaggedData }, function () {
                resolve(flaggedData);
            });
        });
    });
}

async function getCaptainFlag(captainName, flagKey) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([flagKey], function (result) {
            const flagData = result[flagKey] || [];
            const foundCaptain = flagData.find(captain => captain.captainName === captainName);

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