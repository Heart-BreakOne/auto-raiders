//Event listener to initialize the radio buttons as well as update their states
document.addEventListener("DOMContentLoaded", function () {

    document.getElementById("instructions_button").addEventListener('click', function () {
        // Open the options page
        chrome.tabs.create({ url: "/html/how_to_play.html" });
    });

    //Event listener for a button to open the options page of the extension (log.html)
    document.getElementById("log_button").addEventListener('click', function () {
        // Open the options page
        const url = `chrome-extension://${chrome.runtime.id}/html/log.html`
        chrome.tabs.create({ url: url });
    });

    document.getElementById("whitelist_button").addEventListener('click', function () {
        // Open the options page
        const url = `chrome-extension://${chrome.runtime.id}/html/whitelist.html`
        chrome.tabs.create({ url: url });
    });
    document.getElementById("unit_button").addEventListener('click', function () {
        // Open the options page
        const url = `chrome-extension://${chrome.runtime.id}/html/units.html`
        chrome.tabs.create({ url: url });
    });
    document.getElementById('iframe_button').addEventListener('click', () => {
        const url = `chrome-extension://${chrome.runtime.id}/iframe.html`
        chrome.tabs.create({ url: url });
    });

    document.getElementById('map_updater').addEventListener('click', () => {
        const url = `https://heart-breakone.github.io/webpages/map_updater.html`
        chrome.tabs.create({ url: url });
    });


});