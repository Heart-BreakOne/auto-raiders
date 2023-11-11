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
        chrome.action.setIcon({
          tabId: tab.id,
          path: {
            '16': '/data/icons/active/16.png',
            '32': '/data/icons/active/32.png',
            '48': '/data/icons/active/48.png'
          }
        });
      }
      chrome.tabs.reload(tab.id, {
        bypassCache: prefs['bypass-cache']
      });
    });
  });
  
  chrome.declarativeNetRequest.setExtensionActionOptions({
    displayActionCountAsBadgeText: false
  });
  
  chrome.tabs.onRemoved.addListener(tabId => chrome.declarativeNetRequest.updateSessionRules({
    removeRuleIds: [tabId]
  }));
