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
    if (requestRunning) return;
    requestRunning = true;
    let response = activeRaidsArray;
    if (response == undefined || response == null) {
      return;
    }
    const activeRaids = response;
    await checkBattleMessages(activeRaids);
    await manageGameModes(activeRaids);
    await addNewLogEntry(activeRaids);
    //Checks if the user wants to replace idle captains and invoke the function to check and replace them.
    // if (offlineSwitch) {
      // await checkIdleCaptains(activeRaids);
    // }
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

//Remove current captain
async function removeOldCaptain(captainId) {
  const dataArray = ['clientVersion', 'dataVersion'];
  const dataKeys = await retrieveMultipleFromStorage(dataArray);
  const clientVersion = dataKeys.clientVersion;
  const gameDataVersion = dataKeys.dataVersion;

  try {
    const url = `https://www.streamraiders.com/api/game/?cn=leaveCaptain&captainId=${captainId}&clientVersion=${clientVersion}&clientPlatform=WebLite&gameDataVersion=${gameDataVersion}&command=leaveCaptain&isCaptain=0`
    const response = await makeRequest(url, 0);
    await backgroundDelay(3000);
    return;
  } catch (error) {
    console.error('Error removing captain:', new Date().toLocaleTimeString(), error.message);
    return;
  }
}

async function collectEventReward(eventUid, missingTier, battlePass) {
  const dataArray = ['clientVersion', 'dataVersion'];
  const dataKeys = await retrieveMultipleFromStorage(dataArray);
  const clientVersion = dataKeys.clientVersion;
  const gameDataVersion = dataKeys.dataVersion;

  try {
    const url = `https://www.streamraiders.com/api/game/?cn=grantEventReward&eventId=${eventUid}&rewardTier=${missingTier}&collectBattlePass=${battlePass}&clientVersion=${clientVersion}&clientPlatform=WebLite&gameDataVersion=${gameDataVersion}&command=grantEventReward&isCaptain=0`
    const response = await makeRequest(url, 0);
    return;
  } catch (error) {
    console.error('Error collecting event/battlepass rewards:', new Date().toLocaleTimeString(), error.message);
    return;
  }
}

async function purchaseStoreItem(item) {
  const dataArray = ['clientVersion', 'dataVersion'];
  const dataKeys = await retrieveMultipleFromStorage(dataArray);
  const clientVersion = dataKeys.clientVersion;
  const gameDataVersion = dataKeys.dataVersion;

  try {
    const url = `https://www.streamraiders.com/api/game/?cn=purchaseStoreItem&itemId=${item}&clientVersion=${clientVersion}&clientPlatform=WebLite&gameDataVersion=${gameDataVersion}&command=purchaseStoreItem&isCaptain=0`
    const response = await makeRequest(url, 0);

    return;

  } catch (error) {
    console.error('Error in purchaseStoreItem:', new Date().toLocaleTimeString(), error);
    return;
  }
}

async function purchaseStoreRefresh() {
  const dataArray = ['clientVersion', 'dataVersion'];
  const dataKeys = await retrieveMultipleFromStorage(dataArray);
  const clientVersion = dataKeys.clientVersion;
  const gameDataVersion = dataKeys.dataVersion;

  try {
    const url = `https://www.streamraiders.com/api/game/?cn=purchaseStoreRefresh&clientVersion=${clientVersion}&clientPlatform=WebLite&gameDataVersion=${gameDataVersion}&command=purchaseStoreRefresh&isCaptain=0`
    const response = await makeRequest(url, 0);
    if (response == undefined) {
      return;
    }

    const storeData = response;
    const storeItems = storeData.data;
    return storeItems;

  } catch (error) {
    console.error('Error in purchaseStoreRefresh:', new Date().toLocaleTimeString(), error);
    return "";
  }
}

