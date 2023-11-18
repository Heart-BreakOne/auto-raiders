//Event listener for when the page loads

let isSuccess = [];
document.addEventListener('DOMContentLoaded', async function () {

    isSuccess = [false, false];
    //Listen for click events on the save whitelist button
    document.getElementById("updateList_button").addEventListener("click", function () {
        setCaptainList('whitelist', 0);
        setCaptainList('blacklist', 1);
        if (isSuccess.every(Boolean)) {
            alert("Lists updated successfully!");
        }
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

});

//Set whitelist and blacklist on storage
function setCaptainList(list, position) {
    //Get the text from the user
    const userInput = document.getElementById(list).value;

    //Split text an array every space
    const listArray = userInput.split(' ');

    // Create an object with the dynamic list key
    const storageObject = {};
    storageObject[list] = listArray;

    // Save the array to Chrome's local storage
    chrome.storage.local.set(storageObject, function () {
        isSuccess[position] = true;
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
            let time = new Date();

            function addLeadZero(number) {
                return number < 10 ? '0' + number : number;
            }

            let formattedTime = `${addLeadZero(time.getHours())}${addLeadZero(time.getMinutes())}_${time.getFullYear()}_${addLeadZero(time.getMonth() + 1)}_${addLeadZero(time.getDate())}`;
            console.log(formattedTime)
            a.download = `sr_helper_backup_${formattedTime}.json`;
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