//Declaring/Initializing variables
let isSuccess = [];
let elapsed;
const tbd = "TBD";
const colorCodeMap = {
    "rgb(185, 242, 255)": "Blue",
    "rgb(255, 204, 203)": "Red",
    "rgb(203, 195, 227)": "Purple",
};
const battleChests = [
    { key: "undefined", name: "tbd", outcome: "tbd", url: "/icons/tbd.png" },
    { key: "Unknown", name: "Unknown", outcome: "Unknown", url: "/icons/unknown.png" },
    { key: "abandoned", name: "abandoned", outcome: "Abandoned", url: "/icons/block.png" },
    { key: "bones", name: "PvP", outcome: "Victory", url: "/icons/iconBones.png" },
    { key: "bonechest", name: "PvP", outcome: "Victory", url: "/icons/iconBones.png" },
    { key: "keys", name: "Dungeons", outcome: "Victory", url: "/icons/keys.png" },
    { key: "dungeonchest", name: "Dungeons", outcome: "Victory", url: "/icons/keys.png" },
    { key: "rubies", name: "Rubies", outcome: "Victory", url: "/icons/rubies.png" },
    { key: "chestsalvage", name: "Defeat", outcome: "Defeat", url: "/icons/iconChestSalvage.png" },
    { key: "chestbronze", name: "Bronze", outcome: "Victory", url: "/icons/iconChestBronze.png" },
    { key: "chestsilver", name: "Silver", outcome: "Victory", url: "/icons/iconChestSilver.png" },
    { key: "chestgold", name: "Gold", outcome: "Victory", url: "/icons/iconChestGold.png" },
    { key: "chestboostedgold", name: "Loyalty Gold", outcome: "Victory", url: "/icons/iconChestGoldBoosted.png" },
    { key: "chestboostedskin", name: "Loyalty Skin", outcome: "Victory", url: "/icons/iconChestSkinBoosted.png" },
    { key: "chestboostedskin_maps01to11", name: "Loyalty Skin", outcome: "Victory", url: "/icons/iconChestSkinBoosted.png" },
    { key: "chestboostedskin_maps23to33", name: "Loyalty Skin", outcome: "Victory", url: "/icons/iconChestSkinBoosted.png" },
    { key: "chestboostedskin_maps12to22", name: "Loyalty Skin", outcome: "Victory", url: "/icons/iconChestSkinBoosted.png" },
    { key: "chestboostedskinalternate", name: "Loyalty Skin", outcome: "Victory", url: "/icons/iconChestSkinBoosted.png" },
    { key: "chestboostedscroll", name: "Loyalty Scroll", outcome: "Victory", url: "/icons/iconChestScrollBoosted.png" },
    { key: "chestboostedtoken", name: "Loyalty Token", outcome: "Victory", url: "/icons/iconChestTokenBoosted.png" },
    { key: "chestbosssuper", name: "Loyalty Super Boss", outcome: "Victory", url: "/icons/iconChestBossSuper.png" },
    { key: "chestboss", name: "Loyalty Boss", outcome: "Victory", url: "/icons/iconChestBoss.png" },
];

//quantity is the count of log records for the chest. count is the chestcount from getRaidStatsByUser
let chestCounter = [
    { key: "chestboostedgold", name: "Loyalty Gold", quantity: 0, max: 65, count: 0, url: "/icons/iconChestGoldBoosted.png" },
    { key: "chestboostedskin", name: "Loyalty Skin", quantity: 0, max: 130, count: 0, url: "/icons/iconChestSkinBoosted.png" },
    { key: "chestboostedscroll", name: "Loyalty Scroll", quantity: 0, max: 65, count: 0, url: "/icons/iconChestScrollBoosted.png" },
    { key: "chestboostedtoken", name: "Loyalty Token", quantity: 0, max: 65, count: 0, url: "/icons/iconChestTokenBoosted.png" },
    { key: "chestbosssuper", name: "Loyalty SB", quantity: 0, max: 30, count: 0, url: "/icons/iconChestBossSuper.png" },
    { key: "chestboss", name: "Loyalty Boss", quantity: 0, max: 190, count: 0, url: "/icons/iconChestBoss.png" },
];