async function collectQuestReward(questSlotId) {
  const dataArray = ['clientVersion', 'dataVersion', 'userId'];
  const dataKeys = await retrieveMultipleFromStorage(dataArray);
  const clientVersion = dataKeys.clientVersion;
  const gameDataVersion = dataKeys.dataVersion;
  const userId = dataKeys.userId;

  try {
    const url = `https://www.streamraiders.com/api/game/?cn=collectQuestReward&userId=${userId}&isCaptain=0&gameDataVersion=${gameDataVersion}&slotId=${questSlotId}&autoComplete=False&command=collectQuestReward&clientVersion=${clientVersion}&clientPlatform=WebLite`
    const response = await makeRequest(url, 0);
    if (response == undefined) {
      return;
    }

    const questsData = response;
    const quests = questsData.data;
    return quests;

  } catch (error) {
    console.error('Error in collectQuestReward:', new Date().toLocaleTimeString(), error);
    return "";
  }
}

async function grantDailyDrop() {
  const dataArray = ['clientVersion', 'dataVersion'];
  const dataKeys = await retrieveMultipleFromStorage(dataArray);
  const clientVersion = dataKeys.clientVersion;
  const gameDataVersion = dataKeys.dataVersion;

  try {
    const url = `https://www.streamraiders.com/api/game/?cn=grantDailyDrop&clientVersion=${clientVersion}&clientPlatform=WebLite&gameDataVersion=${gameDataVersion}&command=grantDailyDrop&isCaptain=0`
    const response = await makeRequest(url, 0);
    return;
  } catch (error) {
    console.error('Error collecting daily reward:', new Date().toLocaleTimeString(), error.message);
    return;
  }
}

