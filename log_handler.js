//Observer for changes on the dom
const logObserver = new MutationObserver(async function (mutations) {

    //Check if the captain slots exist
    const logSlots = document.querySelectorAll(".capSlots");
    if (logSlots.length == 0) {
        return;
    }
    //Get the captain slot from the nodelist
    const logSlotsChildren = logSlots[0].querySelectorAll('.capSlot');
    for (let i = 0; i < logSlotsChildren.length; i++) {

        //Extract data from the captain slot
        const logSlot = logSlotsChildren[i];
        const logId = i + 1;
        let logCapName;
        let logMode;
        let currentTime;
        let colorCode = window.getComputedStyle(logSlot).backgroundColor;


        // Trying to get captain name, mode an timer. If timer doesn't exist it means the captain is not in active placement
        try {
            logCapName = logSlot.querySelector('.capSlotName').innerText;
        } catch (error) {
            continue;
        }
        try {
            logMode = logSlot.querySelector('.versusLabelContainer').innerText;
            if (logMode === undefined) {
                logMode = "Campaign"
            }
        } catch (error) {
            logMode = "Campaign";
        }
        try {
            if (logSlot.querySelector(".capSlotTimer")) {
                currentTime = new Date().toString();
            } else {
                continue;
            }
        } catch (error) { }

        //Invoke setLogCaptain with the variables obtained above.
        await setLogCaptain(logId, logCapName, logMode, currentTime, colorCode)
    }
});

const documentNode = document.body;
const logConf = { childList: true, subtree: true };
logObserver.observe(documentNode, logConf);

//Saves initial battle information to the local storage
async function setLogCaptain(logId, logCapName, logMode, currentTime, colorCode) {

    // default rgb(42, 96, 132) 
    //Check if color needs to be updated on storage.
    let updateColor = false;
    if (colorCode === "rgb(185, 242, 255)" || colorCode === "rgb(255, 204, 203" || colorCode === "rgb(203, 195, 227)") {
        updateColor = true;
    }
    return new Promise((resolve, reject) => {
        // Retrieve existing data from local storage
        chrome.storage.local.get(["logData"], function (result) {
            let loggedData = result["logData"] || [];
            //Check if an entry for the current captain battle exists
            const existingEntryIndex = loggedData.findIndex(entry => entry.logCapName === logCapName
                && (entry.currentTime != null || entry.currentTime != undefined) && entry.elapsedTime === undefined && entry.chest === undefined);

            //Pushes battle data into the storage
            if (existingEntryIndex === -1) {
                loggedData.push({
                    logId: logId,
                    logMode: logMode,
                    logCapName: logCapName,
                    currentTime: currentTime.toString(),
                    elapsedTime: undefined,
                    result: undefined,
                    colorCode: colorCode,
                    chest: undefined,
                    initialchest: undefined,
                    mapName: undefined,
                    initialchest2: undefined,
                    rewards: undefined,
                    leaderboardRank: undefined,
                    kills: undefined,
                    assists: undefined,
                    units: undefined
                });
            } else {
                //If no battle data exists, check if the color needs to be updated on existing slots.
                if (updateColor && loggedData[existingEntryIndex].colorCode !== colorCode
                    && loggedData[existingEntryIndex].elapsedTime === undefined
                    && loggedData[existingEntryIndex].chest === undefined && loggedData[existingEntryIndex].result === undefined) {
                    loggedData[existingEntryIndex].colorCode = colorCode;
                    loggedData[existingEntryIndex].result = "Unknown";
                }
            }

            //If there's more than 500 entries, delete oldest.
            if (loggedData.length > 10000) {
                loggedData.shift();
            }

            // Update the loggedData object in storage
            chrome.storage.local.set({ ["logData"]: loggedData }, function () {
                resolve(loggedData);
            });
        });
    });
}

