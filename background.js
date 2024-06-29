//Listens for messages from the popup script containing the toggle switch states and send them to the content script.
'use strict';

//Spoof user agent to load mobile mode 
// Store the tab IDs that have already been processed
let processedTabs = new Set();
// Define the static user agent
const staticUserAgent = 'Mozilla/5.0 (Linux; Android 13; Pixel 7 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36';

// This function handles the logic to update session rules and reload the tab
async function updateUserAgent(tab) {
	// Check if the tab has already been processed
	if (processedTabs.has(tab.id)) return;

	processedTabs.add(tab.id);

	// Remove any existing rules for the tab
	// Add a new rule for the static user agent
	await chrome.declarativeNetRequest.updateSessionRules({
		removeRuleIds: [tab.id],
		addRules: [{
			'id': tab.id,
			'action': {
				'type': 'modifyHeaders',
				'requestHeaders': [{
					'header': 'user-agent',
					'operation': 'set',
					'value': staticUserAgent
				}]
			},
			'condition': {
				'tabIds': [tab.id],
				'resourceTypes': [
					'main_frame', 'sub_frame', 'stylesheet', 'script', 'image', 'font', 'object', 'xmlhttprequest', 'ping',
					'csp_report', 'media', 'websocket', 'webtransport', 'webbundle', 'other'
				]
			}
		}]
	});

	// Reload the tab
	chrome.tabs.reload(tab.id, {
		bypassCache: true
	});
}

// Run the logic when a tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (changeInfo.status === 'complete') {
		if (processedTabs.has(tabId)) return;
		processedTabs.add(tabId);
		updateUserAgent(tab);
	}
});

// Run the logic when a new tab is created
chrome.tabs.onCreated.addListener(tab => {
	if (tab.url && tab.url.startsWith("https://streamraiders.com/")) updateUserAgent(tab);
});


// Remove session rules when a tab is removed
chrome.tabs.onRemoved.addListener(tabId => {
	chrome.declarativeNetRequest.updateSessionRules({
		removeRuleIds: [tabId]
	});
	// Remove the tab from the processedTabs set
	processedTabs.delete(tabId);
});

// Map to keep track of connected ports
const connectedPorts = new Map();

// Listen for connections from content scripts
chrome.runtime.onConnect.addListener((port) => {
	// Store the port
	connectedPorts.set(port.sender.tab.id, port);

	// Listen for messages from content script
	port.onMessage.addListener(async (msg) => {

		//Force a reload if the game doesn't load with mobile mode
		if (msg.action === "reloadCleanCache") {
			const tab = await getTab();
			if (tab) updateUserAgent(tab);
		}
	});
});

// Set some default values when extension is installed
chrome.runtime.onInstalled.addListener(function (details) {
	if (details.reason === 'install') {
		chrome.storage.local.set({
			"commonSwitch": true,
			"campaignSwitch": true,
			"offlineSwitch": true,
			"loyalty": "0",
			"selectedOption": "0",
			"minCurrency": "0",
			"minKeyCurrency": "0",
			"minBoneCurrency": "0"
		});
	}
});

async function getTab() {
	processedTabs = new Set();
	return new Promise(resolve => {
		chrome.tabs.query({}, function (tabs) {
			for (let i = 0; i < tabs.length; i++) {
				const tab = tabs[i];
				if (tab.url && tab.url.startsWith("https://www.streamraiders.com")) {
					resolve(tab);
					return;
				}
			}
			resolve(null);
		});
	});
}