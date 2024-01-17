async function loadFromLocalStorage() {
    try {
        // Retrieve the value associated with the key "loyaltyChests"
        var loyaltyChestsData = await new Promise((resolve, reject) => {
            chrome.storage.local.get("loyaltyChests", function(result) {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(result.loyaltyChests);
                }
            });
        });

        // Update the content of the loyalty_chests_container
        var loyaltyChestsContainer = document.querySelector(".loyalty_chests_container");
        loyaltyChestsContainer.textContent = loyaltyChestsData ? JSON.stringify(loyaltyChestsData, null, 2) : "No data found";
    } catch (error) {
        console.error("Error loading data from Chrome local storage:", error);
    }
}

// Call the function when the page loads
window.onload = function () {
    loadFromLocalStorage();
};