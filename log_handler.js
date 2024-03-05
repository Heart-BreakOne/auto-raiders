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
  
        let requestLoyaltyResults;
        let raidId;
        let chestType;
        let mapName;
        
        if (logCapName !== undefined) {
          requestLoyaltyResults = await getCaptainLoyalty(logCapName);
          raidId = requestLoyaltyResults[0];
          chestType = requestLoyaltyResults[1];
          mapName = await getMapName(logCapName);
        }
        
        //Invoke setLogCaptain with the variables obtained above.
        await setLogCaptain(logId, logCapName, logMode, currentTime, colorCode, raidId, mapName, chestType)
    }
});

const documentNode = document.body;
const logConf = { childList: true, subtree: true };
logObserver.observe(documentNode, logConf);

//Saves initial battle information to the local storage
async function setLogCaptain(logId, logCapName, logMode, currentTime, colorCode, raidId, mapName, chestType) {

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
                && (entry.currentTime != null || entry.currentTime != undefined) && entry.elapsedTime === undefined && entry.chest === undefined && entry.raidId === raidId);

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
                    initialchest: chestType,
                    mapName: mapName,
                    initialchest2: undefined,
                    rewards: undefined,
                    leaderboardRank: undefined,
                    kills: undefined,
                    assists: undefined,
                    units: undefined,
                    raidId: raidId,
                    units2: undefined
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
async function setLogInitialChest(logCapName, raidId, initialchest) {

    return new Promise((resolve, reject) => {
        // Retrieve existing data from local storage
        chrome.storage.local.get(["logData"], async function (result) {
            let loggedData = result["logData"] || [];

            // Add final battle time, result, and chest type
            for (let i = loggedData.length - 1; i >= 0; i--) {
              let entry = loggedData[i];
                if (entry.logCapName === logCapName &&
                    (entry.currentTime !== null && entry.currentTime !== undefined) &&
                    entry.elapsedTime === undefined && entry.initialchest === undefined && entry.raidId === undefined) {
                      entry.initialchest = initialchest;
                      entry.raidId = raidId;
                      break;
                }
            };

            // Update the loggedData object in storage
            chrome.storage.local.set({ "logData": loggedData }, function () {
                resolve(loggedData);
            });
        });
    });
}

//Saves initial chest information on storage
async function setLogInitialChest2(logCapName, raidId, initialchest2) {

    return new Promise((resolve, reject) => {
        // Retrieve existing data from local storage
        chrome.storage.local.get(["logData"], async function (result) {
            let loggedData = result["logData"] || [];

            // Add final battle time, result, and chest type
            for (let i = loggedData.length - 1; i >= 0; i--) {
              let entry = loggedData[i];
                if (entry.logCapName === logCapName &&
                  (entry.currentTime !== null && entry.currentTime !== undefined) &&
                  entry.elapsedTime === undefined && entry.initialchest2 === undefined && entry.raidId === raidId) {
                    entry.initialchest2 = initialchest2;
                    break;
                }
            };

            // Update the loggedData object in storage
            chrome.storage.local.set({ "logData": loggedData }, function () {
                resolve(loggedData);
            });
        });
    });
}

//Saves units list on storage
async function setLogUnitsData(logCapName, raidId, unitsData) {

    return new Promise((resolve, reject) => {
        // Retrieve existing data from local storage
        chrome.storage.local.get(["logData"], async function (result) {
            let loggedData = result["logData"] || [];

            // Add final battle time, result, and chest type
            for (let i = loggedData.length - 1; i >= 0; i--) {
              let entry = loggedData[i];
                if (entry.logCapName === logCapName && entry.raidId === raidId) {
                    entry.units2 = unitsData;
                    break;
                }
            };

            // Update the loggedData object in storage
            chrome.storage.local.set({ "logData": loggedData }, function () {
                resolve(loggedData);
            });
        });
    });
}

//Saves final battle information on storage
async function setLogResults(conclusion, logCapName, chest, leaderboardRank, kills, assists, units, rewards, raidId) {
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
                if (entry.logCapName === logCapName && entry.raidId === raidId &&
                  (entry.currentTime !== null && entry.currentTime !== undefined)) {
                    console.log("LOG-log entry found");
                    if (entry.elapsedTime === undefined) {
                      entry.elapsedTime = Math.floor((now - new Date(entry.currentTime)) / (1000 * 60)).toString();
                    }
                    if (entry.result == undefined && resolution !== "" && resolution !== undefined) {
                      entry.result = resolution;
                    }
                    if (entry.chest == undefined && chest !== "" && chest !== undefined) {
                      entry.chest = chest;
                    }
                    if (entry.leaderboardRank == undefined && leaderboardRank !== "" && leaderboardRank !== undefined) {
                      entry.leaderboardRank = leaderboardRank;
                    }
                    if (entry.kills == undefined && kills !== "" && kills !== undefined) {
                      entry.kills = kills;
                    }
                    if (entry.assists == undefined && assists !== "" && assists !== undefined) {
                      entry.assists = assists;
                    }
                    if (entry.units == undefined && units !== "" && units !== undefined) {
                      entry.units = units;
                    }
                    if (entry.rewards == undefined && rewards !== "" && rewards !== undefined) {
                      entry.rewards = rewards;
                      console.log("LOG-1"+rewards);
                    }
                    console.log("LOG-2"+entry.rewards);
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
            console.log("LOG-begin log update")
            // Update the loggedData object in storage
            chrome.storage.local.set({ "logData": loggedData }, function () {
                resolve(loggedData);
                console.log("LOG-log update successful");
            });
        });
    });
}