async function getCaptainsForSearch(mode, codes = 0) { //mode = "campaign" or "duel" or "dungeons" or "clash"
  const dataArray = ['clientVersion', 'dataVersion', 'userId'];
  const dataKeys = await retrieveMultipleFromStorage(dataArray);
  const clientVersion = dataKeys.clientVersion;
  const gameDataVersion = dataKeys.dataVersion;
  const userId = dataKeys.userId;

  try {
    let captArray = [];
    let h = 0;

    for (let pageNum = 1; pageNum <= 10; pageNum++) {
      let url;
      if (codes == 0) {
        url = `https://www.streamraiders.com/api/game/?cn=getCaptainsForSearch&userId=${userId}&isCaptain=0&gameDataVersion=${gameDataVersion}&command=getCaptainsForSearch&page=${pageNum}&resultsPerPage=24&filters={"mode":"${mode}","isPlaying":1,"roomCodes":"false"}&clientVersion=${clientVersion}&clientPlatform=WebLite`
      } else if (codes == 1) {
        url = `https://www.streamraiders.com/api/game/?cn=getCaptainsForSearch&userId=${userId}&isCaptain=0&gameDataVersion=${gameDataVersion}&command=getCaptainsForSearch&page=${pageNum}&resultsPerPage=24&filters={"mode":"${mode}","isPlaying":1}&clientVersion=${clientVersion}&clientPlatform=WebLite`
      }
      const response = await makeRequest(url, 0);
      if (response == undefined) {
        return;
      }

      let captData = response;
      console.log(captData)
      if (captData.data && captData.data.captains != null) {
        let capts = captData.data.captains;
        let captLoyalty = captData.data.pveLoyalty;
        for (let i = 0; i < capts.length; i++) {
          captLoop: for (let j = 0; j < captLoyalty.length; j++) {
            if (capts[i] == null || captLoyalty[j] == null) {
              continue;
            }
            if (captLoyalty[j].captainId == capts[i].userId) {
              captArray.push([capts[i].userId, capts[i].twitchDisplayName, capts[i].raidState, capts[i].isSelected, parseInt(captLoyalty[j].pveWins)])
              break captLoop;
            }
          }
          h++;
        }
      } else {
        return "";
      }
    }
    return captArray;

  } catch (error) {
    console.error('Error in getCaptainsForSearch:', new Date().toLocaleTimeString(), error);
    return "";
  }
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

async function joinCaptain(captainId, index) {
  const dataArray = ['clientVersion', 'dataVersion'];
  const dataKeys = await retrieveMultipleFromStorage(dataArray);
  const clientVersion = dataKeys.clientVersion;
  const gameDataVersion = dataKeys.dataVersion;

  try {
    const url = `https://www.streamraiders.com/api/game/?cn=addPlayerToRaid&captainId=${captainId}&userSortIndex=${index}&clientVersion=${clientVersion}&clientPlatform=WebLite&gameDataVersion=${gameDataVersion}&command=addPlayerToRaid&isCaptain=0`
    const response = await makeRequest(url, 0);
    return;
  } catch (error) {
    console.error('Error joining captain:', new Date().toLocaleTimeString(), error.message);
    return;
  }
}

async function joinCaptainToAvailableSlot(captainName) {
  try {
    const url = `https://www.streamraiders.com/t/${captainName}`
    const response = await makeRequest(url, 0);
    return;
  } catch (error) {
    console.error('Error joining captain:', new Date().toLocaleTimeString(), error.message);
    return;
  }
}

async function useCooldownCurrency(unitType, unitLevel) {
  const dataArray = ['clientVersion', 'dataVersion'];
  const dataKeys = await retrieveMultipleFromStorage(dataArray);
  const clientVersion = dataKeys.clientVersion;
  const gameDataVersion = dataKeys.dataVersion;

  let unitArray = await retrieveFromStorage("unitArray");
  let unitId;
  unit_loop: for (let i = 0; i < unitArray.length; i++) {
    if (unitArray[i].unitType == unitType && unitArray[i].level == unitLevel) {
      unitId = unitArray[i].unitId;
      break unit_loop;
    }
  }
  try {
    const url = `https://www.streamraiders.com/api/game/?cn=useCooldownCurrency&unitId=${unitId}&clientVersion=${clientVersion}&clientPlatform=WebLite&gameDataVersion=${gameDataVersion}&command=useCooldownCurrency&isCaptain=0`
    const response = await makeRequest(url, 0);
    return;
  } catch (error) {
    console.error('Error using meat:', new Date().toLocaleTimeString(), error.message);
    return;
  }
}

async function reviveUnit(unitType, unitLevel, captainNameFromDOM) {
  const dataArray = ['clientVersion', 'dataVersion', 'userId'];
  const dataKeys = await retrieveMultipleFromStorage(dataArray);
  const clientVersion = dataKeys.clientVersion;
  const gameDataVersion = dataKeys.dataVersion;
  const userId = dataKeys.userId;

  let requestLoyaltyResults = await getCaptainLoyalty(captainNameFromDOM);
  let raidId = requestLoyaltyResults[0];

  let unitArray = await retrieveFromStorage("unitArray");
  let unitId;
  unit_loop: for (let i = 0; i < unitArray.data.length; i++) {
    if (unitArray.data[i].unitType == unitType && unitArray.data[i].level == unitLevel) {
      unitId = unitArray.data[i].unitId;
      break unit_loop;
    }
  }
  try {
    const url = `https://www.streamraiders.com/api/game/?cn=reviveUnit&userId=${userId}&isCaptain=0&gameDataVersion=${gameDataVersion}&command=reviveUnit&unitId=${unitId}&raidId=${raidId}&clientVersion=${clientVersion}&clientPlatform=WebLite`
    const response = await makeRequest(url, 0);
    if (response == undefined) {
      return;
    }
    let reviveStatus = response;
    return;
  } catch (error) {
    console.error('Error reviving unit:', new Date().toLocaleTimeString(), error.message);
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

async function levelUp() {
  if (await retrieveFromStorage("paused_checkbox")) {
    return
  }

  let minCur = await retrieveNumberFromStorage("minCurrency");
  if (minCur <= 0) {
    return
  }

  const dataArray = ['clientVersion', 'dataVersion', 'userId'];
  const dataKeys = await retrieveMultipleFromStorage(dataArray);
  const clientVersion = dataKeys.clientVersion;
  const gameDataVersion = dataKeys.dataVersion;
  const userId = dataKeys.userId;

  let legendaries = ["alliesballoonbuster","alliespaladin","amazon","artillery","balloonbuster","blob","mage","necromancer","orcslayer","phantom","spy","templar","warbeast"];
  let regularCost = [
    { lower: 1, high: 2, gold: 25, scroll: 15 },
    { lower: 2, high: 3, gold: 35, scroll: 20 },
    { lower: 3, high: 4, gold: 50, scroll: 25 },
    { lower: 4, high: 5, gold: 100, scroll: 50 },
    { lower: 5, high: 6, gold: 120, scroll: 60 },
    { lower: 6, high: 7, gold: 140, scroll: 70 },
    { lower: 7, high: 8, gold: 160, scroll: 80 },
    { lower: 8, high: 9, gold: 180, scroll: 90 },
    { lower: 9, high: 10, gold: 200, scroll: 100 },
    { lower: 10, high: 11, gold: 220, scroll: 110 },
    { lower: 11, high: 12, gold: 240, scroll: 120 },
    { lower: 12, high: 13, gold: 260, scroll: 130 },
    { lower: 13, high: 14, gold: 280, scroll: 140 },
    { lower: 14, high: 15, gold: 300, scroll: 150 },
    { lower: 15, high: 16, gold: 320, scroll: 160 },
    { lower: 16, high: 17, gold: 340, scroll: 170 },
    { lower: 17, high: 18, gold: 360, scroll: 180 },
    { lower: 18, high: 19, gold: 380, scroll: 190 },
    { lower: 19, high: 20, gold: 400, scroll: 200 },
    { lower: 20, high: 21, gold: 450, scroll: 220 },
    { lower: 21, high: 22, gold: 500, scroll: 240 },
    { lower: 22, high: 23, gold: 550, scroll: 260 },
    { lower: 23, high: 24, gold: 600, scroll: 280 },
    { lower: 24, high: 25, gold: 675, scroll: 300 },
    { lower: 25, high: 26, gold: 750, scroll: 320 },
    { lower: 26, high: 27, gold: 825, scroll: 340 },
    { lower: 27, high: 28, gold: 900, scroll: 360 },
    { lower: 28, high: 29, gold: 1000, scroll: 380 },
    { lower: 29, high: 30, gold: 1200, scroll: 400 }]
  let legendaryCost = [
    { lower: 1, high: 2, gold: 50, scroll: 10 },
    { lower: 2, high: 3, gold: 70, scroll: 10 },
    { lower: 3, high: 4, gold: 100, scroll: 10 },
    { lower: 4, high: 5, gold: 200, scroll: 10 },
    { lower: 5, high: 6, gold: 240, scroll: 10 },
    { lower: 6, high: 7, gold: 280, scroll: 10 },
    { lower: 7, high: 8, gold: 320, scroll: 10 },
    { lower: 8, high: 9, gold: 360, scroll: 10 },
    { lower: 9, high: 10, gold: 400, scroll: 10 },
    { lower: 10, high: 11, gold: 440, scroll: 15 },
    { lower: 11, high: 12, gold: 480, scroll: 15 },
    { lower: 12, high: 13, gold: 520, scroll: 15 },
    { lower: 13, high: 14, gold: 560, scroll: 15 },
    { lower: 14, high: 15, gold: 600, scroll: 15 },
    { lower: 15, high: 16, gold: 640, scroll: 15 },
    { lower: 16, high: 17, gold: 680, scroll: 15 },
    { lower: 17, high: 18, gold: 720, scroll: 15 },
    { lower: 18, high: 19, gold: 760, scroll: 15 },
    { lower: 19, high: 20, gold: 800, scroll: 15 },
    { lower: 20, high: 21, gold: 850, scroll: 20 },
    { lower: 21, high: 22, gold: 900, scroll: 20 },
    { lower: 22, high: 23, gold: 950, scroll: 20 },
    { lower: 23, high: 24, gold: 1000, scroll: 20 },
    { lower: 24, high: 25, gold: 1100, scroll: 20 },
    { lower: 25, high: 26, gold: 1200, scroll: 20 },
    { lower: 26, high: 27, gold: 1300, scroll: 20 },
    { lower: 27, high: 28, gold: 1500, scroll: 20 },
    { lower: 28, high: 29, gold: 1600, scroll: 20 },
    { lower: 29, high: 30, gold: 2000, scroll: 20 }];

  let u = await retrieveFromStorage("unitArray");
  let units = u.data

  let uC = await retrieveFromStorage("availableCurrencies")
  let userCurrencies = uC.data
  let gold = userCurrencies.gold
  let goldInt = parseInt(gold)
  let minCurInt = parseInt(minCur)
  if (goldInt < minCurInt) {
    return
  }

  let unitsData = await new Promise((resolve, reject) => {
    chrome.storage.local.get('unitsData', function (result) {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result.unitsData);
      }
    });
  });

  const filteredUnits = Object.entries(unitsData)
    .filter(([key, value]) => value.priority !== 0)
    .reduce((obj, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {});

  let unitArray = Object.entries(filteredUnits);
  uArray.sort((a, b) => a[1].priority - b[1].priority);

  for (let i = 0; i < unitArray.length; i++) {
    let unit = unitArray[i]
    let unitName = unit[0]
    let canLevelUp = unit[1].canLevelUp
    let canSpec = unit[1].canSpec
    let spec = unit[1].spec

    if (!canLevelUp) {
      continue
    }
    // Get amount of scrolls available.
    let scrolls = userCurrencies[unitName]
    if (unitName == "paladin") {
      unitName = "alliespaladin"
    } else if (unitName == "balloonbuster") {
      unitName = "alliesballoonbuster"
    }
    for (let j = 0; j < units.length; j++) {
      let gameUnit = units[j]
      let gameUnitName = gameUnit.unitType
      let unitId = gameUnit.unitId
      if (gameUnitName != unitName) {
        continue
      }
      let level = gameUnit.level
      if (level == 30) {
        continue
      }

      let priceArray = legendaries.includes(unitName) ? legendaryCost : regularCost;
      for (let k = 0; k < priceArray.length; k++) {
        let price = priceArray[k]
        let lowerBound = price.lower
        if (level == lowerBound) {
          let scrollCost = price.scroll
          let goldCost = price.gold
          if (scrolls >= scrollCost && gold >= goldCost) {

            //Make the api call to level up
            let upgradeUrl = ""
            if (level == 19 && canSpec) {
              upgradeUrl = `https://www.streamraiders.com/api/game/?cn=specializeUnit&unitId=${unitId}&specializationUid=${spec}&clientVersion=${clientVersion}&clientPlatform=WebLite&gameDataVersion=${gameDataVersion}&command=specializeUnit&isCaptain=0`
            } else {
              upgradeUrl = `https://www.streamraiders.com/api/game/?cn=upgradeUnit&userId=${userId}&isCaptain=0&gameDataVersion=${gameDataVersion}&command=upgradeUnit&unitType=${unitName}&unitLevel=${level}&unitId=${unitId}&clientVersion=${clientVersion}&clientPlatform=WebLite`
            }
            try {
              const response = await makeRequest(upgradeUrl, 0);
              break;

            } catch (error) {
              console.error('Error upgrading unit:', new Date().toLocaleTimeString(), error.message);
              return;
            }
            break;
          }
        }
      }
    }
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

async function checkForDuel() {
  let captArray = await getCaptainsForSearch("duel");
  if (captArray.length > 1) {
    return captArray;
  }
  return false;
}

//Switch captains to a higher one if available
async function switchCaptains(currentCaptain, masterList, index) {
  if (masterList.length == 0) {
    return false;
  }
  let captainsArray = [];
  let currentId;

  const dataArray = ['clientVersion', 'dataVersion'];
  const dataKeys = await retrieveMultipleFromStorage(dataArray);
  const clientVersion = dataKeys.clientVersion;
  const gameDataVersion = dataKeys.dataVersion;
  
  for (let i = 1; i < 6; i++) {
    try {
      // const url = `https://www.streamraiders.com/api/game/?cn=getCaptainsForSearch&isPlayingS=desc&isLiveS=desc&page=${i}&format=normalized&resultsPerPage=30&filters={"isPlaying":1,"roomCodes":"false"}&clientVersion=${clientVersion}&clientPlatform=WebLite&gameDataVersion=${gameDataVersion}&command=getCaptainsForSearch&isCaptain=0`
      const url = `https://www.streamraiders.com/api/game/?cn=getCaptainsForSearch&isPlayingS=desc&page=${i}&format=normalized&resultsPerPage=30&filters={"isPlaying":1}&clientVersion=${clientVersion}&clientPlatform=WebLite&gameDataVersion=${gameDataVersion}&command=getCaptainsForSearch&isCaptain=0`
      const response = await makeRequest(url, 0);
      if (response == undefined) {
        return;
      }

      const captainsData = response;

      for (let i = 0; i < captainsData.data.captains.length; i++) {
        const current = captainsData.data.captains[i];
        const name = current.twitchUserName.toUpperCase();
        const pvp = current.isPvp;
        const id = current.userId;
        const isSelected = current.isSelected;

        const type = current.type;

        if (currentCaptain === name) {
          currentId = id;
        }
        if (isSelected == false) {
          captainsArray.push({
            name, pvp, id, type, isSelected
          });
        }
      }
    } catch (error) {
      console.error('Error fetching captains:', new Date().toLocaleTimeString(), error.message);
      return false;
    }
  }

  // Filter live captains so only masterlist, no pvp and no dungeon remains
  //type 1 = campaign. type 3 = dungeon.
  captainsArray = captainsArray.filter(captain => {
    return captain.name !== currentCaptain && masterList.includes(captain.name) && !captain.pvp && captain.type != 3;
  });

  // Sort live captains based on their order on the masterlist
  captainsArray.sort((a, b) => {
    return masterList.indexOf(a.name) - masterList.indexOf(b.name);
  });

  // Extract the ids from the sorted captains
  const firstCaptainId = captainsArray.length > 0 ? captainsArray[0].id : null;
  const firstCaptainName = captainsArray.length > 0 ? captainsArray[0].name : null;

  if (currentId != undefined && firstCaptainId != undefined) {
    await removeOldCaptain(currentId);
    await joinCaptain(firstCaptainId, index);
    await delay(5000);
    //Check if the battle has a code. If it does, delete the captain from the masterList array and try again
    if (await checkIfCodeLocked(firstCaptainName)) {
      captLoop: for (let j = 0; j < masterList.length; j++) {
        if (masterList[j].id == firstCaptainId) {
          masterList.splice(j, 1);
          break captLoop;
        }
      }
      await switchCaptains(firstCaptainId, masterList, index)
    }
    return true;
  }
  return false;
}

async function checkIfCodeLocked(captainName) {
  try {
    let response = activeRaidsArray;

    const activeRaids = response;
    let activeRaidsData = new Object();
    for (let i = 0; i < activeRaids.length; i++) {
      const position = activeRaids[i];
      if (position.twitchUserName.toLowerCase() === captainName.toLowerCase() && position.isCodeLocked == true) {
        return true;
      }
    }
  } catch (error) { }
  return false;
}

async function attemptToJoinDuel(index, originalCaptainId) {
  let duelCapt = await checkForDuel();
  if (duelCapt) {
    duelCapt = await getCaptainsForSearch("duel", 0);
    await backgroundDelay(3000);
    await removeOldCaptain(originalCaptainId);
    await backgroundDelay(1000);
    return await joinCaptCheckCodeRetry("duel", duelCapt, index, originalCaptainId);
  }
}

async function joinCaptCheckCodeRetry(mode, captainArray, index, originalCaptainId) {
  allCaptLoop: for (let i = 0; i < captainArray.length; i++) {
    //Iterates through the list of captains
    const captain = captainArray[i];
    //Gets the already joined value from the current captain
    let alreadyJoined = captain[3];
    //If the captain has not been joined yet, join and check for code
    if (!alreadyJoined) {
      captainId = captain[0];
      captainName = captain[1];
      console.log("LOG-joining "+captainName);
      await joinCaptain(captainId, index);
      if (mode != "campaign") {
        console.log("LOG-save to storage "+captainName);
        if (mode == "dungeons") {
          await saveToStorage("dungeonCaptain", "," + captainName + ",");
        } else {
          await saveToStorage(mode + "Captain", "," + captainName + ",");
        }
      }
      await delay(3000);
      if (await checkIfCodeLocked(captainName)) { //If code, leave captain, delete the captain from the array, and try again
        console.log("LOG-removing "+captainName);
        await removeOldCaptain(captainId);
        captLoop: for (let j = 0; j < captainArray.length; j++) {
          if (captainArray[j][1].toLowerCase() == captainName.toLowerCase()) {
            captainArray.splice(j, 1);
            break captLoop;
          }
        }
        if (captainArray.length >= 0) { //Try next captain in the array
          let result = await joinCaptCheckCodeRetry(mode, captainArray, index, originalCaptainId);
          await cancelLeaveBattlePopup();
          return result;
        } else {
          await cancelLeaveBattlePopup();
          break allCaptLoop; //If captainArray is exhausted, break loop and join original captain
        }
      } else {
        return true;
      }
    }
  }
  //If unable to join any new captain, join the original again, if applicable
  if (originalCaptainId != "") {
    await delay(1000);
    console.log("LOG-joining original captain "+originalCaptainId);
    await joinCaptain(originalCaptainId, index);
    await delay(3000);
  }
  return true;
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

async function checkDungeons(cptId, type) {
  // No need to check pause state because collectChests already does that.

  // Check if pvp can be overwritten
  let canOverwritePVP = await retrieveFromStorage("dungeonSlotOverwrite")
  if (!canOverwritePVP && (type == "2" || type == "5" || type == "4")) {
    return
  }

  let mustSkipIfNoDungeon = await retrieveFromStorage("dungeonSlotSkip")

  let sD = await chrome.storage.local.get(['dungeonblocklist']);
  let dgnBlockList = Object.values(sD.dungeonblocklist) || [];

  sD = await chrome.storage.local.get(['dungeonlist']);
  let dungeonList = Object.values(sD.dungeonlist) || [];


  // User wants to skip if there are no dungeons from the list, but the list wasn't set.
  if (mustSkipIfNoDungeon && dungeonList.length == 0) {
    return
  }

  // Get active raids
  const dataArray = ['clientVersion', 'dataVersion'];
  const dataKeys = await retrieveMultipleFromStorage(dataArray);
  const clientVersion = dataKeys.clientVersion;
  const gameDataVersion = dataKeys.dataVersion;

  // Get uncoded dungeons captains here before handling slots as an empty result means any further processing is useless
  let dungeonCaptains = []
  for (let i = 1; i < 6; i++) {
    try {
      // const url = `https://www.streamraiders.com/api/game/?cn=getCaptainsForSearch&isPlayingS=desc&isLiveS=desc&page=${i}&format=normalized&resultsPerPage=30&filters={"isPlaying":1,"mode":"dungeons","roomCodes":"false"}&clientVersion=${clientVersion}&clientPlatform=WebLite&gameDataVersion=${gameDataVersion}&command=getCaptainsForSearch&isCaptain=0`
      const url = `https://www.streamraiders.com/api/game/?cn=getCaptainsForSearch&isPlayingS=desc&page=${i}&format=normalized&resultsPerPage=30&filters={"isPlaying":1,"mode":"dungeons"}&clientVersion=${clientVersion}&clientPlatform=WebLite&gameDataVersion=${gameDataVersion}&command=getCaptainsForSearch&isCaptain=0`
      const response = await makeRequest(url, 0);
      if (response == undefined) {
        return;
      }

      let parsedResponse = response
      let dungeonCaptainData = parsedResponse.data.captains
      dungeonCaptains.push(...dungeonCaptainData);
    } catch (error) {
      return
    }
  }

  // Remove captains that are not listed
  if (mustSkipIfNoDungeon) {
    dungeonCaptains = dungeonCaptains.filter(captain => {
      let captainName = captain.twitchUserName.toLowerCase();
      return dungeonList.includes(captainName);
    });
  }

  // Remove block listed captains
  for (let i = 0; i < dungeonCaptains.length; i++) {
    let captainName = dungeonCaptains[i].twitchUserName.toLowerCase();
    if (dgnBlockList.includes(captainName)) {
      dungeonCaptains.splice(i, 1);
      i--;
    }
  }

  // Sort the online captains based on the dungeon list.
  dungeonCaptains.sort((a, b) => {
    let c1 = dungeonList.indexOf(a.twitchUserName.toLowerCase());
    let c2 = dungeonList.indexOf(b.twitchUserName.toLowerCase());
    return c1 - c2;
  });

  await joinDungeon(cptId, dungeonCaptains);
}

async function joinDungeon(cptId, dungeonCaptains) {
  if (!dungeonCaptains || dungeonCaptains.length === 0) {
    return false;
  }

  let captainName = dungeonCaptains[0]?.twitchUserName;

  if (captainName) {
    try {
      await removeOldCaptain(cptId);
      
      const url = `https://www.streamraiders.com/t/${captainName}`
      const response = await makeRequest(url, 0);

      if (!response.ok) {
        return await joinNextDungeon(cptId, dungeonCaptains.slice(1));
        await saveToStorage("dungeonCaptain", "," + captainName + ",");
      }

      if (await checkIfCodeLocked(captainName)) {
        for (let j = 0; j < dungeonCaptains.length; j++) {
          if (dungeonCaptains[j].twitchUserName.toLowerCase() == captainName.toLowerCase()) {
            dungeonCaptains.splice(j, 1);
          }
        }
        let result = await joinDungeon(dungeonCaptains);
        return result;
        return await joinNextDungeon(cptId, dungeonCaptains.slice(1));
      }

      return true;
    } catch (error) {
      console.error('Error joining captain:', new Date().toLocaleTimeString(), error.message);
      return await joinNextDungeon(cptId, dungeonCaptains.slice(1));
    }
  }
}

async function joinNextDungeon(cptId, dungeonCaptains) {
  if (dungeonCaptains.length > 0) {
    return await joinDungeon(cptId, dungeonCaptains);
  } else {
    return false;
  }
}

async function getActiveRaids() {
  const dataArray = ['clientVersion', 'dataVersion'];
  const dataKeys = await retrieveMultipleFromStorage(dataArray);
  const clientVersion = dataKeys.clientVersion;
  const gameDataVersion = dataKeys.dataVersion;

  //Logic to check battle for messages here
  try {
    const url = `https://www.streamraiders.com/api/game/?cn=getActiveRaidsLite&clientVersion=${clientVersion}&clientPlatform=WebLite&gameDataVersion=${gameDataVersion}&command=getActiveRaidsLite&isCaptain=0`
    const response = await makeRequest(url, 0);

    return response

  } catch (error) {
    return null
  }
}

async function makeRequest(url, retryCount) {
  if (reloadRunning) {
    return;  
  }
  requestRunning = true;
  try {
    if (retryCount >= 1) {
      console.error(new Date().toLocaleTimeString(), new Date().getSeconds(),new Date().getMilliseconds(), "Trying...:", url, retryCount, reloadRunning);
    }

    const dataArray = ['clientVersion', 'dataVersion'];
    const dataKeys = await retrieveMultipleFromStorage(dataArray);
    const clientVersion = dataKeys.clientVersion;
    const gameDataVersion = dataKeys.dataVersion;
    let parsedUrl = url.split("&");
    let apiUrl = parsedUrl[0];

    let cookieString = document.cookie;
    
    let response;
    let xhr = new XMLHttpRequest();
    let data = url.replace(apiUrl + "&","");
    
    xhr.open("POST", apiUrl, false);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader("Accept", "application/json, text/plain, */*");
    xhr.setRequestHeader("Priority", "u=1, i");
    xhr.setRequestHeader("Protocol", clientVersion);
    xhr.onload = function (e) {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          response = JSON.parse(xhr.responseText);
        } else {
          console.error(xhr.statusText);
        }
      }
    };
    xhr.onerror = function (e) {
      console.error(xhr.statusText);
    };
    xhr.send(data);

    if (xhr.status !== 200 || response == null || response == undefined) {
        throw new Error('Network response was not ok');
    }
    requestRunning = false;
    return response
  } catch (error) {
    retryCount++;
    console.error(new Date().toLocaleTimeString(), "Error retrieving response:", error, url, retryCount);
    if (retryCount < 5) {
      response = await makeRequest(url, retryCount);
      requestRunning = false;
      return response;
    } else {
      requestRunning = false;
      return null;
    }
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
  for (let i = 0; i < activeRaids.data.length; i++) {
    let activeRaid = activeRaids.data[i];
    for (index in activeRaidsArray) {
      if (activeRaidsArray[index].userSortIndex == activeRaid.userSortIndex) activeRaidsArray.splice(index, 1);
    }
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