//Event listener for when the page loads
document.addEventListener('DOMContentLoaded', async function () {

    initializeSwitch("captIdSwitch");
    initializeSwitch("raidIdSwitch");
    initializeSwitch("pendingSwitch");
    initializeSwitch("logSwitch");
    initializeSwitch("dungeonPVPSwitch");
    const scrollToTopBtn = document.getElementById("scrollBtn");

    // Show or hide the button based on scroll position
    window.onscroll = function () {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            scrollToTopBtn.style.display = "block";
        } else {
            scrollToTopBtn.style.display = "none";
        }
    };

    document.getElementById('captIdSwitch').addEventListener('change', function () {
        location.reload();
    });

    document.getElementById('raidIdSwitch').addEventListener('change', function () {
        location.reload();
    });

    document.getElementById('pendingSwitch').addEventListener('change', function () {
        location.reload();
    });

    document.getElementById('logSwitch').addEventListener('change', function () {
        location.reload();
    });

    document.getElementById('dungeonPVPSwitch').addEventListener('change', function () {
        location.reload();
    });

    // Scroll back to the top when the button is clicked
    scrollToTopBtn.addEventListener("click", function () {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    });

    isSuccess = [false, false];

    //Load the battle log
    await loadLogData();
    loadChestCounter();

    // Add event listener for the wipe button
    document.getElementById('deleteLogButton').addEventListener('click', function () {
        //Load confirmation popup
        const userOption = window.confirm("Are you sure you want to delete all data?");

        if (userOption) {
            // Wipe logData from local storage
            chrome.storage.local.remove(['logData'], function () {
                dataContainer.innerHTML = '';
                loadChestCounter();
            });
        }
    });

    // Add event listener for the update button
    document.getElementById("updateLogButton").addEventListener('click', function () {
        // Update logData from local storage
        dataContainer.innerHTML = '';
        loadLogData();
    });

    //Export all settings to a file.
    document.getElementById("exportLogButton").addEventListener("click", async function () {
        await exportData(["logData"]);
    });

    //Import all settings to a file.
    document.getElementById("log-file-input").addEventListener('change', function () {
        importData("log-file-input");
        this.value = '';
    });

});

