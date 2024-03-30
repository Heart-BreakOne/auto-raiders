const logDelay = ms => new Promise(res => setTimeout(res, ms));
let logRunning = false;

setInterval(addNewLogEntry, 30000);

//Observer for changes on the dom
async function addNewLogEntry() {

    if (await retrieveFromStorage("paused_checkbox")) {
        return
    }

    const logSlots = document.querySelectorAll(".capSlots");
    if (logSlots.length === 0) return;

    const logSlotsChildren = logSlots[0].querySelectorAll('.capSlot');

    for (let i = 0; i < logSlotsChildren.length; i++) {
        const logSlot = logSlotsChildren[i];
        const logId = i + 1;
        let logCapName, logMode, currentTime, colorCode;

        try {
            logCapName = logSlot.querySelector('.capSlotName').innerText;
            logMode = logSlot.querySelector('.versusLabelContainer')?.innerText || "Campaign";
            currentTime = logSlot.querySelector(".capSlotTimer") ? new Date().toString() : undefined;
            colorCode = window.getComputedStyle(logSlot).backgroundColor;
        } catch (error) {
            continue;
        }

        if (logCapName) {
            const requestLoyaltyResults = await getCaptainLoyalty(logCapName);
            const raidId = requestLoyaltyResults[0];
            const chestType = requestLoyaltyResults[1];
            const captainId = requestLoyaltyResults[2];
            let pvpOpponent;
            if (logMode == "Clash" || logMode == "Duel") {
              pvpOpponent = requestLoyaltyResults[4];
            } else {
              pvpOpponent = undefined;
            }
            const mapName = requestLoyaltyResults[5];
            let dungeonLevel;
            if (logMode == "Dungeons") {
              let dungeonInfo = await getUserDungeonInfoForRaid(logCapName);
              try {
                dungeonLevel = parseInt(dungeonInfo[8]) + 1;
              } catch (error) {}
            } else {
              dungeonLevel = undefined;
            }
            await setLogCaptain(logId, logCapName, logMode, currentTime, colorCode, raidId, mapName, chestType, captainId, dungeonLevel, pvpOpponent);
        }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    addNewLogEntry();
});

//Saves initial battle information to the local storage
async function setLogCaptain(logId, logCapName, logMode, currentTime, colorCode, raidId, mapName, chestType, captainId, dungeonLevel, pvpOpponent) {

    // default rgb(42, 96, 132) 
    //Check if color needs to be updated on storage.
    let updateColor = false;
    if (colorCode === "rgb(185, 242, 255)" || colorCode === "rgb(255, 204, 203" || colorCode === "rgb(203, 195, 227)") {
        updateColor = true;
    }
    while (logRunning == true) {
      await delay(10);
    }
    logRunning = true;
    return new Promise((resolve, reject) => {
        // Retrieve existing data from local storage
        chrome.storage.local.get(["logData"], function (result) {
            let loggedData = result["logData"] || [];
            //Check if an entry for the current captain battle exists
            const existingEntryIndex = loggedData.findIndex(entry => (entry.logCapName === logCapName && (entry.currentTime !== null && entry.currentTime !== undefined) && entry.elapsedTime === undefined && entry.chest === undefined && entry.raidId === raidId));

            //Pushes battle data into the storage
            if (existingEntryIndex === -1 && currentTime !== null && currentTime !== undefined) {
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
                    units2: undefined,
                    raidChest: undefined,
                    chestCount: undefined,
                    captainId: captainId,
                    dungeonLevel: dungeonLevel,
                    pvpOpponent: pvpOpponent
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

            //If there's more than 1000 entries, delete oldest.
            if (loggedData.length > 1000) {
                loggedData.shift();
            }

            // Update the loggedData object in storage
            chrome.storage.local.set({ ["logData"]: loggedData }, function () {
                resolve(loggedData);
            });
        });
        logRunning = false;
    });
}

//Saves initial chest information on storage
async function setLogInitialChest2(logCapName, raidId, initialchest2) {
    while (logRunning == true) {
      await delay(10);
    }
    logRunning = true;
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
        logRunning = false;
    });
}

//Saves units list on storage
async function setLogUnitsData(logCapName, raidId, unitsData) {
    while (logRunning == true) {
      await delay(10);
    }
    logRunning = true;
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
        logRunning = false;
    });
}

//Saves final battle information on storage
async function setLogResults(conclusion, logCapName, chest, leaderboardRank, kills, assists, units, rewards, raidId, raidChest, chestCount) {
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
    while (logRunning == true) {
      await delay(10);
    }
    logRunning = true;
    return new Promise((resolve, reject) => {
        // Retrieve existing data from local storage
        chrome.storage.local.get(["logData"], function (result) {
            let loggedData = result["logData"] || [];

            // Add final battle time, result, and chest type
            for (let i = loggedData.length - 1; i >= 0; i--) {
                let entry = loggedData[i];
                if (entry.logCapName === logCapName && entry.raidId === raidId &&
                    (entry.currentTime !== null && entry.currentTime !== undefined)) {
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
                    }
                    if (entry.raidChest == undefined && raidChest !== "" && raidChest !== undefined) {
                        entry.raidChest = raidChest;
                    }
                    if (entry.chestCount == undefined && chestCount !== "" && chestCount !== undefined) {
                        entry.chestCount = chestCount;
                    }
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
        logRunning = false;
    });
}
