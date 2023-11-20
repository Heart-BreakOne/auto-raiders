//Listens for messages from the popup script containing the toggle switch states and send them to the content script.
'use strict';

//Open log page on a new tab from the game tab
chrome.runtime.onMessage.addListener(function (request) {
  if (request.action === 'openNewTab') {
    const url = `chrome-extension://${chrome.runtime.id}/log.html`;
    chrome.tabs.create({ url: url });
  }
});

//Spoof user agent to load mobile mode 
// Store the tab IDs that have already been processed
const processedTabs = new Set();

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
    bypassCache: false
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

// Map to keep track of connected ports
const connectedPorts = new Map();

// Listen for connections from content scripts
chrome.runtime.onConnect.addListener((port) => {
  // Store the port
  connectedPorts.set(port.sender.tab.id, port);

  // Listen for messages from content script
  port.onMessage.addListener(async (msg) => {
    if (msg.action === "start") {
      startEquipSkins();
    }

    if (msg.action === "getLoyalty") {
      // Handle the message, access payload with msg.payload
      // Do something with the payload
      //Might need async handling
      const response = await getCaptainLoyalty(msg.captainNameFromDOM);
      port.postMessage({ response });
    }
  });

});

//Declaring variables
let isRunning = false;
let cookieString;
let captainArrayData;
let skinArrayData;
let unitArrayData;
let equipArrayData;

let clientVersion;
let gameDataVersion;

//Initialize arrays with null values, get authentication cookies and make requests for the data of interest.
async function startEquipSkins() {

  if (isRunning) {
    return;
  }
  isRunning = true;
  captainArrayData = [];
  skinArrayData = [];
  unitArrayData = [];
  equipArrayData = [];

  await getCookies();

  //Get current slot captains names
  await getActiveRaids();

  //Get list of all skins
  await getSkins();

  //Get list of all units
  await getUnits();

  //Manage and treat the lists
  manageArray();

  //Equip the skins
  await equipSkins();

  isRunning = false;
}

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

// Get current slot captains names
async function getActiveRaids() {
  //Post request to get the list of captain names
  try {
    const response = await fetch(`https://www.streamraiders.com/api/game/?cn=getActiveRaidsLite&clientVersion=${clientVersion}&clientPlatform=MobileLite&gameDataVersion=${gameDataVersion}&command=getActiveRaidsLite&isCaptain=0`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookieString,
      },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    //Get captain name from the json reponse
    const raidDataArray = await response.json();

    for (let i = 0; i < raidDataArray.data.length; i++) {
      const position = raidDataArray.data[i];
      captainArrayData.push(position.twitchUserName)
    };

  } catch (error) {
    console.error('Error fetching active raids:', error.message);
  }
}

//Get all skins
async function getSkins() {
  //Post request to get the list of skins
  try {
    const response = await fetch(`https://www.streamraiders.com/api/game/?cn=getUserItems&clientVersion=${clientVersion}&clientPlatform=MobileLite&gameDataVersion=${gameDataVersion}&command=getUserItems&isCaptain=0`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookieString,
      },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    //Get skin id from the json response
    const skinsArray = await response.json();

    for (let i = 0; i < skinsArray.data.length; i++) {
      const position = skinsArray.data[i];
      skinArrayData.push(position.productId)
    };

  } catch (error) {
    console.error('Error fetching skins:', error.message);
  }
}

//Get list of all units
async function getUnits() {
  //Post request to get all units
  try {
    const response = await fetch(`https://www.streamraiders.com/api/game/?cn=getUserUnits&clientVersion=${clientVersion}&clientPlatform=MobileLite&gameDataVersion=${gameDataVersion}&command=getUserUnits&isCaptain=0`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookieString,
      },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    // get unit id and name.
    const unitsArray = await response.json();

    for (let i = 0; i < unitsArray.data.length; i++) {
      const position = unitsArray.data[i];
      unitArrayData.push({ unitId: position.unitId, unitType: position.unitType });
    };

  } catch (error) {
    console.error('Error fetching skins:', error.message);
  }
}