//Saves initial chest information on storage
async function setLogInitialChest(logCapName, initialchest) {

    return new Promise((resolve, reject) => {
        // Retrieve existing data from local storage
        chrome.storage.local.get(["logData"], async function (result) {
            let loggedData = result["logData"] || [];

            // Add final battle time, result, and chest type
            loggedData.forEach((entry) => {
                if (entry.logCapName === logCapName &&
                    (entry.currentTime !== null && entry.currentTime !== undefined) &&
                    entry.elapsedTime === undefined && entry.initialchest === undefined) {
                    entry.initialchest = initialchest;
                }
            });

            // Update the loggedData object in storage
            chrome.storage.local.set({ "logData": loggedData }, function () {
                resolve(loggedData);
            });
        });
    });
}

//Saves initial chest information on storage
async function setLogInitialChest2(logCapName, initialchest2) {

    return new Promise((resolve, reject) => {
        // Retrieve existing data from local storage
        chrome.storage.local.get(["logData"], async function (result) {
            let loggedData = result["logData"] || [];

            // Add final battle time, result, and chest type
            loggedData.forEach((entry) => {
                if (entry.logCapName === logCapName &&
                    (entry.currentTime !== null && entry.currentTime !== undefined) &&
                    entry.elapsedTime === undefined && entry.initialchest2 === undefined) {
                    entry.initialchest2 = initialchest2;
                }
            });

            // Update the loggedData object in storage
            chrome.storage.local.set({ "logData": loggedData }, function () {
                resolve(loggedData);
            });
        });
    });
}

//Saves map name on storage
async function setLogMapName(logCapName, mapName) {

    return new Promise((resolve, reject) => {
        // Retrieve existing data from local storage
        chrome.storage.local.get(["logData"], async function (result) {
            let loggedData = result["logData"] || [];

            // Add final battle time, result, and chest type
            loggedData.forEach((entry) => {
                if (entry.logCapName === logCapName &&
                    (entry.currentTime !== null && entry.currentTime !== undefined) &&
                    entry.elapsedTime === undefined && entry.mapName === undefined) {
                    entry.mapName = mapName;
                }
            });

            // Update the loggedData object in storage
            chrome.storage.local.set({ "logData": loggedData }, function () {
                resolve(loggedData);
            });
        });
    });
}

//Saves final battle information on storage
async function setLogResults(conclusion, logCapName, chest, leaderboardRank, kills, assists, units, rewards) {
    const unknown = "Unknown";
    let now = new Date();

    // Determines battle resolution
    let resolution;
    if (conclusion.includes("Defeat")) {
        resolution = "Defeat";
    } else if (conclusion.includes("Victory")) {
        resolution = "Victory";
    } else if (conclusion.includes("Abandoned")) {
        resolution = "Abandoned";
    } else {
        resolution = unknown;
    }

    return new Promise((resolve, reject) => {
        // Retrieve existing data from local storage
        chrome.storage.local.get(["logData"], async function (result) {
            let loggedData = result["logData"] || [];

            // Add final battle time, result, and chest type
			for (let i = loggedData.length - 1; i >= 0; i--) {
				let entry = loggedData[i];
                if (entry.logCapName === logCapName &&
                    (entry.currentTime !== null && entry.currentTime !== undefined) &&
                    entry.elapsedTime === undefined && entry.chest === undefined &&
					entry.leaderboardRank === undefined && entry.rewards === undefined) {
                    entry.elapsedTime = Math.floor((now - new Date(entry.currentTime)) / (1000 * 60)).toString();
                    entry.result = resolution;
                    entry.chest = chest;
                    entry.leaderboardRank = leaderboardRank;
                    entry.kills = kills;
                    entry.assists = assists;
                    entry.units = units;
                    entry.rewards = rewards;
					break;
                }
            };

            // If the entry on the array is older than 1 hour, update it for battle result closure
            loggedData = loggedData.map((entry) => {
                const elapsedTime = Math.floor((now - new Date(entry.currentTime)) / (1000 * 60));
                if (elapsedTime > 60 && entry.elapsedTime === undefined
                    && entry.chest === undefined) {
                    entry.elapsedTime = entry.currentTime.toString();
                    entry.result = unknown;
                    entry.chest = unknown;
                }
                return entry;
            });

            // Update the loggedData object in storage
            chrome.storage.local.set({ "logData": loggedData }, function () {
                resolve(loggedData);
            });
        });
    });
}