document.addEventListener("DOMContentLoaded", function () {

	document.getElementById("instructions_button").addEventListener('click', function () {
		const url = `https://mobius-one.github.io/webpages/how_to_play.html`
		chrome.tabs.create({ url: url });
	});

	//Event listener for a button to open the options page of the extension (log.html)
	document.getElementById("log_button").addEventListener('click', function () {
		const url = `chrome-extension://${chrome.runtime.id}/html/log.html`
		chrome.tabs.create({ url: url });
	});

	document.getElementById("whitelist_button").addEventListener('click', function () {
		const url = `chrome-extension://${chrome.runtime.id}/html/whitelist.html`
		chrome.tabs.create({ url: url });
	});

	document.getElementById("unit_button").addEventListener('click', function () {
		const url = `chrome-extension://${chrome.runtime.id}/html/units.html`
		chrome.tabs.create({ url: url });
	});

	document.getElementById("level_button").addEventListener('click', function () {
		const url = `chrome-extension://${chrome.runtime.id}/html/levelup.html`
		chrome.tabs.create({ url: url });
	});

	document.getElementById("store_button").addEventListener('click', function () {
		const url = `chrome-extension://${chrome.runtime.id}/html/chests.html`
		chrome.tabs.create({ url: url });
	});

	document.getElementById('settings_button').addEventListener('click', () => {
		const url = `chrome-extension://${chrome.runtime.id}/settings.html`
		chrome.tabs.create({ url: url });
	});

	document.getElementById("key_check_button").addEventListener('click', function () {
		// Open the options page
		const url = `chrome-extension://${chrome.runtime.id}/html/check_keys.html`
		chrome.tabs.create({ url: url });
	});

});
