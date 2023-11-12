document.addEventListener('DOMContentLoaded', function () {
    // Retrieve data from local storage
    chrome.storage.local.get(['logData'], function (result) {
        const arrayData = result.logData || [];

        // Sort the array by timestamp (assuming currentTime is a timestamp)
        const sortedData = arrayData.sort((a, b) => new Date(b.currentTime) - new Date(a.currentTime));

        // Get the data container element
        const dataContainer = document.getElementById('dataContainer');

        // Populate the HTML with array data
        sortedData.forEach(entry => {
            const entryElement = document.createElement('div');
            entryElement.innerHTML = `Slot: ${entry.logId} - Captain Name: ${entry.logCapName} - Game Mode: ${entry.logMode} - Result: ${entry.result} - Time taken: ${entry.elapsedTime} minutes`;
            dataContainer.appendChild(entryElement);
        });

        // Add event listener for the wipe button
        document.getElementById('wipeButton').addEventListener('click', function () {
            // Wipe logData from local storage
            chrome.storage.local.remove(['logData'], function () {
                console.log('logData wiped from local storage');
                // Optionally, you can also clear the displayed data on the options page
                dataContainer.innerHTML = '';
            });
        });

    });
});