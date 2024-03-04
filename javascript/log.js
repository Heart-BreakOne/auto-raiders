//Receives a string key and retrieves the data from the chrome storage.
async function retrieveFromStorage(key) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([key], function (result) {
            resolve(result[key]);
        });
    });
}
//Declaring/Initializing variables
let chestName;
let isSuccess = [];
let url;
let startingTime;
let endingTime;
let elapsed;
const tbd = "TDB";
const colorCodeMap = {
    "rgb(185, 242, 255)": "Blue",
    "rgb(255, 204, 203)": "Red",
    "rgb(203, 195, 227)": "Purple",
};
const battleChests = [
    { key: "undefined", name: "tbd", outcome: "tbd", url: "/icons/tbd.png" },
    { key: "Unknown", name: "Unknown", outcome: "Unknown", url: "/icons/unknown.png" },
    { key: "abandoned", name: "abandoned", outcome: "Abandoned", url: "/icons/block.png" },
    { key: "bones", name: "PvP", outcome: "Victory", url: "https://d2k2g0zg1te1mr.cloudfront.net/env/prod1/mobile-lite/static/media/iconBones.56e87204.png" },
    { key: "bonechest", name: "PvP", outcome: "Victory", url: "https://d2k2g0zg1te1mr.cloudfront.net/env/prod1/mobile-lite/static/media/iconBones.56e87204.png" },
    { key: "keys", name: "Dungeons", outcome: "Victory", url: "/icons/keys.png" },
    { key: "dungeonchest", name: "Dungeons", outcome: "Victory", url: "/icons/keys.png" },
    { key: "chestsalvage", name: "Defeat", outcome: "Defeat", url: "https://d2k2g0zg1te1mr.cloudfront.net/mobilelite/chests/iconChestSalvage.7f5d2511b08f.png" },
    { key: "chestbronze", name: "Bronze", outcome: "Victory", url: "https://d2k2g0zg1te1mr.cloudfront.net/mobilelite/chests/iconChestBronze.7f5d2511b08f.png" },
    { key: "chestsilver", name: "Silver", outcome: "Victory", url: "https://d2k2g0zg1te1mr.cloudfront.net/mobilelite/chests/iconChestSilver.7f5d2511b08f.png" },
    { key: "chestgold", name: "Gold", outcome: "Victory", url: "https://d2k2g0zg1te1mr.cloudfront.net/mobilelite/chests/iconChestGold.7f5d2511b08f.png" },
    { key: "chestboostedgold", name: "Loyalty Gold", outcome: "Victory", url: "https://d2k2g0zg1te1mr.cloudfront.net/mobilelite/chests/iconChestGoldBoosted.c0e0bcd2b145.png" },
    { key: "chestboostedskin", name: "Loyalty Skin", outcome: "Victory", url: "https://d2k2g0zg1te1mr.cloudfront.net/mobilelite/chests/iconChestSkinBoosted.c0e0bcd2b145.png " },
    { key: "chestboostedskin_maps01to11", name: "Loyalty Skin", outcome: "Victory", url: "https://d2k2g0zg1te1mr.cloudfront.net/mobilelite/chests/iconChestSkinBoosted.c0e0bcd2b145.png " },
    { key: "chestboostedskin_maps23to33", name: "Loyalty Skin", outcome: "Victory", url: "https://d2k2g0zg1te1mr.cloudfront.net/mobilelite/chests/iconChestSkinBoosted.c0e0bcd2b145.png " },
    { key: "chestboostedskin_maps12to22", name: "Loyalty Skin", outcome: "Victory", url: "https://d2k2g0zg1te1mr.cloudfront.net/mobilelite/chests/iconChestSkinBoosted.c0e0bcd2b145.png " },
    { key: "chestboostedskinalternate", name: "Loyalty Skin", outcome: "Victory", url: "https://d2k2g0zg1te1mr.cloudfront.net/mobilelite/chests/iconChestSkinBoosted.c0e0bcd2b145.png " },
    { key: "chestboostedscroll", name: "Loyalty Scroll", outcome: "Victory", url: "https://d2k2g0zg1te1mr.cloudfront.net/mobilelite/chests/iconChestScrollBoosted.ff3678509435.png" },
    { key: "chestboostedtoken", name: "Loyalty Token", outcome: "Victory", url: "https://d2k2g0zg1te1mr.cloudfront.net/mobilelite/chests/iconChestTokenBoosted.c0e0bcd2b145.png" },
    { key: "chestbosssuper", name: "Loyalty Super Boss", outcome: "Victory", url: "https://d2k2g0zg1te1mr.cloudfront.net/mobilelite/chests/iconChestBossSuper.c0e0bcd2b145.png" },
    { key: "chestboss", name: "Loyalty Boss", outcome: "Victory", url: "https://d2k2g0zg1te1mr.cloudfront.net/mobilelite/chests/iconChestBoss.7f5d2511b08f.png" },
];

