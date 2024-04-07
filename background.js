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
  if (processedTabs.has(tab.id)) {
    return;
  }

  processedTabs.add(tab.id);

  // Remove any existing rules for the tab
  await chrome.declarativeNetRequest.updateSessionRules({
    removeRuleIds: [tab.id]
  });

  // Add a new rule for the static user agent
  await chrome.declarativeNetRequest.updateSessionRules({
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
    if (processedTabs.has(tabId)) {
      return;
    }
    processedTabs.add(tabId);
    updateUserAgent(tab);
  }
});

// Run the logic when a new tab is created
chrome.tabs.onCreated.addListener(tab => {
  if (tab.url && tab.url.startsWith("https://streamraiders.com/")) {
    updateUserAgent(tab);
  }
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
      processedTabs = new Set();
      chrome.tabs.query({}, function (tabs) {
        for (let i = 0; i < tabs.length; i++) {
          const tab = tabs[i];
          if (tab.url && tab.url.startsWith("https://www.streamraiders.com")) {
            updateUserAgent(tab);
            break;
          }
        }
      });
    }
  });
});

//Declaring variables
let isRunning = false;
let cookieString;
let backgroundDelay = ms => new Promise(res => setTimeout(res, ms));
let clientVersion;
let gameDataVersion;

async function getCookies() {
  //Get client and game version for http request
  const response = await fetch('https://www.streamraiders.com/api/game/?cn=getUser&command=getUser');
  const data = await response.json();
  if (data && data.info && data.info.version && data.info.clientVersion) {
    clientVersion = data.info.version;
    gameDataVersion = data.info.dataVersion;
  }

  //Get cookies for http request
  chrome.cookies.getAll({ url: 'https://www.streamraiders.com/' }, function (cookies) {
    // Process the retrieved cookies
    if (cookies && cookies.length > 0) {
      cookieString = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
    } else {
      return;
    }
  });
}

/*
11       In Captain Planning Period
4        In Placement Period
7        Waiting for Captain to start Battle!
Cycle restarts.
The period between 7 and 11 is the time the captain idled or took to hand out rewards
The captain can spend a lot of time on state 1, not a useful marker in my opinion.
1        Waiting on Captain to find Battle
And state 10 can take several minutes while the captain hands out the rewards or mere seconds if the captain doesn't care. If the crawler is not running on this timeframe, it misses.
10        Waiting for Captain to collect reward! 
So effectively, the time between 11 and 7 is the battle time. The time between 7 and 11 is the downtime.
5        Battle ready soon (can't place)

*/

// Reloader for when the game data changes
async function checkGameData() {

  chrome.storage.local.get("paused_checkbox", ({ paused_checkbox }) => {
    if (paused_checkbox) {
        return
    }
});
  const response = await fetch('https://www.streamraiders.com/api/game/?cn=getUser&command=getUser');
  if (!response.ok) {
    console.log(`Failed to fetch getUser data (${response.status} ${response.statusText})`);
    return;
  }
  const data = await response.json();
  const clientVersion = data.info.version;
  const dataVersion = data.info.dataVersion;
  const userId = data.data.userId

  if (data.info.dataPath) {
    const dataPath = data.info.dataPath;
    chrome.storage.local.get("gameDataPath", async function (result) {
      const gameDataPath = result.gameDataPath;
      const setGameDataPath = () => chrome.storage.local.set({ "gameDataPath": dataPath }, () => console.log("New game data path set successfully."));
      if (!gameDataPath || gameDataPath !== dataPath) {
        await chrome.storage.local.set({ "userId": userId, "clientVersion": clientVersion, "dataVersion": dataVersion });
        await updateImageURLS()
        await getGameData(dataPath)
        setGameDataPath();
        chrome.tabs.query({}, tabs => {
          tabs.some(tab => {
            if (tab.url && tab.url.startsWith("https://www.streamraiders.com")) {
              chrome.tabs.reload(tab.id, { bypassCache: true });
              return true;
            }
          });
        });
      }
    });
  }
}