async function loadLogData() {
    const dataArray = ['logSwitch', 'captIdSwitch', 'raidIdSwitch', 'pendingSwitch', 'dungeonPVPSwitch', 'items', 'currency', 'skins', 'imageUrls', 'getEventProgressionLite'];
    const dataKeys = await retrieveMultipleFromStorage(dataArray);
    const logSwitch = dataKeys.logSwitch;
    const captIdSwitch = dataKeys.captIdSwitch;
    const raidIdSwitch = dataKeys.raidIdSwitch;
    const pendingSwitch = dataKeys.pendingSwitch;
    const dungeonPVPSwitch = dataKeys.dungeonPVPSwitch;
    const items = dataKeys.items;
    const currency = dataKeys.currency;
    const skins = dataKeys.skins;
    const imageURLs = dataKeys.imageUrls;
    let filteredImageURLs = {};
    Object.keys(imageURLs).forEach(function (key) {
        if (key.startsWith("mobilelite/units/static/") || key.startsWith("mobilelite/events/")) {
            filteredImageURLs[key] = imageURLs[key];
            return;
        }
    });
    let eventUid = dataKeys.getEventProgressionLite;
    eventUid = eventUid.data.eventUid;

    
    //If table already exists, remove it so a new one can be injected
    const isTable = document.getElementById("logTable");
    if (isTable) isTable.remove();
    
    while (logRunning == true) await delay(10);
    logRunning = true;
    let arrayData = await chrome.storage.local.get(['logData']);
    arrayData = arrayData.logData;
    logRunning = false;
    
    //Sort the array based on the time they were added.
    const sortedData = arrayData.sort((a, b) => new Date(b.currentTime) - new Date(a.currentTime));

    //Get current event start time for chest count comparison
    const currentEventStartTime = await getCurrentEventStartTime();
    
    //Get the data container div
    const dataContainer = document.getElementById('dataContainer');
    dataContainer.style.textAlign = "justify";

    //Create a table 
    const tableElement = document.createElement('table');
    tableElement.id = "logTable";

    //Create table header row
    const headerRow = document.createElement('tr');
    if (captIdSwitch) {
        headerRow.innerHTML = '<th>#</th><th>Slot</th><th>Captain Name</th><th>Captain ID</th><th>Mode</th><th>Color Code</th><th>Start time</th><th>End time</th><th>Duration</th><th>Result</th><th>Awarded Chest</th><th>Initial Chest</th>';
    } else {
        headerRow.innerHTML ='<th>#</th><th>Slot</th><th>Captain Name</th><th>Mode</th><th>Color Code</th><th>Start time</th><th>End time</th><th>Duration</th><th>Result</th><th>Awarded Chest</th><th>Initial Chest</th>';
    }
    if (raidIdSwitch) headerRow.innerHTML += '<th>Raid ID</th>';
    if (dungeonPVPSwitch) headerRow.innerHTML += '<th>Dungeon Level</th><th style="max-width:70px !important; word-wrap:break-word;">Opponent</th>';
    if (logSwitch) headerRow.innerHTML += '<th>Rewards</th><th>Leaderboard Rank</th><th>Kills</th><th>Assists</th><th>Units Placed</th>';

    //Append header row to the table
    tableElement.appendChild(headerRow);

    //Populate the table with array data
    let counter = 1;
    for (let i = 0; i < sortedData.length; i++) {
        const entry = sortedData[i];

        let chestName, endingTime, url, outcome, initialChestName, initialUrl, leaderboardRank, kills, assists, units, unitsList, raidId, rewards, rewardsList, dungeonLevel, pvpOpponent;

        //Convert the string to a Date object and get hour and minutes.
        const startingTime = getTimeString(new Date(entry.currentTime));
        const startingDate = new Date(entry.currentTime).toDateString();

        //Getting human-readable colors
        let color = colorCodeMap[entry.colorCode] || "Normal";

        //Make changes to some of the values to be display to make them user-friendly
        if (entry.elapsedTime === undefined) {
            elapsed = 'tbd';
            if (!pendingSwitch) continue;
        } else {
            elapsed = entry.elapsedTime;
        }

        if (entry.result === undefined) {
            outcome = 'tbd';
            if (!pendingSwitch) continue;
        } else {
            outcome = entry.result;
        }

        if (entry.currentTime === entry.elapsedTime) elapsed = "Unknown";

        if (entry.leaderboardRank === undefined) {
            leaderboardRank = "Unknown";
        } else {
            leaderboardRank = entry.leaderboardRank;
        }

        if (entry.kills === undefined) {
            kills = "Unknown";
        } else {
            kills = entry.kills;
        }

        if (entry.assists === undefined) {
            assists = "Unknown";
        } else {
            assists = entry.assists;
        }

        if (entry.raidId === undefined) {
            raidId = "Unknown";
        } else {
            raidId = entry.raidId;
        }

        if (entry.logMode == "Dungeons") {
            if (entry.dungeonLevel === undefined) {
                dungeonLevel = "Unknown";
            } else {
                dungeonLevel = entry.dungeonLevel;
            }
        } else {
            dungeonLevel = "";
        }

        if (entry.logMode == "Clash" || entry.logMode == "Duel") {
            if (entry.pvpOpponent === undefined) {
                pvpOpponent = "Unknown";
            } else {
                pvpOpponent = entry.pvpOpponent;
            }
        } else {
            pvpOpponent = "";
        }
        
        if (entry.units2 === undefined) {
            units = "Unknown";
        } else {
            unitsList = entry.units2.split(",");
            units = "";
            let tempUnits;
            for (let i = 0; i < unitsList.length; i++) {
                const unit = unitsList[i].split(" ");
                if (unit[1] !== undefined) {
                    tempUnits = '<div class="crop"><img src="' + unit[0] + '" title="Skin: ' + unit[1];
                    if (unit[2] !== 'none') tempUnits += '&#013;Type: ' + unit[2];
                    if (unit[4] !== 'none') tempUnits += '&#013;Spec: ' + unit[4];
                    if (unit[3] !== 'none') tempUnits += '&#013;Soul: ' + unit[3];
                    units = tempUnits + '"></div>' + units;
                }
            }
        }

        if (entry.rewards === undefined) {
            rewards = "Unknown";
        } else {
            rewardsList = entry.rewards.split(",");
            rewards = "";
            for (let i = 0; i < rewardsList.length; i++) {
                const reward = rewardsList[i].split(" ");
                if (reward[1] !== undefined && reward[0] !== "undefined") {
                    if (reward[1].includes("scroll")) {
                        rewards = '<div class="crop"><img src="' + reward[0] + '" title="' + reward[1] + '"></div>' + rewards;
                    } else {
                        rewards = '<img src="' + reward[0] + '" title="' + reward[1] + '" style="height: 30px; width: auto">' + rewards;
                    }
                } else if (reward[0] == "undefined") {
                    let url = await getRewardUrl(reward[1], eventUid, items, currency, imageURLs, skins);
                    rewards = '<div class="crop"><img src="' + url + '" title="' + reward[1] + '"></div>' + rewards;
                }
            }
        }

        //Getting human-readable chest name and picture
        try {
            let entryStartDateTime = new Date(entry.currentTime);
            let entryEndDateTime = new Date(entryStartDateTime.getTime() + (entry.elapsedTime*60000));
            for (const battleChest of battleChests) {
              if (entry.chest == undefined){
                  chestName = tbd;
                  url = "/icons/tbd.png";
              } else if (entry.chest.startsWith(battleChest.key)) {
                  chestName = battleChest.name;
                  //outcome = battleChest.outcome;
                  url = battleChest.url;

                  //Get latest value for chest count
                  if (entry.raidChest !== undefined) {
                    try {
                      let chestCount = parseInt(entry.chestCount);
                      for (const loyaltyChest of chestCounter) {
                          if (entry.raidChest) {
                              if ((loyaltyChest.key != "chestboss" && entry.raidChest.includes(loyaltyChest.key)) || (loyaltyChest.key === "chestboss" && entry.raidChest === "chestboss")) {
                                  if (entryEndDateTime >= currentEventStartTime && chestCount > loyaltyChest.count) loyaltyChest.count = entry.chestCount;
                                  break;
                              }
                          }
                      }
                    } catch (error) {}
                  }
                    //Increment chest quantity
                    for (const loyaltyChest of chestCounter) {
                        if ((loyaltyChest.quantity == 0 || loyaltyChest.quantity < loyaltyChest.count) && ((loyaltyChest.key != "chestboss" && entry.chest.includes(loyaltyChest.key)) || (loyaltyChest.key === "chestboss" && entry.chest === "chestboss"))) {
                                loyaltyChest.quantity++;
                                break;
                            }
                        }
                        break;
                    }
                }
                if (entry.chest == "Unknown" && entry.units2 != undefined) {
                    // Increment chest quantity if units have been placed because even if the battle is abandoned, the chest still counts
                    for (const loyaltyChest of chestCounter) {
                        if (entryStartDateTime >= currentEventStartTime && (loyaltyChest.quantity == 0 || loyaltyChest.quantity < loyaltyChest.count) && ((loyaltyChest.key != "chestboss" && entry.initialchest.includes(loyaltyChest.key)) || (loyaltyChest.key === "chestboss" && entry.initialchest === "chestboss"))) {
                            loyaltyChest.quantity += 1;
                            break;
                        }
                    }
                }
            } catch(error) {
                console.log(entry);
                console.log(error);
            }

            //Getting human-readable initial chest name and picture
            if (entry.initialchest !== undefined) {
                for (const battleChest of battleChests) {
                    if (entry.initialchest.startsWith(battleChest.key)) {
                        initialChestName = battleChest.name;
                        initialUrl = battleChest.url;
                        break;
                    }
                }
            }

        if (color !== "Normal" && outcome === "Unknown") {
            outcome = "Possible color status";
        } else {
            color = "Normal";
        }

        //Get ending time
        try {
            endingTime = "";
            if (elapsed !== "Unknown") {
                let tempTime = new Date(entry.currentTime);
                tempTime.setMinutes(tempTime.getMinutes() + parseInt(elapsed));
                endingTime = getTimeString(tempTime);
                if (endingTime == "NaN:NaN") endingTime = tbd;
            } else {
                endingTime = "Unknown";
            }
        } catch (error) {
            console.log("log", error);
            endingTime = "Unknown";
        }
        // Create a table row
        const row = document.createElement('tr');
        row.id = `${i}`;
        row.setAttribute('title', raidId);
        let initialchestHTML;
        if (entry.initialchest !== undefined) {
            initialchestHTML = `<td style="text-align: center; vertical-align: middle;">
                    <div style="display: flex; flex-direction: column; align-items: center;">
                        ${initialChestName}
                        <img src="${initialUrl}" alt="Initial Chest Image" style="height: 30px; width: auto">
                    </div>
                </td>`;
        } else {
            initialchestHTML = `<td style="text-align: center; vertical-align: middle;">
                    <div style="display: flex; flex-direction: column; align-items: center;">
                    </div>
                </td>`;
        }
        let logCaptId;
        if (captIdSwitch) {
            logCaptId = `<td>${entry.captainId}</td>`;
        } else {
            logCaptId = ``;
        }
        let logRewards;
        if (logSwitch) {
            logRewards = `<td>${rewards}</td>
                <td>${leaderboardRank}</td>
                <td>${kills}</td>
                <td>${assists}</td>
                <td>${units}</td>`;
        } else {
            logRewards = ``;
        }
        let logRaidId;
        if (raidIdSwitch) {
            logRaidId = `<td>${raidId}</td>`;
        } else {
            logRaidId = ``;
        }
        let logDungeonPVP;
        if (dungeonPVPSwitch) {
            logDungeonPVP = `<td>${dungeonLevel}</td>
                <td style="max-width:70px !important; word-wrap:break-word;">${pvpOpponent}</td>`;
        } else {
            logDungeonPVP = ``;
        }
        row.innerHTML = `<td>${counter}</td>
            <td>${entry.logId}</td>
            <td title="${entry.captainId}">${entry.logCapName}</td>
            ` + logCaptId + `
            <td>${entry.logMode}</td>
            <td style="border: 1px solid #ddd; padding: 8px; color: ${color};">${color}</td>
            <td title="${startingDate}">${startingTime}</td>
            <td>${endingTime}</td>
            <td>${elapsed}</td>
            <td>${outcome}</td>
            <td style="text-align: center; vertical-align: middle;">
                <div style="display: flex; flex-direction: column; align-items: center;">
                    ${chestName}
                    <img src="${url}" alt="Chest Image" style="height: 30px; width: auto">
                </div>
            </td>
            ` + initialchestHTML + `
            ` + logRaidId + `
            ` + logDungeonPVP + `
            ` + logRewards + `
            <td style="text-align: center; vertical-align: middle;"><button id="btn_${i}">DEL</button></td>`;

        // Append the row to the table
        tableElement.appendChild(row);

        //Because of the continue, the index can get desynced. So a counter gives a more precise counting
        counter++;
    }

    // Append the table to the data container
    dataContainer.appendChild(tableElement);

    //Get all buttons from the individual rows
    const numberButtons = document.querySelectorAll('[id^="btn_"]');
    //Listen for click events on each butotn
    numberButtons.forEach(function (button) {
        button.addEventListener("click", function () {

            //Confirm what you all to do
            const userOption = window.confirm("Are you sure you want to delete the row?");
            if (userOption) {
                //Get id of the button which is the index number of the entry saved on storage
                const index = parseInt(button.id.replace("btn_", ""));
                const raidId = document.getElementById(index).title;
                //Invoke function to delete the entry
                removeEntry(raidId);
                //Remove the row from the table
                const row = document.getElementById(index);
                row.remove();
                loadLogData();
            }
        });
    });
}

