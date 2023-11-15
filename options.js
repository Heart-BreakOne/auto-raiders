
//Declaring/Initializing variables
let chestName;
let url;
const tbd = "TDB"
const colorCodeMap = {
    "rgb(185, 242, 255)": "Blue",
    "rgb(255, 204, 203)": "Red",
    "rgb(203, 195, 227)": "Purple",
};
const battleChests = [
    { key: "undefined", name: "tbd", url: "/icons/tbd.png" },
    { key: "Unknown", name: "Unknown", url: "/icons/unknown.png" },
    { key: "abandoned", name: "abandoned", url: "/icons/block.png" },
    { key: "bones", name: "PvP", url: "https://d2k2g0zg1te1mr.cloudfront.net/env/prod1/mobile-lite/static/media/iconBones.56e87204.png" },
    { key: "keys", name: "Dungeons", url: "/icons/keys.png" },
    { key: "chestsalvage", name: "Defeat", url: "https://d2k2g0zg1te1mr.cloudfront.net/mobilelite/chests/iconChestSalvage.7f5d2511b08f.png" },
    { key: "chestbronze", name: "Bronze", url: "https://d2k2g0zg1te1mr.cloudfront.net/mobilelite/chests/iconChestBronze.7f5d2511b08f.png" },
    { key: "chestsilver", name: "Silver", url: "https://d2k2g0zg1te1mr.cloudfront.net/mobilelite/chests/iconChestSilver.7f5d2511b08f.png" },
    { key: "chestgold", name: "Gold", url: "https://d2k2g0zg1te1mr.cloudfront.net/mobilelite/chests/iconChestGold.7f5d2511b08f.png" },
    { key: "chestboostedgold", name: "Loyalty Gold", url: "https://d2k2g0zg1te1mr.cloudfront.net/mobilelite/chests/iconChestGoldBoosted.c0e0bcd2b145.png" },
    { key: "chestboostedskin_maps01to11", name: "Loyalty Skin", url: "https://d2k2g0zg1te1mr.cloudfront.net/mobilelite/chests/iconChestSkinBoosted.c0e0bcd2b145.png " },
    { key: "chestboostedscroll", name: "Loyalty Scroll", url: "https://d2k2g0zg1te1mr.cloudfront.net/mobilelite/chests/iconChestScrollBoosted.ff3678509435.png" },
    { key: "chestboostedtoken", name: "Loyalty Token", url: "https://d2k2g0zg1te1mr.cloudfront.net/mobilelite/chests/iconChestTokenBoosted.c0e0bcd2b145.png" },
    { key: "chestboss", name: "Loyalty Boss", url: "https://d2k2g0zg1te1mr.cloudfront.net/mobilelite/chests/iconChestBoss.7f5d2511b08f.png" },
    { key: "chestbosssuper", name: "Loyalty Super Boss", url: "https://d2k2g0zg1te1mr.cloudfront.net/mobilelite/chests/iconChestBossSuper.c0e0bcd2b145.png" },
];

//Event listener for when the page loads
document.addEventListener('DOMContentLoaded', async function () {

    //Load the battle log
    await loadLogData();

    //Listen for click events on the save whitelist button
    document.getElementById("whitelist_button").addEventListener("click", function () {
        setCaptainList('whitelist');
    });

    //Listen to click events on the save blacklist butotn
    document.getElementById("blacklist_button").addEventListener("click", function () {
        setCaptainList('blacklist');
    });

    //Export all settings to a file.
    document.getElementById("exportButton").addEventListener("click", function () {
        exportData();
    });

    //Import all settings to a file.
    document.getElementById('file-input').addEventListener('change', function () {
        importData();
        this.value = '';
    });


    await loadAndInjectList('whitelist');
    await loadAndInjectList('blacklist');

    // Add event listener for the wipe button
    document.getElementById('deleteLogButton').addEventListener('click', function () {
        //Load confirmation popup
        const userOption = window.confirm("Are you sure you want to delete all data?");

        if (userOption) {
            // Wipe logData from local storage
            chrome.storage.local.remove(['logData'], function () {
                dataContainer.innerHTML = '';
            });
        }
    });

    // Add event listener for the update button
    document.getElementById('updateLogButton').addEventListener('click', function () {
        // Update logData from local storage
        dataContainer.innerHTML = '';
        loadLogData();
    });

});



