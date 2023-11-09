//This file handles getting and setting the captain flag data from the storage.

/* When invoked this function receives a flag value (loyaltyCaptain and flaggedCaptains)
It then checks if any captains match the criteria to be flagged.
If they match, they are send to storage.
//This function is invoked while the battlefield is active.
*/
async function flagCaptain(flag) {
    return new Promise((resolve, reject) => {
        // Retrieve existing data from local storage
        chrome.storage.local.get([flag], function (result) {
            let flaggedData = result[flag] || [];

            //Get all captain buttons from the captain footer bar
            const captainButtons = document.querySelectorAll(".captainButton");

            //Checks if the existing captains are active
            captainButtons.forEach((button, index) => {
                let isActive;
                try {
                    isActive = button.querySelector(".captainButtonImg").classList.contains("captainButtonActive");
                } catch {
                    isActive = false;
                }

                //Runs if the captain is active
                if (isActive) {
                    //Declares a unique id for the slot, the name and the current time for precise flagging.

                    const captainId = index + 1;
                    const captainName = button.querySelector(".captainButtonImg").getAttribute("alt");
                    const currentTime = new Date();

                    // Check if an entry with the same captainId exists
                    const indexToUpdate = flaggedData.findIndex((entry) => entry.captainId === captainId);

                    //If indexToUpdate is not equal to -1 it means that the captain already exists on storage and needs to be updated
                    if (indexToUpdate !== -1) {
                        // Replace existing entry into a flaggedData object
                        flaggedData[indexToUpdate] = {
                            captainId: captainId,
                            captainName: captainName,
                            currentTime: currentTime.toISOString()
                        };
                    } else {
                        // If the captain doesn't exist, they are added into the flaggedData object
                        flaggedData.push({
                            captainId: captainId,
                            captainName: captainName,
                            currentTime: currentTime.toISOString()
                        });
                    }
                }
            });

            // The flaggedData object is updated in the storage or saved if it does not exist.
            chrome.storage.local.set({ [flag]: flaggedData }, function () {
                resolve(flaggedData);
            });
        });
    });
}

//When invoked this function receives the captain name and the flag key and returns true or false if they are still under flag.
async function getCaptainFlag(captainName, flagKey) {
    return new Promise((resolve, reject) => {
        //Gets the captain names and values from storage
        chrome.storage.local.get([flagKey], function (result) {
            const flagData = result[flagKey] || [];
            const foundCaptain = flagData.find(captain => captain.captainName === captainName);

            //If captain exists on storage it means they are flagged,
            //It then checks if 5 minutes have passed since they were flagged and returns false. Else returns true
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
                //If captain does not exist on storage it means they are not flagged.
                resolve(false);
            }
        });
    });
}