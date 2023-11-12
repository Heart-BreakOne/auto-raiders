const unknown = "Unknown";
const logObserver = new MutationObserver(async function (mutations) {

    const logSlots = document.querySelectorAll(".capSlots");
    if (logSlots.length == 0) {
        return;
    }
    const logSlotsChildren = logSlots[0].querySelectorAll('.capSlot');
    for (let i = 0; i < logSlotsChildren.length; i++) {
        const logSlot = logSlotsChildren[i];

        const logId = i;
        let logCapName;
        let logMode;
        let currentTime;
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
            console.log(logMode);
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

        await setLogCaptain(logId, logCapName, logMode, currentTime)
    }
});

const documentNode = document.body;
const logConf = { childList: true, subtree: true };
logObserver.observe(documentNode, logConf);

async function setLogCaptain(logId, logCapName, logMode, currentTime) {
    return new Promise((resolve, reject) => {
        // Retrieve existing data from local storage
        chrome.storage.local.get(["logData"], function (result) {
            let loggedData = result["logData"] || [];
            let presentTime = new Date().toString();
            //Check if captainName and currentTime exists
            const existingEntryIndex = loggedData.findIndex(entry => entry.logCapName === logCapName
                && (entry.currentTime != null || entry.currentTime != undefined) && entry.elapsedTime === "-1");

            if (existingEntryIndex === -1) {
                loggedData.push({
                    logId: logId,
                    logMode: logMode,
                    logCapName: logCapName,
                    currentTime: currentTime.toString(),
                    elapsedTime: "-1",
                    result: unknown,
                });
            } else {
                // Check the time difference between currentTime in the array and presentTime
                const timeDifference = Math.abs(new Date(presentTime) - new Date(loggedData[existingEntryIndex].currentTime));

                // If the time difference is greater than 1 hour, set elapsedTime to 0
                if (timeDifference > 3600000) {
                    loggedData[existingEntryIndex].elapsedTime = "0";
                }
            }

            if (loggedData.length > 100) {
                loggedData.shift();
            }

            // Update the loggedData object in storage
            chrome.storage.local.set({ ["logData"]: loggedData }, function () {
                resolve(loggedData);
            });
        });
    });
}



async function setLogResults(conclusion, logCapName) {
    let resolution;
    if (conclusion.includes("Defeat")) {
        resolution = "Defeat";
    } else if (conclusion.includes("Victory")){
        resolution = "Victory";
    } else if (conclusion.includes("Abandoned")){
        resolution = "Abandoned";
    } else {
        resolution = unknown;
    }
    let now = new Date();
    return new Promise((resolve, reject) => {
        // Retrieve existing data from local storage
        chrome.storage.local.get(["logData"], function (result) {
            let loggedData = result["logData"] || [];

            loggedData.forEach((entry) => {
                if (
                    entry.logCapName === logCapName &&
                    (entry.currentTime !== null && entry.currentTime !== undefined) &&
                    entry.elapsedTime === "-1"
                ) {
                    // Your original operation
                    entry.elapsedTime = Math.floor((now - new Date(entry.currentTime)) / (1000 * 60)).toString();
                    entry.result = resolution;
                }
            });

            // Update anything in the array that has a time older than 1 hour
            loggedData = loggedData.map((entry) => {
                const elapsedTime = Math.floor((now - new Date(entry.currentTime)) / (1000 * 60));
                if (elapsedTime > 60) {
                    entry.elapsedTime = elapsedTime.toString();
                    entry.result = unknown;
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