async function loadLogData() {

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
        headerRow.innerHTML = '<th>#</th><th>Slot</th><th>Captain Name</th><th>Mode</th><th>Color Code</th><th>Start time</th><th>Duration</th><th>Result</th><th>Chest</th>';

        //Append header row to the table
        tableElement.appendChild(headerRow);

        //Populate the table with array data
        let counter = 1;
        for (let i = 0; i < sortedData.length; i++) {
            const entry = sortedData[i];

            let chestName;
            let url;
            let elapsed;
            let res;

            //Convert the string to a Date object
            const startTime = new Date(entry.currentTime);
            const startHour = startTime.getHours();
            const startMinute = startTime.getMinutes();

            //Using padStart to ensure two digits for hours and minutes
            const startingTime = String(startHour).padStart(2, '0') + ":" + String(startMinute).padStart(2, '0');

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

            if (!(color === "Normal" || color === "Purple")) {
                res = "Possible color status.";
            }

            if (color !== "Normal" && color !== "Purple"
                && entry.chest !== "Unknown" && entry.chest !== "tbd" && entry.chest !== "abandoned"
                && (entry.result !== "Victory" || entry.result !== "Defeat" || entry.result !== "Abandoned")) {
                res = "Victory";
                color = "Normal";
            }
            if (color !== "Normal" && color !== "Purple"
                && entry.chest == "abandoned" && entry.result == "Abandoned") {
                res = "Abandoned";
                color = "Normal";
            }

            //Getting human-readable chest name and picture
            for (const battleChest of battleChests) {
                if (battleChest.key.includes(entry.chest)) {
                    chestName = battleChest.name;
                    url = battleChest.url;
                    break;
                }
            }

            // Create a table row
            const row = document.createElement('tr');
            row.id = `${i}`;
            row.innerHTML = `<td>${counter}</td>
                <td>${entry.logId}</td>
                <td>${entry.logCapName}</td>
                <td>${entry.logMode}</td>
                <td style="border: 1px solid #ddd; padding: 8px; color: ${color};">${color}</td>
                <td>${startingTime}</td>
                <td>${elapsed}</td>
                <td>${res}</td>
                <td style="text-align: center; vertical-align: middle;">
                    <div style="display: flex; flex-direction: column; align-items: center;">
                        ${chestName}
                        <img src="${url}" alt="Chest Image" style="height: 30px; width: auto">
                    </div>
                </td>
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
                }
            });
        });
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

//Set whitelist and blacklist on storage
function setCaptainList(list) {
    //Get the text from the user
    const userInput = document.getElementById(list).value;

    //Split text an array every space
    const listArray = userInput.split(' ');

    // Create an object with the dynamic list key
    const storageObject = {};
    storageObject[list] = listArray;

    // Save the array to Chrome's local storage
    chrome.storage.local.set(storageObject, function () {
        alert('List updated successfully!');
    });

}

// Function to load and inject the array into the textarea
async function loadAndInjectList(list) {
    // Retrieve the array from Chrome's local storage
    chrome.storage.local.get({ [list]: [] }, function (result) {
        // Handle the retrieved data
        const listArray = result[list];

        // Check if the array exists and is an array with at least one element
        if (Array.isArray(listArray) && listArray.length > 0) {
            const textareaId = list === 'whitelist' ? 'whitelist' : 'blacklist';

            // Inject the array entries into the textarea
            document.getElementById(textareaId).value = listArray.join(' ');
        }
    });
}

//Export data from chrome local storage into a file
async function exportData() {
    chrome.storage.local.get(null, function (items) {
        const allKeys = Object.keys(items);

        chrome.storage.local.get(allKeys, function (result) {

            const jsonData = JSON.stringify(result);

            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = 'sr_helper_backup.json';
            document.body.appendChild(a);
            a.click();

            //Cleanup
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    });
}

//Import data from a file to chrome loca storage.
async function importData() {
    const fileInput = document.getElementById('file-input');
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
                    loadAndInjectList('whitelist');
                    loadAndInjectList('blacklist');
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