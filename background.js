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
    if (msg.action === "equipSkin") {
      let response = { success: false, result: null };

      try {
        await startEquipSkins(msg.data.captainNameFromDOM);
        response.success = true;
        response.result = "Equipped skin";
      } catch (error) {
        response.result = error.message;
      }
      port.postMessage({ action: "equipSkin", success: response.success, result: response.result });
    }

    if (msg.action === "getLoyalty") {
      // Handle the message, access payload with msg.payload
      // Do something with the payload
      //Might need async handling
      const response = await getCaptainLoyalty(msg.captainNameFromDOM);
      port.postMessage({ response });
    }

    if (msg.action === "reloadCleanCache") {
      processedTabs = new Set();
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs && tabs.length > 0) {
          const currentTab = tabs[0];
          updateUserAgent(currentTab);
        }
      });
    }

    if (msg.action === "getUnits") {
      // Handle the message, access payload with msg.payload
      // Do something with the payload
      //Might need async handling
      await getCookies();
      const response = await fetchUnits();
      port.postMessage({ response });
    }

    if (msg.action === "switchCaptain") {
      const currentCaptain = msg.msg;
      const higherPriorityCaptains = msg.higherPriorityCaptains;
      const index = msg.i
      await getCookies();
      const response = await switchCaptains(currentCaptain, higherPriorityCaptains, index);
      port.postMessage({ response });
    }
  });
});

//Declaring variables
let isRunning = false;
let cookieString;
let skinArrayData;
let unitArrayData;
let equipArrayData;
let backgroundDelay = ms => new Promise(res => setTimeout(res, ms));
let clientVersion;
let gameDataVersion;

//Initialize arrays with null values, get authentication cookies and make requests for the data of interest.
async function startEquipSkins(captainNameFromDOM) {

  if (isRunning) {
    return;
  }
  isRunning = true;
  skinArrayData = [];
  unitArrayData = [];
  equipArrayData = [];

  await getCookies();

  //Get list of all skins
  await getSkins(captainNameFromDOM);

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

//Get all skins
async function getSkins(captainName) {
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
      const skinId = position.productId.toUpperCase()
      if (skinId.includes(captainName.toUpperCase())) {
        skinArrayData.push(position.productId);
      }
    };

  } catch (error) {
    console.error('Error fetching skins:', error.message);
  }
}

//Get list of all units
async function getUnits() {
  //Post request to get all units

  const unitsArray = await fetchUnits();

  for (let i = 0; i < unitsArray.data.length; i++) {
    const position = unitsArray.data[i];
    unitArrayData.push({ unitId: position.unitId, unitType: position.unitType });
  };

}

//Now that all lists were obtained, it's time to sort the data
function manageArray() {

  //Shuffle arrays
  shuffleArray(skinArrayData);

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

    });
});

//Get every unit the user has
async function fetchUnits() {
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
    return unitsArray

  } catch (error) {
    console.error('Error fetching skins:', error.message);
  }
}


//Switch captains to a higher one if available
async function switchCaptains(currentCaptain, masterList, index) {
  let captainsArray = [];
  let currentId

  for (let i = 1; i < 6; i++) {
    try {
      const response = await fetch(`https://www.streamraiders.com/api/game/?cn=getCaptainsForSearch&isPlayingS=desc&isLiveS=desc&page=${i}&format=normalized&seed=4140&resultsPerPage=30&filters={%22favorite%22:false,%22isLive%22:1,%22ambassadors%22:%22false%22}&clientVersion=${clientVersion}&clientPlatform=MobileLite&gameDataVersion=${gameDataVersion}&command=getCaptainsForSearch&isCaptain=0`, {
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
      const captainsData = await response.json();

      for (let i = 0; i < captainsData.data.captains.length; i++) {
        const current = captainsData.data.captains[i];
        const name = current.twitchUserName.toUpperCase();
        const pvp = current.isPvp;
        const id = current.userId;

        if (currentCaptain === name) {
          currentId = id;
        }
        captainsArray.push({
          name, pvp, id
        });
      }
    } catch (error) {
      console.error('Error fetching captains:', error.message);
      return false;
    }
  }

  // Filter live captains so only masterlist remains
  captainsArray = captainsArray.filter(captain => {
    return captain.name !== currentCaptain && masterList.includes(captain.name) && !captain.pvp;
  });

  // Sort live captains based on their order on the masterlist
  captainsArray.sort((a, b) => {
    return masterList.indexOf(a.name) - masterList.indexOf(b.name);
  });

  // Extract the ids from the sorted captains
  const firstCaptainId = captainsArray.length > 0 ? captainsArray[0].id : null;

  if (currentId != undefined && firstCaptainId != undefined) {
    await removeCaptain(currentId, firstCaptainId, index);
    return true;
  }
  return false;
}

//Remove current captain
async function removeCaptain(currentId, firstCaptainId, index) {
  try {
    const response = await fetch(`https://www.streamraiders.com/api/game/?cn=leaveCaptain&captainId=${currentId}&clientVersion=${clientVersion}&clientPlatform=WebLite&gameDataVersion=${gameDataVersion}&command=leaveCaptain&isCaptain=0`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookieString,
      },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    await backgroundDelay(1500);
    await selectCaptain(firstCaptainId, index);
  } catch (error) {
    console.error('Error fetching skins:', error.message);
    return;
  }
}

//Select new captain
async function selectCaptain(firstCaptainId, index) {
  try {
    const response = await fetch(`https://www.streamraiders.com/api/game/?cn=addPlayerToRaid&captainId=${firstCaptainId}&userSortIndex=${index}&clientVersion=${clientVersion}&clientPlatform=WebLite&gameDataVersion=${gameDataVersion}&command=addPlayerToRaid&isCaptain=0`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookieString,
      },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return;
  } catch (error) {
    console.error('Error fetching skins:', error.message);
    return;
  }
}