let chestCounter = [
    { key: "chestboostedgold", name: "Loyalty Gold", quantity: 0, max: 65 },
    { key: "chestboostedskin", name: "Loyalty Skin", quantity: 0, max: 130 },
    //{ key: "chestboostedskin_maps01to11", name: "Loyalty Skin", quantity: 0, max: 130 },
    //{ key: "chestboostedskin_maps12to22", name: "Loyalty Skin", quantity: 0, max: 130 },
    //{ key: "chestboostedskin_maps23to33", name: "Loyalty Skin", quantity: 0, max: 130 },
    //{ key: "chestboostedskinalternate", name: "Loyalty Skin", quantity: 0, max: 130 },
    { key: "chestboostedscroll", name: "Loyalty Scroll", quantity: 0, max: 65 },
    { key: "chestboostedtoken", name: "Loyalty Token", quantity: 0, max: 65 },
    { key: "chestbosssuper", name: "Loyalty Super Boss", quantity: 0, max: 30 },
    { key: "chestboss", name: "Loyalty Boss", quantity: 0, max: 190 },
];

//Event listener for when the page loads
document.addEventListener('DOMContentLoaded', async function () {

    const scrollToTopBtn = document.getElementById("scrollBtn");

    // Show or hide the button based on scroll position
    window.onscroll = function () {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            scrollToTopBtn.style.display = "block";
        } else {
            scrollToTopBtn.style.display = "none";
        }
    };

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
    const logSwitch = await retrieveFromStorage("logSwitch");

    //If table already exists, remove it so a new one can be injected
    const isTable = document.getElementById("logTable");
    if (isTable) {
        isTable.remove();
    }
    //Retrieve data from local storage
    chrome.storage.local.get(['logData'], function (result) {
        const arrayData = result.logData || [];

        //Sort the array based on the time they were added.
        const sortedData = arrayData.sort((a, b) => new Date(b.currentTime) - new Date(a.currentTime));

        //Get the data container div
        const dataContainer = document.getElementById('dataContainer');
        dataContainer.style.textAlign = "justify";

        //Create a table 
        const tableElement = document.createElement('table');
        tableElement.id = "logTable";

        //Create table header row
        const headerRow = document.createElement('tr');
        if (logSwitch) {
            headerRow.innerHTML = '<th>#</th><th>Slot</th><th>Captain Name</th><th>Mode</th><th>Color Code</th><th>Start time</th><th>End time</th><th>Duration</th><th>Result</th><th>Awarded Chest</th><th>Initial Chest</th><th>Rewards</th><th>Leaderboard Rank</th><th>Kills</th><th>Assists</th><th>Units Placed</th>';
        } else {
            headerRow.innerHTML = '<th>#</th><th>Slot</th><th>Captain Name</th><th>Mode</th><th>Color Code</th><th>Start time</th><th>End time</th><th>Duration</th><th>Result</th><th>Awarded Chest</th><th>Initial Chest</th>';
        }

        //Append header row to the table
        tableElement.appendChild(headerRow);

        //Populate the table with array data
        let counter = 1;
        for (let i = 0; i < sortedData.length; i++) {
            const entry = sortedData[i];

            let chestName;
            let url;
            let outcome;
            let initialChestName;
            let initialUrl;
            let leaderboardRank;
            let kills;
            let assists;
            let units;
            let unitsList;
            let rewards;
            let rewardsList;

            //Convert the string to a Date object and get hour and minutes.
            const startingTime = getTimeString(new Date(entry.currentTime));

            //Getting human-readable colors
            let color = colorCodeMap[entry.colorCode] || "Normal";

            //Make changes to some of the values to be display to make them user-friendly
            if (entry.elapsedTime === undefined) {
                elapsed = 'tbd';
                continue;
            } else {
                elapsed = entry.elapsedTime;
            }

            if (entry.result === undefined) {
                res = 'tbd';
                continue;
            } else {
                res = entry.result;
            }

            if (entry.currentTime === entry.elapsedTime) {
                elapsed = "Unknown";
            }

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

            if (entry.units2 === undefined) {
                units = "Unknown";
            } else {
                unitsList = entry.units2.split(",");
                units = "";
                let tempUnits;
                for (let i = 0; i < unitsList.length; i++) {
                    const unit = unitsList[i].split(" ");
                    if (unit[1] !== undefined) {
                        tempUnits = '<div class="crop"><img src="' + unit[0] + '" title="Skin: ' + unit[1]
                        if (unit[2] !== 'none') {
                            tempUnits += '&#013;Type: ' + unit[2];
                        }
                        if (unit[4] !== 'none') {
                            tempUnits += '&#013;Spec: ' + unit[4];
                        }
                        if (unit[3] !== 'none') {
                            tempUnits += '&#013;Soul: ' + unit[3];
                        }
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
                    if (reward[1] !== undefined) {
                        if (reward[1].includes("scroll")) {
                            rewards = '<div class="crop"><img src="' + reward[0] + '" title="' + reward[1] + '"></div>' + rewards;
                        } else {
                            rewards = '<img src="' + reward[0] + '" title="' + reward[1] + '" style="height: 30px; width: auto">' + rewards;
                        }
                    }
                }
            }

            //Getting human-readable chest name and picture
            for (const battleChest of battleChests) {
                if (entry.chest.startsWith(battleChest.key)) {
                    chestName = battleChest.name;
                    outcome = battleChest.outcome;
                    url = battleChest.url;

                    //Increment chest counter
                    for (const loyaltyChest of chestCounter) {
                        if ((loyaltyChest.key != "chestboss" && entry.chest.includes(loyaltyChest.key)) || loyaltyChest.key === "chestboss" && loyaltyChest.key.includes(entry.chest)) {
                            loyaltyChest.quantity += 1;
                            break;
                        }
                    }
                    break;
                }
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
                endingTime = ""
                if (elapsed !== "Unknown") {
                    tempTime = new Date(entry.currentTime);
                    tempTime.setMinutes(tempTime.getMinutes() + parseInt(elapsed));
                    endingTime = getTimeString(tempTime);
                } else {
                    endingTime = "Unknown";
                }
            } catch (error) {
                console.log("log", error);
                endingTime = "Unknown"
            }
            // Create a table row
            const row = document.createElement('tr');
            row.id = `${i}`;
            let initialchestHTML;
            if (entry.initialchest !== undefined) {
                initialchestHTML = `<td style="text-align: center; vertical-align: middle;">
                        <div style="display: flex; flex-direction: column; align-items: center;">
                            ${initialChestName}
                            <img src="${initialUrl}" alt="Initial Chest Image" style="height: 30px; width: auto">
                        </div>
                    </td>`
            } else {
                initialchestHTML = `<td style="text-align: center; vertical-align: middle;">
                        <div style="display: flex; flex-direction: column; align-items: center;">
                        </div>
                    </td>`
            }
            let logRewards;
            if (logSwitch) {
                logRewards = `<td>${rewards}</td>
                    <td>${leaderboardRank}</td>
                    <td>${kills}</td>
                    <td>${assists}</td>
                    <td>${units}</td>`
            } else {
                logRewards = ``
            }
            row.innerHTML = `<td>${counter}</td>
                <td>${entry.logId}</td>
                <td>${entry.logCapName}</td>
                <td>${entry.logMode}</td>
                <td style="border: 1px solid #ddd; padding: 8px; color: ${color};">${color}</td>
                <td>${startingTime}</td>
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
                    //Invoke function to delete the entry
                    removeEntry(index);
                    //Remove the row from the table
                    const row = document.getElementById(index);
                    row.remove();
                    loadLogData();
                }
            });
        });
        loadChestCounter();
    });
}

//Get entry from the stored array and remove the entry with the matching index.
function removeEntry(sortedIndex) {
    chrome.storage.local.get(["logData"], function (result) {
        let loggedData = result["logData"] || [];

        //Sort array based on time
        const sortedArray = loggedData.slice().sort((a, b) => new Date(b.currentTime) - new Date(a.currentTime));

        //Check if the index is valid
        if (sortedIndex >= 0 && sortedIndex < sortedArray.length) {
            //Find index entry from the sorted array on the original array
            const originalIndex = loggedData.findIndex(entry => entry === sortedArray[sortedIndex]);

            //Remove from the original array without sorting it
            if (originalIndex !== -1) {
                loggedData.splice(originalIndex, 1);

                //Save the updated array on storage
                chrome.storage.local.set({ ["logData"]: loggedData }, function () {
                });
            }
        }
    });
}

function loadChestCounter() {
    const counterContainer = document.querySelector('.counter-container');
    counterContainer.innerHTML = '';
    // Loop through the data and create HTML elements
    chestCounter.forEach(item => {
        if (item.quantity !== 0) {
            const div = document.createElement('div');
            div.innerHTML = `<p"><b>${item.name} Chest:</b> &nbsp;${item.quantity}.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>Remaining:</b> ${item.max - item.quantity} &nbsp;&nbsp;&nbsp;&nbsp;<b>Max</b> &nbsp;${item.max}</pn>`;
            counterContainer.appendChild(div);
            item.quantity = 0;
        }
    });
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
            const initialchestValue = null

            if (elapsedTimeIndex !== -1 && logCapNameIndex !== -1) {
                const updatedElement = {};
                Object.keys(element).forEach((key, index) => {
                    updatedElement[key] = element[key];
                    if (index === elapsedTimeIndex + 1) {
                        updatedElement['initialchest'] = initialchestValue;
                    }
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