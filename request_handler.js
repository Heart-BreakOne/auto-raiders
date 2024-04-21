//Declaring variables
let isRunning = false;
let requestRunning = false;
let activeRaidsArray = [];
let eventData = [];
let backgroundDelay = ms => new Promise(res => setTimeout(res, ms));

function getRandNum(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

async function logChestsAndUnitsInterval() {
  let intervalKeysArray = ['paused_checkbox', 'offlineSwitch'];
  let intervalKeys = await retrieveMultipleFromStorage(intervalKeysArray);
  let paused_checkbox = intervalKeys.paused_checkbox;
  let offlineSwitch = intervalKeys.offlineSwitch;

  if (paused_checkbox) {
    return
  }
  try {
    let activeRaids = activeRaidsArray;
    if (requestRunning || activeRaids == undefined || activeRaids == null || (activeRaids.length == 1 && activeRaids[0].twitchDisplayName == "")) {
      return;
    }
    requestRunning = true;
    await checkBattleMessages(activeRaids);
    await manageGameModes(activeRaids);
    await addNewLogEntry(activeRaids);
    //Checks if the user wants to replace idle captains and invoke the function to check and replace them.
    if (offlineSwitch) {
      await updateRunningCaptains(activeRaids);
    }
    requestRunning = false;
  } catch (error) {
    console.error('Error in logChestsAndUnitsInterval:', error);
    return;
  }
}

async function getCaptainLoyalty(captainName) {
  try {
    let response = activeRaidsArray;
    if (response == undefined) {
      return;
    }

    const activeRaids = response;
    let loyaltyResults = new Object();
    for (let i = 0; i < activeRaids.length; i++) {
      const position = activeRaids[i];
      if (position.twitchDisplayName === captainName) {
        loyaltyResults[0] = position.raidId;
        const mapLoyalty = await getRaidChest(position.nodeId);
        loyaltyResults[1] = mapLoyalty;
        loyaltyResults[2] = position.captainId;
        loyaltyResults[3] = position.twitchDisplayName;
        loyaltyResults[4] = position.opponentTwitchDisplayName;
        loyaltyResults[5] = position.nodeId;
        return loyaltyResults;
      }
    }
    //No match found
    return loyaltyResults;

  } catch (error) {
    console.error('Error in getCaptainLoyalty:', new Date().toLocaleTimeString(), error);
    return;
  }
}

async function getRaidChest(nodeId) {
  try {
    let chests = await retrieveFromStorage("loyaltyChests")
    chests = chests.MapNodes

    const chestType = chests[nodeId]?.ChestType;
    return chestType;

  } catch (error) {
    console.error('Error in getRaidChest:', new Date().toLocaleTimeString(), error);
    return "chestbronze";
  }
}

async function getLeaderboardUnitsData(getRaid) {
  if (await retrieveFromStorage("paused_checkbox")) {
    return
  }

  const dataArray = ['userId', 'units', 'skins', 'imageUrls'];
  const dataKeys = await retrieveMultipleFromStorage(dataArray);
  const userId = dataKeys.userId;
  const unitAssetNames = dataKeys.units;
  const skinNames = dataKeys.skins;
  const imageURLs = dataKeys.imageUrls;

  try {
    const currentRaid = getRaid.data;
    const raidId = currentRaid.raidId;
    const cptName = currentRaid.twitchDisplayName;
    const placements = currentRaid.placements;
    let CharacterType = "";
    let skin = "";
    let skinURL = "";
    let SoulType = "";
    let specializationUid = "";
    let unitIconList = "";

    if (placements) {
      for (let i = 0; i < placements.length; i++) {
        const placement = placements[i];
        if (placement.userId === userId) {
          if (placement.CharacterType === null || placement.CharacterType === "") {
            CharacterType = "none";
          } else {
            CharacterType = placement.CharacterType;
          }
          if (placement.skin === null || placement.skin === "") {
            Object.keys(unitAssetNames).forEach(function (key) {
              const uid = unitAssetNames[key].Uid
              if (uid === CharacterType) {
                skin = unitAssetNames[key].AssetName;
              }
            })
          } else {
            skin = placement.skin;
            Object.keys(skinNames).forEach(function (key) {
              if (key === placement.skin) {
                skin = skinNames[key].BaseAssetName;
              }
            })
          }
          if (placement.SoulType === null || placement.SoulType === "") {
            SoulType = "none";
          } else {
            SoulType = placement.SoulType;
          }
          if (placement.specializationUid === null || placement.specializationUid === "") {
            specializationUid = "none";
          } else {
            specializationUid = placement.specializationUid;
          }
          Object.keys(imageURLs).forEach(function (key) {
            if (key === "mobilelite/units/static/" + skin + ".png") {
              skinURL = "https://d2k2g0zg1te1mr.cloudfront.net/" + imageURLs[key];
            }
          });
          unitIconList = skinURL + " " + skin.replace("allies", "").replace("skinFull", "") + " " + CharacterType + " " + SoulType + " " + specializationUid + "," + unitIconList
        }
      }
    }

    if (unitIconList !== "") {
      await setLogUnitsData(cptName, raidId, unitIconList);
    }
    return "";
  } catch (error) {
    console.error('Error in getLeaderboardData:', "|", error.name, "|", new Date().toLocaleTimeString(), error);
    return "";
  }
}

async function getRaidStats(currentRaid) {
  try {
    try {
      if (currentRaid.errorMessage !== null) {
        console.log(currentRaid.errorMessage);
        return "";
      }
    } catch (error) {
      console.log(error);
    }
    const raidData = currentRaid.data;
    const stats = raidData.stats;
    let raidStats = new Object();
    let rewards = new Object();

    const userId = await retrieveFromStorage("userId")

    let eventUid = await retrieveFromStorage("getEventProgressionLite");
    eventUid = eventUid.data.eventUid;

    let items = await retrieveFromStorage("items")
    let currency = await retrieveFromStorage("currency")
    let imageURLs = await retrieveFromStorage("imageUrls")

    if (stats.length > 0) {
      if (raidData.battleResult === "True") {
        raidStats[0] = "Victory";
        raidStats[5] = raidData.chestAwarded;
      } else {
        raidStats[0] = "Defeat";
        raidStats[5] = "chestsalvage";
      }
      for (let i = 0; i < stats.length; i++) {
        const stat = stats[i];
        if (stat.userId === userId) {
          raidStats[1] = i.toString(); //leaderboard rank
          raidStats[8] = stat.charsUsed + "|" + stat.skins + "|" + stat.specializationUids;
        }
      }
    } else {
      if (raidData.battleResult === "False") {
        raidStats[0] = "Abandoned";
        raidStats[5] = "Unknown";
      } else {
        raidStats[0] = "Unknown";
        raidStats[5] = "Unknown";
      }
    }

    let i = 0;
    try {
      if (raidData.goldAwarded > 0) {
        rewards[i] = "https://d2k2g0zg1te1mr.cloudfront.net/env/prod1/mobile-lite/static/media/iconGold.6072909d.png";
        rewards[i] = rewards[i] + " goldpiecebagx" + raidData.goldAwarded;
        i++;
      }
    } catch (error) {
      console.log(error);
    }
    try {
      if (raidData.bonesAwarded > 0) {
        rewards[i] = "https://d2k2g0zg1te1mr.cloudfront.net/env/prod1/mobile-lite/static/media/iconBones.56e87204.png";
        rewards[i] = rewards[i] + " bonesx" + raidData.bonesAwarded;
        raidStats[5] = "bones";
        i++;
      }
    } catch (error) {
      console.log(error);
    }
    try {
      if (raidData.keysAwarded > 0) {
        rewards[i] = "https://d2k2g0zg1te1mr.cloudfront.net/env/prod1/mobile-lite/static/media/iconKeys.01121bde.png";
        rewards[i] = rewards[i] + " keysx" + raidData.keysAwarded;
        raidStats[5] = "keys";
        i++;
      }
    } catch (error) {
      console.log(error);
    }
    try {
      if (raidData.eventCurrencyAwarded > 0) {
        rewards[i] = "";

        Object.keys(imageURLs).forEach(function (key) {
          if (key === "mobilelite/events/" + eventUid + "/iconEventCurrency.png") {
            rewards[i] = "https://d2k2g0zg1te1mr.cloudfront.net/" + imageURLs[key];
          }
        })
        rewards[i] = rewards[i] + " eventcurrencyx" + raidData.eventCurrencyAwarded;
        i++;
      }
    } catch (error) {
      console.log(error);
    }
    try {
      if (raidData.treasureChestGold != "0") {
        rewards[i] = "https://d2k2g0zg1te1mr.cloudfront.net/env/prod1/mobile-lite/static/media/iconGold.6072909d.png";
        rewards[i] = rewards[i] + " treasurechestgoldx" + raidData.treasureChestGold;
        i++;
      }
    } catch (error) {
      console.log(error);
    }
    try {
      if (raidData.potionsAwarded != "0") {
        rewards[i] = "https://d2k2g0zg1te1mr.cloudfront.net/env/prod1/mobile-lite/static/media/iconPotion.2c8f0f08.png"
        rewards[i] = rewards[i] + " epicpotionx" + raidData.potionsAwarded;
        i++;
      }
    } catch (error) {
      console.log(error);
    }
    try {
      if (raidData.bonusItemReceived !== "" && raidData.bonusItemReceived !== null) {
        if (raidData.bonusItemReceived.includes("goldbag")) {
          rewards[i] = "https://d2k2g0zg1te1mr.cloudfront.net/env/prod1/mobile-lite/static/media/iconGold.6072909d.png";
        } else if (raidData.bonusItemReceived.includes("epicpotion")) {
          rewards[i] = "https://d2k2g0zg1te1mr.cloudfront.net/env/prod1/mobile-lite/static/media/iconPotion.2c8f0f08.png";
        } else if (raidData.bonusItemReceived.includes("cooldown")) {
          rewards[i] = "https://d2k2g0zg1te1mr.cloudfront.net/env/prod1/mobile-lite/static/media/iconMeat.5c167903.png";
        } else if (raidData.bonusItemReceived.includes("eventtoken")) {
          Object.keys(imageURLs).forEach(function (key) {
            if (key === "mobilelite/events/" + eventUid + "/iconEventToken.png") {
              rewards[i] = "https://d2k2g0zg1te1mr.cloudfront.net/" + imageURLs[key];
            }
          })
        } else if (raidData.bonusItemReceived.includes("skin")) {
          Object.keys(imageURLs).forEach(function (key) {
            if (key === "mobilelite/units/static/" + raidData.bonusItemReceived + ".png") {
              rewards[i] = "https://d2k2g0zg1te1mr.cloudfront.net/" + imageURLs[key];
            }
          });
        } else {
          rewards[i] = "";
          let item;
          let bonusItemReceived;
          if (raidData.bonusItemReceived.includes("|")) {
            bonusItemReceived = raidData.bonusItemReceived.split("|")[1];
          } else {
            bonusItemReceived = raidData.bonusItemReceived;
          }
          Object.keys(items).forEach(function (key) {
            if (key === bonusItemReceived) {
              item = items[key].CurrencyTypeAwarded;
            }
          })
          Object.keys(currency).forEach(function (key) {
            if (key === item) {
              item = currency[key].UnitAssetName;
            }
          })
          Object.keys(imageURLs).forEach(function (key) {
            if (key === "mobilelite/units/static/" + item + ".png") {
              rewards[i] = "https://d2k2g0zg1te1mr.cloudfront.net/" + imageURLs[key];
            }
          })
        }
        rewards[i] = rewards[i] + " " + raidData.bonusItemReceived;
        i++;
      }
    } catch (error) {
      console.log(error);
    }
    try {
      if (raidData.eventTokensReceived != "0") {
        rewards[i] = "";
        Object.keys(imageURLs).forEach(function (key) {
          if (key === "mobilelite/events/" + eventUid + "/iconEventToken.png") {
            rewards[i] = "https://d2k2g0zg1te1mr.cloudfront.net/" + imageURLs[key];
          }
        })
        rewards[i] = rewards[i] + " eventtokenx" + raidData.eventTokensReceived;
        i++;
      }
    } catch (error) {
      console.log(error);
    }
    try {
      if (raidData.viewerChestRewards !== undefined && raidData.viewerChestRewards !== null) {
        for (var k = 0; k < raidData.viewerChestRewards.length; k++) {
          if (raidData.viewerChestRewards[k].includes("goldbag")) {
            rewards[i] = "https://d2k2g0zg1te1mr.cloudfront.net/env/prod1/mobile-lite/static/media/iconGold.6072909d.png";
          } else if (raidData.viewerChestRewards[k].includes("epicpotion")) {
            rewards[i] = "https://d2k2g0zg1te1mr.cloudfront.net/env/prod1/mobile-lite/static/media/iconPotion.2c8f0f08.png";
          } else if (raidData.viewerChestRewards[k].includes("cooldown")) {
            rewards[i] = "https://d2k2g0zg1te1mr.cloudfront.net/env/prod1/mobile-lite/static/media/iconMeat.5c167903.png";
          } else if (raidData.viewerChestRewards[k].includes("eventtoken")) {
            Object.keys(imageURLs).forEach(function (key) {
              if (key === "mobilelite/events/" + eventUid + "/iconEventToken.png") {
                rewards[i] = "https://d2k2g0zg1te1mr.cloudfront.net/" + imageURLs[key];
              }
            })
          } else if (raidData.viewerChestRewards[k].includes("skin")) {
            Object.keys(imageURLs).forEach(function (key) {
              if (key === "mobilelite/units/static/" + raidData.viewerChestRewards[k] + ".png") {
                rewards[i] = "https://d2k2g0zg1te1mr.cloudfront.net/" + imageURLs[key];
              }
            });
          } else {
            rewards[i] = "";
            let item;
            let viewerChestRewardItem;
            if (raidData.viewerChestRewards[k].includes("|")) {
              viewerChestRewardItem = raidData.viewerChestRewards[k].split("|")[1];
            } else {
              viewerChestRewardItem = raidData.viewerChestRewards[k]
            }
            Object.keys(items).forEach(function (key) {
              if (key === viewerChestRewardItem) {
                item = items[key].CurrencyTypeAwarded;
              }
            })
            Object.keys(currency).forEach(function (key) {
              if (key === item) {
                item = currency[key].UnitAssetName;
              }
            })
            Object.keys(imageURLs).forEach(function (key) {
              if (key === "mobilelite/units/static/" + item + ".png") {
                rewards[i] = "https://d2k2g0zg1te1mr.cloudfront.net/" + imageURLs[key];
              }
            })
          }
          rewards[i] = rewards[i] + " " + raidData.viewerChestRewards[k];
          i++;
        }
      }
    } catch (error) {
      console.log(error);
    }

    raidStats[2] = "";
    for (let j = 0; j < Object.keys(rewards).length; j++) {
      raidStats[2] = rewards[j].toString() + "," + raidStats[2].toString();
    }
    if (raidStats[2] == "") {
      raidStats[2] = "None"
    }
    raidStats[3] = raidData.kills;
    raidStats[4] = raidData.assists;
    //raidStats[5] = raidData.chestAwarded; //this value is set earlier in this function
    raidStats[6] = raidData.raidChest;
    raidStats[7] = raidData.chestCount;

        let raidId = raidData.raidId;
        let cptId, captainName, userSortIndex, type;
        for (let i = 0; i < activeRaidsArray.length; i++) {
          if (activeRaidsArray[i].raidId == raidId) {
            cptId = activeRaidsArray[i].captainId;
            captainName = activeRaidsArray[i].twitchDisplayName;
            userSortIndex = activeRaidsArray[i].userSortIndex;
            type = activeRaidsArray[i].type;
            i = activeRaidsArray.length;
          }
        }
        let battleResult = raidStats[0];
        let leaderboardRank = raidStats[1];
        let kills = raidStats[3];
        let assists = raidStats[4];
        let unitIconList = raidStats[8];
        rewards = raidStats[2];
        let chestStringAlt = raidStats[5];
        let raidChest = raidStats[6];
        let chestCount = raidStats[7];

        console.log("LOG-before-logged data for "+captainName+raidId);
        if (captainName !== null && captainName !== undefined && raidId !== null && raidId !== undefined && ((battleResult !== null && battleResult !== undefined) || (chestStringAlt !== null && chestStringAlt !== undefined) || (leaderboardRank !== null && leaderboardRank !== undefined) || (kills !== null && kills !== undefined) || (assists !== null && assists !== undefined) || (unitIconList !== null && unitIconList !== undefined) || (rewards !== null && rewards !== undefined) || (raidChest !== null && raidChest !== undefined) || (chestCount !== null && chestCount !== undefined))) {
          await setLogResults(battleResult, captainName, chestStringAlt, leaderboardRank, kills, assists, unitIconList, rewards, raidId, raidChest, chestCount);
          console.log('await setLogResults("'+battleResult+'", "'+captainName+'", "'+chestStringAlt+'", "'+leaderboardRank+'", "'+kills+'", "'+assists+'", "'+unitIconList+'", "'+rewards+'", "'+raidId+'", "'+raidChest+'", '+chestCount+')');
        }
  } catch (error) {
    console.error('Error in getRaidStats:', new Date().toLocaleTimeString(), error);
    return "";
  }
}

async function getEventProgressionLite(data) {
  try {
    const eventInfo = data;
    eventData = [];
    eventData.push({
      "eventUid": eventInfo.data.eventUid,
      "hasBattlePass": eventInfo.data.hasBattlePass,
      "basicRewardsCollected": eventInfo.data.basicRewardsCollected,
      "battlePassRewardsCollected": eventInfo.data.battlePassRewardsCollected,
      "currentTier": eventInfo.data.currentTier
    });
  } catch (error) {
    console.error('Error in getEventProgressionLite:', new Date().toLocaleTimeString(), error);
    return "";
  }
}

//Initialize arrays with null values, get authentication cookies and make requests for the data of interest.
async function checkBattleMessages(activeRaids) {
  if (isRunning) {
    return;
  }
  isRunning = true;

  //Logic to check battle for messages here
  try {
    //Get relevant data from activeRaids and save on storage so it can be displayed to the user
    let battleMessageData = [];
    for (let i = 0; i < activeRaids.length; i++) {
      const position = activeRaids[i];
      const cptName = position.twitchDisplayName;
      const message = position.message;
      battleMessageData.push({ cptName, message })
    }
    //Save battleMessageData on storage
    await chrome.storage.local.set({ battleMessageData: battleMessageData });
    isRunning = false;
  } catch (error) {
    console.error('Error while getting battle messages', new Date().toLocaleTimeString(), error);
    isRunning = false
  }
  isRunning = false;
}

/*
raidState values

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

async function joinCaptainToAvailableSlot(captainName) {
  try {
    let cookieString = document.cookie;
    const response = await fetch(`https://www.streamraiders.com/t/${captainName}`, {
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
    console.error('Error joining captain:', new Date().toLocaleTimeString(), error.message);
    return;
  }
}

async function getUnitInfo(unitId) {
  let unitArray = await retrieveFromStorage("unitArray");
  let unitInfo = [];
  for (let i = 0; i < unitArray.data.length; i++) {
    if (unitArray.data[i].unitId == unitId) {
      unitInfo[0] = unitArray.data[i].unitType;
      unitInfo[1] = unitArray.data[i].level;
      return unitInfo;
    }
  }
}

async function getUnitId(unitType, unitLevel) {
  let unitArray = await retrieveFromStorage("unitArray");
  let unitId;
  unit_loop: for (let i = 0; i < unitArray.data.length; i++) {
    if (unitArray.data[i].unitType == unitType && unitArray.data[i].level == unitLevel) {
      unitId = unitArray.data[i].unitId;
      return unitId
    }
  }
}

async function getUserDungeonInfoForRaid(data, headers) {
  let headersArray = headers.split("&");
  let raidId = headersArray[0].split("=")[1];

  let dungeonRaidResponse = data;
  if (dungeonRaidResponse && dungeonRaidResponse != null) {
    let dungeonRaid = dungeonRaidResponse.data;
    let dungeonRaidInfo = [];

    dungeonRaidInfo[0] = dungeonRaid?.streak ?? "";
    dungeonRaidInfo[1] = dungeonRaid?.knockedUnits ?? "";
    dungeonRaidInfo[2] = dungeonRaid?.recoveredUnits ?? "";
    dungeonRaidInfo[3] = dungeonRaid?.deadUnits ?? "";
    dungeonRaidInfo[4] = dungeonRaid?.exhaustedUnits ?? "";
    dungeonRaidInfo[5] = dungeonRaid?.epicChargesUsed ?? "";
    dungeonRaidInfo[6] = dungeonRaid?.captainBoons ?? "";
    dungeonRaidInfo[7] = dungeonRaid?.enemyBoons ?? "";
    dungeonRaidInfo[8] = dungeonRaid?.completedLevels ?? "";
    await chrome.storage.local.set({ "dungeonRaidInfo": dungeonRaidInfo });
  }
}

async function checkEventCurrencyActive() {
  if (isEventCurrencyActive == null || isEventCurrencyActive == undefined) {
    let eventData = await retrieveFromStorage("events");
    let currentDateTime = new Date();
    let currentDateTimePT = new Date(currentDateTime.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
    isEventCurrencyActive = false;
    for (event in eventData) {
      if (eventData[event].StartTime <= currentDateTimePT && eventData[event].EndTime > currentDateTimePT && eventData[event].EventCurrency != "") {
        isEventCurrencyActive = true;
      }
    }
    return isEventCurrencyActive;
  }
}

async function cancelLeaveBattlePopup() {
  let leaveBattleModal = document.querySelector(".modalContent");
  if (leaveBattleModal && leaveBattleModal.innerText.includes("Leave battle")) {
    try {
      let cancelButton = document.querySelector(".actionButton.actionButtonSecondary");
      cancelButton.click();
    } catch (error) { }
  }
}

async function confirmLeaveBattlePopup() {
  let leaveBattleModal = document.querySelector(".modalContent");
  if (leaveBattleModal && leaveBattleModal.innerText.includes("Leave battle")) {
    try {
      let confirmButton = document.querySelector(".actionButton.actionButtonPrimary");
      confirmButton.click();
    } catch (error) { }
  }
}

async function handleMessage(message) {
  let url = message.data[0];
  let data = message.data[1];
  let headers = message.data[2];
  
  if (url.startsWith("https://streamcap-prod1.s3.amazonaws.com/data/data.")) {
    await chrome.storage.local.set({ "gameDataPath": url });
    await getGameData(url, data);
  }
  else if (url == "https://d2k2g0zg1te1mr.cloudfront.net/manifests/mobilelite.json") {
    await chrome.storage.local.set({ imageUrls: data });
  }
  else if (url == "https://www.streamraiders.com/api/game/?cn=getActiveRaidsLite") {
    if (data.info.dataPath != await retrieveFromStorage("gameDataPath")) {
      await locationReload();
      return;
    }
    await getActiveRaidsLite(data);
    await logChestsAndUnitsInterval();
  }
  else if (url == "https://www.streamraiders.com/api/game/?cn=getEventProgressionLite") {
    console.log(url, data);
    await chrome.storage.local.set({ "getEventProgressionLite": data });
    let eventTiers = await retrieveFromStorage("eventTiers");
    let eventUid = data.data.eventUid;
    //If eventTiers is undefined, reload to update it
    if (eventTiers == undefined) {
      await locationReload();
    }
    //If the event tiers eventUid doesn't match the eventUid in getEventProgressionLite, reload to update it
    let counter = 0
    for (const nodeKey in eventTiers) {
      counter++;
      const node = eventTiers[nodeKey];
      if (node.EventUid != eventUid) {
        await locationReload();
      }
      if (counter >= 1) break;
    }
  }
  else if (url == "https://www.streamraiders.com/api/game/?cn=getUser") {
    console.log(url, data);
    await chrome.storage.local.set({ 
      "userId": data.data.userId, 
      "epicProgression": data.data.epicProgression, 
      "storeRefreshCount": data.data.storeRefreshCount, 
      "favoriteCaptainIds": data.data.favoriteCaptainIds 
    });
  }
  else if (url == "https://www.streamraiders.com/api/game/?cn=getRaidStatsByUser") {
    console.log(url, data);
    await getRaidStats(data);
  }
  else if (url == "https://www.streamraiders.com/api/game/?cn=getRaid") {
    console.log(url, data);
    await getLeaderboardUnitsData(data);
  }
  else if (url == "https://www.streamraiders.com/api/game/?cn=getUserQuests") {
    console.log(url, data);
    await chrome.storage.local.set({ "userQuests": data });
  }
  else if (url == "https://www.streamraiders.com/api/game/?cn=getCurrentStoreItems") {
    console.log(url, data);
    await chrome.storage.local.set({ "currentStoreItems": data });
  }
  else if (url == "https://www.streamraiders.com/api/game/?cn=getUserUnits") {
    console.log(url, data);
    await chrome.storage.local.set({ "unitArray": data });
  }
  else if (url == "https://www.streamraiders.com/api/game/?cn=getUserDungeonInfoForRaid") {
    console.log(url, data);
    await getUserDungeonInfoForRaid(data, headers);
  }
  else if (url == "https://www.streamraiders.com/api/game/?cn=getAvailableCurrencies") {
    console.log(url, data);
    await chrome.storage.local.set({ "availableCurrencies": data });
  }
  else if (url == "https://www.streamraiders.com/api/game/?cn=grantEventReward") {
    console.log(url, data);
  }
  else if (url == "https://www.streamraiders.com/api/game/?cn=collectQuestReward") {
    console.log(url, data);
  }
  else if (url == "https://www.streamraiders.com/api/game/?cn=getCaptainsForSearch") {
    console.log(url, data);
    let captainSearchResults = data.data.captains;
    let captainSearchData = await retrieveFromStorage("captainSearchData") || [];
    for (let i = 0; i < captainSearchData.length; i++) {
      let entry = captainSearchData[i];
      //If the entry in storage is older than 10 seconds, remove it
      if ((new Date().getTime() - entry.timestamp) / 1000 > 10) {
        captainSearchData.splice(i, 1);
      }
    }
    for (let i = 0; i < captainSearchResults.length; i++) {
      captainSearchData.push({ "timestamp": new Date().getTime() , ...captainSearchResults[i] });
    }
    const mapFromCaptains = new Map(
      captainSearchData.map(c => [c.userId, c])
    );
    const uniqueCaptains = [...mapFromCaptains.values()];

    await saveToStorage("captainSearchData", uniqueCaptains);
  }
  else if (url == "https://www.streamraiders.com/api/game/?cn=purchaseChestItem") {
    //Save chest results to log
    let userChestData = await retrieveFromStorage("userChests") || [];
    let userChestLogData = await retrieveFromStorage("userChestsLog") || [];
    let eventUid = await retrieveFromStorage("getEventProgressionLite");
    eventUid = eventUid.data.eventUid;
    if (eventUid == undefined) return;

    let purchaseResponse = data;

    if (purchaseResponse.status == "success") {
        let chestId = purchaseResponse.data.chestId;
        let rewards = purchaseResponse.data.rewards;
        if (userChestData.hasOwnProperty(chestId)) {
            userChestData[chestId].amountBought++;
        } else {
            console.log(`${chestId} not found in userChestData.`);
        }
        userChestLogData.push({
            dateTime: new Date().toString(),
            chestId: chestId,
            rewards: rewards,
            eventUid: eventUid
        })
    }
    await saveToStorage("userChests", userChestData);
    await saveToStorage("userChestsLog", userChestLogData);
  }
}

async function getActiveRaidsLite(activeRaids) {
  activeRaidsArray = [];
  for (let i = 0; i < activeRaids.data.length; i++) {
    let activeRaid = activeRaids.data[i];
    activeRaidsArray.push({
      "twitchDisplayName": activeRaid.twitchDisplayName, 
      "twitchUserName": activeRaid.twitchUserName, 
      "captainId": activeRaid.captainId, 
      "userSortIndex": activeRaid.userSortIndex, 
      "raidId": activeRaid.raidId, 
      "nodeId": activeRaid.nodeId, 
      "opponentTwitchDisplayName": activeRaid.opponentTwitchDisplayName, 
      "type": activeRaid.type, 
      "isCodeLocked": activeRaid.isCodeLocked, 
      "message": activeRaid.message
    });
  }
  //Put an empty entry in activeRaidsArray if the user has no captains in any slot
  if (activeRaidsArray.length == 0) {
    activeRaidsArray.push({
      "twitchDisplayName": "", 
      "twitchUserName": "", 
      "captainId": "", 
      "userSortIndex": 0, 
      "raidId": "", 
      "nodeId": "", 
      "opponentTwitchDisplayName": "", 
      "type": "", 
      "isCodeLocked": "", 
      "message": ""
    });
  }
}

async function getGameData(url, data) {
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
    url: url,
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

  let eventUid = await retrieveFromStorage("getEventProgressionLite");
  if (eventUid) {
    eventUid = eventUid.data.eventUid;
  }
  
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
