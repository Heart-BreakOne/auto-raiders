/*This file is the communication bridge between the popup script and the content scripts
as per manifest V3 standards they run on different contexts and environments.
*/

//Listens for messages from the popup script containing the toggle switch states and send them to the content script.
'use strict';

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type === "FROM_POPUP") {
    const tabId = request.tabId;
    chrome.tabs.sendMessage(tabId, {
      switchId: request.switchId,
      switchState: request.switchState,
      type: "FROM_BACKGROUND"
    });
  }
});

//Listens for messages from the popup script containing the radio button states and send them to the content script.
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type === "RADIO_FROM_POPUP") {
    const tabId = request.tabId;
    chrome.tabs.sendMessage(tabId, {
      selectedOption: request.selectedOption,
      type: "RADIO_FROM_BACKGROUND"
    });
  }
});


// background.js

'use strict';

const context = () => chrome.storage.local.get({
  'mode': 'android'
}, prefs => {
  chrome.contextMenus.create({
    title: 'Type: Android',
    id: 'android',
    type: 'radio',
    checked: prefs.mode === 'android',
    contexts: ['action']
  }, () => chrome.runtime.lastError);
  chrome.contextMenus.create({
    title: 'Type: iOS',
    id: 'ios',
    type: 'radio',
    checked: prefs.mode === 'ios',
    contexts: ['action']
  }, () => chrome.runtime.lastError);
  chrome.contextMenus.create({
    title: 'Type: Kindle',
    id: 'kindle',
    type: 'radio',
    checked: prefs.mode === 'kindle',
    contexts: ['action']
  }, () => chrome.runtime.lastError);
  chrome.contextMenus.create({
    title: 'Test my User-Agent',
    id: 'test-ua',
    contexts: ['action']
  }, () => chrome.runtime.lastError);
});
chrome.runtime.onStartup.addListener(context);
chrome.runtime.onInstalled.addListener(context);

chrome.contextMenus.onClicked.addListener(info => {
    chrome.storage.local.set({
      mode: info.menuItemId
    });
});

chrome.action.onClicked.addListener((tab) => {
  chrome.storage.local.get({
    'mode': 'android',
    'ua-android': 'Mozilla/5.0 (Linux; Android 13; Pixel 7 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36',
    'ua-ios': 'Mozilla/5.0 (iPhone14,3; U; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) Version/10.0 Mobile/19A346 Safari/602.1',
    'ua-kindle': 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_3; en-us; Silk/1.0.146.3-Gen4_12000410) AppleWebKit/533.16 (KHTML, like Gecko) Version/5.0 Safari/533.16 Silk-Accelerated=true',
    'bypass-cache': false
  }, async prefs => {
    const rules = await chrome.declarativeNetRequest.getSessionRules();
    if (rules.some(r => r.id === tab.id)) {
      await chrome.declarativeNetRequest.updateSessionRules({
        removeRuleIds: [tab.id]
      });
    }
    else {
      await chrome.declarativeNetRequest.updateSessionRules({
        removeRuleIds: [tab.id],
        addRules: [{
          'id': tab.id,
          'action': {
            'type': 'modifyHeaders',
            'requestHeaders': [{
              'header': 'user-agent',
              'operation': 'set',
              'value': prefs['ua-' + prefs.mode]
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
    }
    chrome.tabs.reload(tab.id, {
      bypassCache: prefs['bypass-cache']
    });
  });
});
// Store the tab IDs that have already been processed
const processedTabs = new Set();

// This function handles the logic to update session rules and reload the tab
async function updateUserAgent(tab) {
  // Check if the tab has already been processed
  if (processedTabs.has(tab.id)) {
    return;
  }

  processedTabs.add(tab.id);

  const prefs = await new Promise(resolve => {
    chrome.storage.local.get({
      'mode': 'android',
      'ua-android': 'Mozilla/5.0 (Linux; Android 13; Pixel 7 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36',
      'ua-ios': 'Mozilla/5.0 (iPhone14,3; U; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) Version/10.0 Mobile/19A346 Safari/602.1',
      'ua-kindle': 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_3; en-us; Silk/1.0.146.3-Gen4_12000410) AppleWebKit/533.16 (KHTML, like Gecko) Version/5.0 Safari/533.16 Silk-Accelerated=true',
      'bypass-cache': false
    }, resolve);
  });

  const rules = await chrome.declarativeNetRequest.getSessionRules();
  if (rules.some(r => r.id === tab.id)) {
    await chrome.declarativeNetRequest.updateSessionRules({
      removeRuleIds: [tab.id]
    });
  } else {
    await chrome.declarativeNetRequest.updateSessionRules({
      removeRuleIds: [tab.id],
      addRules: [{
        'id': tab.id,
        'action': {
          'type': 'modifyHeaders',
          'requestHeaders': [{
            'header': 'user-agent',
            'operation': 'set',
            'value': prefs['ua-' + prefs.mode]
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
  }
  chrome.tabs.reload(tab.id, {
    bypassCache: prefs['bypass-cache']
  });
}

// Run the logic when a tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    updateUserAgent(tab);
  }
});

// Run the logic when a new tab is created
chrome.tabs.onCreated.addListener(tab => {
  updateUserAgent(tab);
});

// Remove session rules when a tab is removed
chrome.tabs.onRemoved.addListener(tabId => {
  chrome.declarativeNetRequest.updateSessionRules({
    removeRuleIds: [tabId]
  });
  // Remove the tab from the processedTabs set
  processedTabs.delete(tabId);
});