async function getCurrentEventStartTime() {
    try {
        let events = await retrieveFromStorage("events");
        let currentDateTime = new Date();
        for (const event in events) {
            let eventDetails = events[event];
            startTime = Date.parse(eventDetails.StartTime);
            endTime = Date.parse(eventDetails.EndTime);
            if (startTime <= currentDateTime && endTime > currentDateTime) return startTime;
        }
    } catch (error) { }
}

//Get entry from the stored array and remove the entry with the matching index.
async function removeEntry(raidId) {
    while (logRunning == true) await delay(10);
    logRunning = true;
    await chrome.storage.local.get(["logData"], async function (result) {
        let loggedData = result.logData || [];

        let foundEntry;
        let i;
        //Find entry based on raidId
        for (i = loggedData.length - 1; i >= 0; i--) {
          if (loggedData[i].raidId == raidId) {
            foundEntry = loggedData[i];
            break;
          }
        }
        //Check if the index is valid
        if (i >= 0 && i < loggedData.length) {
            //Find index entry from the sorted array on the original array
            const originalIndex = loggedData.findIndex(entry => entry === foundEntry);

            //Remove from the original array without sorting it
            if (originalIndex !== -1) {
                loggedData.splice(originalIndex, 1);

                //Save the updated array on storage
                chrome.storage.local.set({ ["logData"]: loggedData }, function () {
                });
            }
        }
    });
    logRunning = false;
}

