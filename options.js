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
    });
});