//Now that all lists were obtained, it's time to sort the data
function manageArray() {

  //Shuffle captains
  shuffleArray(captainArrayData);
  shuffleArray(skinArrayData);
  shuffleArray(unitArrayData);

  //Remove skins that dont belong to any of the current captain slots
  skinArrayData = skinArrayData.filter(value => {
    return captainArrayData.some(substring => value.includes(substring));
  });

  //Remove substrings from the unitType that will invalidate future checks
  unitArrayData.forEach(unit => {
    //Remove word allies and flyingarcher
    if (unit.unitType.includes("allies")) {
      unit.unitType = unit.unitType.replace("allies", "").trim();
    }
    if (unit.unitType.includes("flyingarcher")) {
      unit.unitType = unit.unitType.replace("flyingarcher", "flying").trim();
    }
  });

  //Now it's time to get the skin and unit id from their respective arrays so the information can be used for the final post request.
  skinArrayData.forEach((skin) => {
    unitArrayData.forEach((unitData) => {
      const unitType = unitData.unitType;
      //Check for skin and unit matches
      if (skin.includes(unitType)) {
        const entryExists = equipArrayData.some((entry) => entry.skinUiD === skin && entry.unitId === unitData.unitId);

        //Check for duplicates
        if (!entryExists) {
          equipArrayData.push({ skinUiD: skin, unitId: unitData.unitId });
        }
      }
    });
  });
}

//Equip the skin
async function equipSkins() {
  //Iterate through each element of the equip array (unitId and skinId)
  for (let i = 0; i < equipArrayData.length; i++) {
    try {
      const { skinUiD, unitId } = equipArrayData[i];

      //Make the equip post request using the ids.
      const response = await fetch(`https://www.streamraiders.com/api/game/?cn=equipSkin&skinUid=${skinUiD}&unitId=${unitId}&isEquipped=1&clientVersion=${clientVersion}&clientPlatform=MobileLite&gameDataVersion=${gameDataVersion}&command=equipSkin&isCaptain=0`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': cookieString,
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
    } catch (error) {
      console.error('Error fetching skins:', error.message);
    }
  }
}

// Fisher-Yates shuffle for the captain array.
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

//TRUE IF LOYALTY IS LOW AND LOYALTY CHEST
// FALSE IF LOYALTY IS HIGH OR NON LOYALTY CHEST
async function getCaptainLoyalty(captainName) {
  try {
    await getCookies();

    // Post request to get all units
    const response = await fetch(`https://www.streamraiders.com/api/game/?cn=getActiveRaids&clientVersion=${clientVersion}&clientPlatform=MobileLite&gameDataVersion=${gameDataVersion}&command=getActiveRaidsLite&isCaptain=0`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookieString,
      },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    // Get unit id and name.
    const activeRaids = await response.json();

    for (let i = 0; i < activeRaids.data.length; i++) {
      const position = activeRaids.data[i];
      const raidId = position.raidId;
      const loyalty = position.pveLoyaltyLevel;
      const cptName = position.twitchDisplayName;

      if (cptName === captainName) {
        if (loyalty === 4) {
          return false;
        }

        const mapLoyalty = await getRaidChest(raidId);
        return mapLoyalty;
      }
    }

    //No match found
    return false;

  } catch (error) {
    console.error('Error in getCaptainLoyalty:', error);
    return false;
  }
}

// MAKE TWO POST REQUESTS, ONE FOR THE CURRENT CHEST AND ANOTHER TO COMPARE
async function getRaidChest(raidId) {
  try {
    const response = await fetch(`https://www.streamraiders.com/api/game/?cn=getRaid&raidId=${raidId}&placementStartIndex=0&maybeSendNotifs=false&clientVersion=${clientVersion}&clientPlatform=WebLite&gameDataVersion=${gameDataVersion}&command=getRaid&isCaptain=0`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookieString,
      },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const chestJson = await fetch(`https://heart-breakone.github.io/webpages/loyalty_chests.json`);

    if (!chestJson.ok) {
      throw new Error('Network response was not ok');
    }

    const currentRaid = await response.json();
    const chests = await chestJson.json();
    const nodeKeys = [];

    for (const key in chests.MapNodes) {
      if (chests.MapNodes.hasOwnProperty(key)) {
        nodeKeys.push(key);
      }
    }

    const nodeId = currentRaid.data.nodeId;
    if (nodeKeys.includes(nodeId)) {
      return true;
    }
    else {
      return false;
    }

  } catch (error) {
    console.error('Error in getRaidChest:', error);
    return false;
  }
}


async function fetchWithCors(url) {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Response(blob, { headers: { 'Access-Control-Allow-Origin': '*' } });
}

chrome.runtime.onInstalled.addListener(function () {
  // Use fetchWithCors to make the request with CORS headers
  fetchWithCors('https://heart-breakone.github.io/webpages/loyalty_chests.json')
    .then(response => response.json())
    .then(data => {
      console.log('Data with CORS headers:', data);
    })
    .catch(error => {
      console.error('Error with CORS headers:', error);
    });
});