function loadChestCounter() {
    const counterContainer = document.querySelector('.counter-container');
    counterContainer.innerHTML = '';
    const table = document.createElement('table');
    table.setAttribute('style', 'width:20% !important; padding:0 !important;');
    const header = document.createElement('tr');
    header.innerHTML = `<td>Chest</td><td>Log Count</td><td>Game Count</td><td>Remaining</td><td>Max</td>`;
    table.appendChild(header);
    // Loop through the data and create HTML elements
    for (const item of chestCounter) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td><img src="${item.url}" title="${item.name}"  style="height: 30px; width: auto"></td><td>${item.quantity}</td><td>${item.count}</td><td>${item.max - item.count}</td><td>${item.max}</td>`;
        table.appendChild(tr);
        item.quantity = 0;
    }
    counterContainer.appendChild(table);
    const br = document.createElement('br');
    counterContainer.appendChild(br);
}

//Export data from chrome local storage into a file
async function exportData(arrayOfKeys) {
    chrome.storage.local.get(arrayOfKeys, async function (result) {

        //JSON
        const jsonData = JSON.stringify(result);
        const jsonBlob = new Blob([jsonData], { type: 'application/json' });
        const jsonUrl = URL.createObjectURL(jsonBlob);

        const jsonLink = document.createElement('a');
        jsonLink.href = jsonUrl;

        let time = new Date();
        let formattedTime = `${addLeadZero(time.getHours())}${addLeadZero(time.getMinutes())}_${time.getFullYear()}_${addLeadZero(time.getMonth() + 1)}_${addLeadZero(time.getDate())}`;

        jsonLink.download = `LOG_SRHelper_backup_${formattedTime}.json`;

        document.body.appendChild(jsonLink);
        jsonLink.click();

        document.body.removeChild(jsonLink);
        URL.revokeObjectURL(jsonUrl);

        //CSV
        const csvData = await convertJsonToCsv(result);
        const csvBlob = new Blob([csvData], { type: 'text/csv' });
        const csvUrl = URL.createObjectURL(csvBlob);

        const csvLink = document.createElement('a');
        csvLink.href = csvUrl;

        csvLink.download = `LOG_SRHelper_backup_.csv`;

        document.body.appendChild(csvLink);
        csvLink.click();

        document.body.removeChild(csvLink);
        URL.revokeObjectURL(csvUrl);
    });
}

//Import data from a file to chrome loca storage.
async function importData(string) {
    const fileInput = document.getElementById(string);
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const jsonContent = e.target.result;

            try {
                const parsedData = JSON.parse(jsonContent);

                chrome.storage.local.set(parsedData, function () {
                    alert('Data imported sucessfully!');
                    loadLogData();
                });
            } catch (error) {
                alert('An error occurred', error);
            }
        };
        reader.readAsText(file);
    } else {
        alert('Please select a file!');
    }
}


function getTimeString(startTime) {
    //Get hours and minutes
    const startHour = startTime.getHours();
    const startMinute = startTime.getMinutes();

    //Using padStart to ensure two digits for hours and minutes
    return String(startHour).padStart(2, '0') + ":" + String(startMinute).padStart(2, '0');
}

//Convert json to csv
async function convertJsonToCsv(jsonData) {
    const logData = jsonData.logData;
    //If the initial chest is missing for the first entry it will fail to properly generate the key headers. This ensure the key exists with a null value.
    logData.forEach(element => {
        if (!element.hasOwnProperty('initialchest')) {
            const elapsedTimeIndex = Object.keys(element).indexOf('elapsedTime');
            const logCapNameIndex = Object.keys(element).indexOf('logCapName');
            const initialchestValue = null;

            if (elapsedTimeIndex !== -1 && logCapNameIndex !== -1) {
                const updatedElement = {};
                Object.keys(element).forEach((key, index) => {
                    updatedElement[key] = element[key];
                    if (index === elapsedTimeIndex + 1) updatedElement.initialchest = initialchestValue;
                });
                logData[logData.indexOf(element)] = updatedElement;
            }
        }
    });
    const keys = Object.keys(logData[0]);
    const csvArray = [keys.map(key => `logData/${key}`).join(',')];

    logData.forEach(item => {
        const values = keys.map(key => JSON.stringify(item[key]));
        csvArray.push(values.join(','));
    });

    return csvArray.join('\n');
}

function addLeadZero(number) {
    return number < 10 ? '0' + number : number;
}