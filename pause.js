document.addEventListener("DOMContentLoaded", function () {

    var pausedCheckbox = document.getElementById("paused_checkbox");

    chrome.storage.local.get("paused_checkbox", function (result) {
        if (result.paused_checkbox === true) {
            pausedCheckbox.checked = true;
        } else {
            pausedCheckbox.checked = false;
        }
    });

    pausedCheckbox.addEventListener("change", function () {
        chrome.storage.local.set({ "paused_checkbox": pausedCheckbox.checked });
    });
})