async function getGameData(gameDataPathUrl) {

  try {
    const response = await fetch(gameDataPathUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch game data (${response.status} ${response.statusText})`);
    }

    const data = await response.json();

    const currency_keys_rm = [
      "CapCaptain",
      "CapViewer",
      "CaptainType",
      "DisplayName",
      "EpicType",
      "NearCapCaptain",
      "NearCapViewer",
      "RegularType",
      "Type",
      "Uid"
    ]
    let currency = data.sheets.Currency;
    currency = removeKeys(currency, currency_keys_rm)

    const items_keys_rm = ["DisplayName", "IsInRandomPool", "Rarity", "Uid"]
    let items = data.sheets.Items;
    items = removeKeys(items, items_keys_rm)

    const units_keys_rm = ["AssetScaleOverride",
      "AttackRate",
      "AttackType",
      "BaseAction",
      "BaseActionSelfVfxUid",
      "CanBePlaced",
      "Damage",
      "DamageDelay",
      "Description",
      "DisplayName",
      "EffectiveCircleDataUid",
      "ExtraHitSize",
      "HP",
      "Heal",
      "IsCaptain",
      "IsEpic",
      "IsFlying",
      "Level",
      "OnDeathAction",
      "OnDeathActionSelfVfxUid",
      "OnDefeatAction",
      "OnKillAction",
      "PassThroughList",
      "PlacementType",
      "PlacementVFX",
      "Power",
      "ProjectileUid",
      "Range",
      "Rarity",
      "RemainsAsset",
      "Role",
      "ShowTeamIndicator",
      "Size",
      "SpecialAbilityActionUid",
      "SpecialAbilityDescription",
      "SpecialAbilityRate",
      "SpecialAbilitySelfVfxUid",
      "Speed",
      "StartBuffsList",
      "StrongAgainstTagsList",
      "TagsList",
      "TargetPriorityTagsList",
      "TargetTeam",
      "TargetingPriorityRange",
      "Triggers",
      "UnitTargetingType",
      "UnitType",
      "UpgradeCurrencyType",
      "WeakAgainstTagsList"]
    const units = data.sheets.Units;
    const unitsArray = Object.values(units);
    let filteredUnits = unitsArray.filter(unit => unit.PlacementType === "viewer");
    filteredUnits = removeKeys(filteredUnits, units_keys_rm)

    const skins_keys_rm = ["BaseUnitType",
      "CaptainUnitType",
      "DateAdded",
      "Description",
      "DisplayName",
      "EpicAssetOverride",
      "EpicUnitType",
      "Filter",
      "IsCharity",
      "IsGiftable",
      "IsLive",
      "Jira",
      "ProductId",
      "ProjectileOverrideUid",
      "Shared",
      "SortOrder",
      "StreamerId",
      "StreamerName",
      "Type",
      "Uid"]
    let skins = data.sheets.Skins;
    skins = removeKeys(skins, skins_keys_rm)

    const map_keys_rm = ["NodeDifficulty", "NodeType", "MapTags", "OnLoseDialog", "OnStartDialog", "OnWinDialog"]
    let mapNodes = data.sheets.MapNodes
    mapNodes = removeKeys(mapNodes, map_keys_rm)

    const transformedJson = {
      url: gameDataPathUrl,
      MapNodes: mapNodes
    };

    const events_keys_rm = ["BannerAsset", "Customizations", "Description", "MapNodeSpecialAsset", "PreviewLegendaryAsset1", "PreviewLegendaryAsset2", "PreviewLegendaryAsset3", "PreviewSkinAsset1", "PreviewSkinAsset2", "PreviewSkinAsset3", "PreviewSkinAsset4", "PreviewSkinAsset5", "PreviewSkinAsset6", "PreviewSkinAsset7", "PreviewSkinAsset7Epic", "TeaserTime", "WorldIndex"]
    let events = data.sheets.Events;
    events = removeKeys(events, events_keys_rm)

    const chests_keys_rm = ["BonusSlots", "BuyButtonMessageOverride", "CaptainSlots", "CharityChestEventUid", "CharityChestReward", "ClosedIcon", "GrandPrizeIcon", "IsBoosted", "IsCharity", "OpenCountMessageOverride", "OpenIcon", "RewardDescription", "RewardDescription2", "RewardOpenCountDescriptionOverride", "ShowOpenCount", "TrackOpenCount"]
    let chests = data.sheets.Chests;
    chests = removeKeys(chests, chests_keys_rm)

    const eventTiers_keys_rm = ["Badge", "BasicRewardImageOverride", "BattlePassRewardImageOverride", "Requirement"]
    let eventTiers = data.sheets.EventTiers;
    eventTiers = removeKeys(eventTiers, eventTiers_keys_rm)

    let eventUid = await getEventUid();

    for (const nodeKey in eventTiers) {
      const node = eventTiers[nodeKey];
      if (node.EventUid != eventUid) {
        delete eventTiers[nodeKey];
      }
    }

    const quests_keys_rm = ["AssetPathOverride", "AssetScaleOverride", "AutoCompleteCost", "CompletionCooldown", "CurrencyIdRequirement", "CurrencyMaxRequirement", "CurrencyMinRequirement", "QuestIds", "UnitAsset", "UnitLevelRequirement", "UnitTypeRequirement"]
    let quests = data.sheets.Quests;
    quests = removeKeys(quests, quests_keys_rm)

    await chrome.storage.local.set({ "loyaltyChests": transformedJson, "currency": currency, "items": items, "units": filteredUnits, "skins": skins, "events": events, "chests": chests, "eventTiers": eventTiers, "quests": quests });

    console.log("Game data successfully fetched and saved to chrome storage.");
  } catch (error) {
    console.error("Error fetching or saving game data:", error);
  }
}

async function getEventUid() {
  await getCookies();
  try {
    const response = await fetch(`https://www.streamraiders.com/api/game/?cn=getEventProgressionLite&clientVersion=${clientVersion}&clientPlatform=WebLite&gameDataVersion=${gameDataVersion}&command=getEventProgressionLite&isCaptain=0`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookieString,
      },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const eventInfo = await response.json();
    const eventUid = eventInfo.data.eventUid;
    return eventUid;

  } catch (error) {
    console.error('Error in getEventUid:', error);
    return "";
  }
}

async function updateImageURLS() {
  try {
    const response = await fetch("https://d2k2g0zg1te1mr.cloudfront.net/manifests/mobilelite.json");

    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    const data = await response.json();

    await chrome.storage.local.set({ imageUrls: data });

    console.log('Image URLs updated successfully.');
  } catch (error) {
    console.error('Error updating image URLs:', error);
  }
}


function removeKeys(items, keysToRemove) {
  for (const nodeKey in items) {
    const node = items[nodeKey];
    for (const keyToRemove of keysToRemove) {
      delete node[keyToRemove];
    }
  }
  return items
}

// Set some default values when extension is installed
chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === 'install') {
    chrome.storage.local.set({
      "commonSwitch": true,
      "campaignSwitch": true,
      "loyalty": "0",
      "selectedOption": "0",
      "minCurrency": "0",
      "minKeyCurrency": "0",
      "minBoneCurrency": "0"
    });
  }
});

//Triggers the checkGameData function every 10-15 seconds
(function loopCheckGameData() {
  setTimeout( () => {
    checkGameData();
    loopCheckGameData();  
  }, getRandNumBackground(10, 15) * 1000);
}());

function getRandNumBackground(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}