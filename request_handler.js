setInterval(collectChests, 10000);
setInterval(getLeaderboardUnitsData, 10000);

//Declaring variables
let isRunning = false;
let backgroundDelay = ms => new Promise(res => setTimeout(res, ms));

//RETURNS raidId and CHESTTYPE (returns "chestbronze" if not found or if error)
async function getCaptainLoyalty(captainName) {

  const clientVersion = await retrieveFromStorage("clientVersion")
  const gameDataVersion = await retrieveFromStorage("dataVersion")

  try {
    let cookieString = document.cookie;
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
    let loyaltyResults = new Object();
    for (let i = 0; i < activeRaids.data.length; i++) {
      const position = activeRaids.data[i];
      const raidId = position.raidId;
      const cptId = position.captainId;
      const cptName = position.twitchDisplayName;
      if (cptName === captainName) {
        loyaltyResults[0] = raidId;
        const mapLoyalty = await getRaidChest(raidId, clientVersion, gameDataVersion);
        loyaltyResults[1] = mapLoyalty;
        loyaltyResults[2] = cptId;
        loyaltyResults[3] = cptName;
        return loyaltyResults;
      }
    }
    //No match found
    return loyaltyResults;

  } catch (error) {
    console.error('Error in getCaptainLoyalty:', error);
    return loyaltyResults;
  }
}

// MAKE TWO POST REQUESTS, ONE FOR THE CURRENT CHEST AND ANOTHER TO COMPARE
async function getRaidChest(raidId, clientVersion, gameDataVersion) {

  try {
    let cookieString = document.cookie;
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

    const currentRaid = await response.json();
    let chests = await retrieveFromStorage("loyaltyChests")
    chests = chests.MapNodes

    const nodeId = currentRaid.data.nodeId;
    const chestType = chests[nodeId]?.ChestType;
    return chestType;

  } catch (error) {
    console.error('Error in getRaidChest:', error);
    return "chestbronze";
  }
}

async function getLeaderboardUnitsData() {

  if(await retrieveFromStorage("paused_checkbox")) {
    return
  }

  const clientVersion = await retrieveFromStorage("clientVersion")
  const gameDataVersion = await retrieveFromStorage("dataVersion")

  const userId = await retrieveFromStorage("userId")

  let unitAssetNames = await retrieveFromStorage("units")
  let skinNames = await retrieveFromStorage("skins")
  let imageURLs = await retrieveFromStorage("imageUrls");

  try {
    let cookieString = document.cookie;
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
      const cptName = position.twitchDisplayName;

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
      const currentRaid = await response.json();
      const placements = currentRaid.data.placements;
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
            Object.keys(imageURLs).forEach(function(key) {
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
    }
    return "";
  } catch (error) {
    console.error('Error in getLeaderboardData:', error);
    return "";
  }
}

async function collectChests() {

  if(await retrieveFromStorage("paused_checkbox")) {
    return
  }

  const clientVersion = await retrieveFromStorage("clientVersion")
  const gameDataVersion = await retrieveFromStorage("dataVersion")

  try {
    let cookieString = document.cookie;
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

    const activeRaids = await response.json();
    let m = 4 // rows
    let n = 4 // columns
    let activeRaidsData = Array(m).fill().map(entry => Array(n))

    for (let i = 0; i < activeRaids.data.length; i++) {
      let raidData = activeRaids.data[i];      
      if (raidData.postBattleComplete == "1" && raidData.hasRecievedRewards == "0") {
        activeRaidsData[i][0] = raidData.raidId;
        activeRaidsData[i][1] = raidData.twitchDisplayName;
        activeRaidsData[i][2] = raidData.captainId;
        activeRaidsData[i][3] = raidData.userSortIndex;
      }
    }

    for (let j = 0; j < activeRaidsData.length; j++) {
      if (activeRaidsData[j][0] !== undefined) {
        let raidId = activeRaidsData[j][0];
        let captainName = activeRaidsData[j][1];
        let cptId = activeRaidsData[j][2];
        let userSortIndex = activeRaidsData[j][3];
        let raidStats = await getRaidStats(raidId, userSortIndex, cptId);
        let battleResult = raidStats[0];
        let leaderboardRank = raidStats[1];
        let kills = raidStats[3];
        let assists = raidStats[4];
        let unitIconList = raidStats[8];
        let rewards = raidStats[2];
        let chestStringAlt = raidStats[5];
        let raidChest = raidStats[6];
        let chestCount = raidStats[7];

        if (captainName !== null && captainName !== undefined && raidId !== null && raidId !== undefined && ((battleResult !== null && battleResult !== undefined) || (chestStringAlt !== null && chestStringAlt !== undefined) || (leaderboardRank !== null && leaderboardRank !== undefined) || (kills !== null && kills !== undefined) || (assists !== null && assists !== undefined) || (unitIconList !== null && unitIconList !== undefined) || (rewards !== null && rewards !== undefined) || (raidChest !== null && raidChest !== undefined) || (chestCount !== null && chestCount !== undefined))) {
          await setLogResults(battleResult, captainName, chestStringAlt, leaderboardRank, kills, assists, unitIconList, rewards, raidId, raidChest, chestCount);
        }
        battleResult = null;
        captainName = null;
        chestStringAlt = null;
        leaderboardRank = null;
        kills = null;
        assists = null;
        unitIconList = null;
        rewards = null;
      }
    }
  } catch (error) {
    console.error('Error in getAllRewardChests:', error);
    return "";
  }
}

async function getRaidStats(raidId, captSlotId, captId) {

  const clientVersion = await retrieveFromStorage("clientVersion")
  const gameDataVersion = await retrieveFromStorage("dataVersion")

  try {
    let cookieString = document.cookie;
    const response = await fetch(`https://www.streamraiders.com/api/game/?cn=getRaidStatsByUser&raidId=${raidId}&clientVersion=${clientVersion}&clientPlatform=WebLite&gameDataVersion=${gameDataVersion}&command=getRaidStatsByUser&isCaptain=0`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookieString,
      },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const currentRaid = await response.json();
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

    let eventUid = await getEventProgressionLite();

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
      if (raidData.treasureChestGold !== "0") {
        rewards[i] = "https://d2k2g0zg1te1mr.cloudfront.net/env/prod1/mobile-lite/static/media/iconGold.6072909d.png";
        rewards[i] = rewards[i] + " treasurechestgoldx" + raidData.treasureChestGold;
        i++;
      }
    } catch (error) {
      console.log(error);
    }
    try {
      if (raidData.potionsAwarded !== "0") {
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
          Object.keys(imageURLs).forEach(function(key) {
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
      if (raidData.eventTokensReceived !== "0") {
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
            Object.keys(imageURLs).forEach(function(key) {
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

    let slotState;
    let slotNo = parseInt(captSlotId) + 1;
    slotState = await getIdleState("offlineButton_" + slotNo);
    if (slotState == 2) {
      await backgroundDelay(3000);
      await removeOldCaptain(captId);
      const afterSwitch = await retrieveFromStorage('afterSwitch');
      if (afterSwitch) {
        setIdleState("offlineButton_" + slotNo, 1)
      } else {
        setIdleState("offlineButton_" + slotNo, 0)
      }
    }

    return raidStats;

  } catch (error) {
    console.error('Error in getRaidStats:', error);
    return "";
  }
}

async function getEventProgressionLite() {

  const clientVersion = await retrieveFromStorage("clientVersion")
  const gameDataVersion = await retrieveFromStorage("dataVersion")

  try {
    let cookieString = document.cookie;
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
    console.error('Error in getEventProgressionLite:', error);
    return "";
  }
}

async function getMapName(captainName) {

  const clientVersion = await retrieveFromStorage("clientVersion")
  const gameDataVersion = await retrieveFromStorage("dataVersion")

  try {
    let cookieString = document.cookie;

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
      const cptName = position.twitchDisplayName;

      if (cptName === captainName) {
        const mapNode = await getMapNode(raidId);
        return mapNode;
      }
    }

    //No match found
    return "";

  } catch (error) {
    console.error('Error in getMapName:', error);
    return "";
  }
}

async function getMapNode(raidId) {
  
  const clientVersion = await retrieveFromStorage("clientVersion")
  const gameDataVersion = await retrieveFromStorage("dataVersion")

  try {
    let cookieString = document.cookie;
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

    const currentRaid = await response.json();
    const nodeId = currentRaid.data.nodeId;
    return nodeId;

  } catch (error) {
    console.error('Error in getMapNode:', error);
    return "";
  }
}

//Initialize arrays with null values, get authentication cookies and make requests for the data of interest.
async function checkBattleMessages() {

  if (isRunning) {
    return;
  }
  isRunning = true;

  const clientVersion = await retrieveFromStorage("clientVersion")
  const gameDataVersion = await retrieveFromStorage("dataVersion")

  //Logic to check battle for messages here
  try {
    let cookieString = document.cookie;
    const response = await fetch(`https://www.streamraiders.com/api/game/?cn=getActiveRaidsLitecn=getActiveRaidsLite&clientVersion=${clientVersion}&clientPlatform=MobileLite&gameDataVersion=${gameDataVersion}&command=getActiveRaidsLite&isCaptain=0`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookieString,
      },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    //Get relevant data from activeRaids and save on storage so it can be displayed to the user
    const activeRaids = await response.json();
    let battleMessageData = [];
    for (let i = 0; i < activeRaids.data.length; i++) {
      const position = activeRaids.data[i];
      const cptName = position.twitchDisplayName;
      const message = position.message;
      battleMessageData.push({ cptName, message })
    }
    //Save battleMessageData on storage
    await chrome.storage.local.set({ battleMessageData: battleMessageData });
    isRunning = false;
  } catch (error) {
    console.error('Error while getting battle messages', error);
    isRunning = false
  }
  isRunning = false;
}

//Remove current captain
async function removeOldCaptain(captainId) {
  
  const clientVersion = await retrieveFromStorage("clientVersion")
  const gameDataVersion = await retrieveFromStorage("dataVersion")

  try {
    let cookieString = document.cookie;
    const response = await fetch(`https://www.streamraiders.com/api/game/?cn=leaveCaptain&captainId=${captainId}&clientVersion=${clientVersion}&clientPlatform=WebLite&gameDataVersion=${gameDataVersion}&command=leaveCaptain&isCaptain=0`, {
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
  } catch (error) {
    console.error('Error removing captain:', error.message);
    return;
  }
}

async function collectEventReward(eventUid, missingTier, battlePass) {
    
    const clientVersion = await retrieveFromStorage("clientVersion")
    const gameDataVersion = await retrieveFromStorage("dataVersion")
    
    try {
        let cookieString = document.cookie;
        const response2 = await fetch(`https://www.streamraiders.com/api/game/?cn=grantEventReward&eventId=${eventUid}&rewardTier=${missingTier}&collectBattlePass=${battlePass}&clientVersion=${clientVersion}&clientPlatform=MobileLite&gameDataVersion=${gameDataVersion}&command=grantEventReward&isCaptain=0`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': cookieString,
            },
        });

        if (!response2.ok) {
            throw new Error('Network response was not ok');
        }
    } catch(error) {
        console.error('Error collecting event/battlepass rewards:', error.message);
        return;
    }
}

async function getPotionQuantity() {
  
    try {
        let cookieString = document.cookie;
        const response = await fetch('https://www.streamraiders.com/api/game/?cn=getUser&command=getUser');
        const data = await response.json();
        let epicProgression;
        epicProgression = parseInt(data.data.epicProgression);
        return epicProgression;
    } catch(error) {
        console.error('Error getting potion quantity:', error.message);
        return;
    } 
}

async function getStoreRefreshCount() {
  
    try {
        let cookieString = document.cookie;
        const response = await fetch('https://www.streamraiders.com/api/game/?cn=getUser&command=getUser');
        const data = await response.json();
        let storeRefreshCount;
        storeRefreshCount = parseInt(data.data.storeRefreshCount);
        return storeRefreshCount;
    } catch(error) {
        console.error('Error getting storeRefreshCount:', error.message);
        return;
    } 
}

async function getCurrentStoreItems() {

  const clientVersion = await retrieveFromStorage("clientVersion")
  const gameDataVersion = await retrieveFromStorage("dataVersion")

  try {
    let cookieString = document.cookie;
    const response = await fetch(`https://www.streamraiders.com/api/game/?cn=getCurrentStoreItems&clientVersion=${clientVersion}&clientPlatform=WebLite&gameDataVersion=${gameDataVersion}&command=getCurrentStoreItems&isCaptain=0`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookieString,
      },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const storeData = await response.json();
    const storeItems = storeData.data;
    return storeItems;

  } catch (error) {
    console.error('Error in getCurrentStoreItems:', error);
    return "";
  }
}

async function purchaseStoreItem(item) {

  const clientVersion = await retrieveFromStorage("clientVersion")
  const gameDataVersion = await retrieveFromStorage("dataVersion")

  try {
    let cookieString = document.cookie;
    const response = await fetch(`https://www.streamraiders.com/api/game/?cn=purchaseStoreItem&itemId=${item}&clientVersion=${clientVersion}&clientPlatform=WebLite&gameDataVersion=${gameDataVersion}&command=purchaseStoreItem&isCaptain=0`, {
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
    console.error('Error in purchaseStoreItem:', error);
    return;
  }
}

async function purchaseStoreRefresh() {

  const clientVersion = await retrieveFromStorage("clientVersion")
  const gameDataVersion = await retrieveFromStorage("dataVersion")

  try {
    let cookieString = document.cookie;
    const response = await fetch(`https://www.streamraiders.com/api/game/?cn=purchaseStoreRefresh&clientVersion=${clientVersion}&clientPlatform=WebLite&gameDataVersion=${gameDataVersion}&command=purchaseStoreRefresh&isCaptain=0`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookieString,
      },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const storeData = await response.json();
    const storeItems = storeData.data;
    return storeItems;

  } catch (error) {
    console.error('Error in purchaseStoreRefresh:', error);
    return "";
  }
}

async function getUserQuests() {

  const clientVersion = await retrieveFromStorage("clientVersion")
  const gameDataVersion = await retrieveFromStorage("dataVersion")
  const userId = await retrieveFromStorage("userId")

  try {
    let cookieString = document.cookie;
    const response = await fetch(`https://www.streamraiders.com/api/game/?cn=getUserQuests&userId=${userId}&isCaptain=0&gameDataVersion=${gameDataVersion}&command=getUserQuests&clientVersion=${clientVersion}&clientPlatform=WebLite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookieString,
      },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const questsData = await response.json();
    const quests = questsData.data;
    return quests;

  } catch (error) {
    console.error('Error in getUserQuests:', error);
    return "";
  }
}

async function collectQuestReward(questSlotId) {

  const clientVersion = await retrieveFromStorage("clientVersion")
  const gameDataVersion = await retrieveFromStorage("dataVersion")
  const userId = await retrieveFromStorage("userId")

  try {
    let cookieString = document.cookie;
    const response = await fetch(`https://www.streamraiders.com/api/game/?cn=collectQuestReward&userId=${userId}&isCaptain=0&gameDataVersion=${gameDataVersion}&slotId=${questSlotId}&autoComplete=False&command=collectQuestReward&clientVersion=${clientVersion}&clientPlatform=WebLite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookieString,
      },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const questsData = await response.json();
    const quests = questsData.data;
    return quests;

  } catch (error) {
    console.error('Error in collectQuestReward:', error);
    return "";
  }
}

async function grantDailyDrop() {
    
    const clientVersion = await retrieveFromStorage("clientVersion")
    const gameDataVersion = await retrieveFromStorage("dataVersion")
    
    try {
        let cookieString = document.cookie;
        const response2 = await fetch(`https://www.streamraiders.com/api/game/?cn=grantDailyDrop&clientVersion=${clientVersion}&clientPlatform=MobileLite&gameDataVersion=${gameDataVersion}&command=grantDailyDrop&isCaptain=0`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': cookieString,
            },
        });

        if (!response2.ok) {
            throw new Error('Network response was not ok');
        }
    } catch(error) {
        console.error('Error collecting daily reward:', error.message);
        return;
    }
}

async function getCaptainsForSearch(mode) { //mode = "campaign"

  const clientVersion = await retrieveFromStorage("clientVersion")
  const gameDataVersion = await retrieveFromStorage("dataVersion")
  const userId = await retrieveFromStorage("userId")

  try {
    let cookieString = document.cookie;
    let captArray = [];
    let h = 0;
    
    for (let pageNum = 1; pageNum <= 10; pageNum++) {
      const response = await fetch(`https://www.streamraiders.com/api/game/?cn=getCaptainsForSearch&userId=${userId}&isCaptain=0&gameDataVersion=${gameDataVersion}&command=getCaptainsForSearch&page=${pageNum}&resultsPerPage=24&filters={"ambassadors":"false","mode":"${mode}","favorite":"false"}&clientVersion=${clientVersion}&clientPlatform=WebLite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': cookieString,
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      let captData = await response.json();
      if (captData.data.captains != null) {
        let capts = captData.data.captains;
        let captLoyalty = captData.data.pveLoyalty;
        for (let i = 0; i < capts.length; i++) {
          captLoop: for (let j = 0; j < captLoyalty.length; j++) {
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
    console.error('Error in getCaptainsForSearch:', error);
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

async function getFavoriteCaptainIds() {
  
  try {
      const response = await fetch('https://www.streamraiders.com/api/game/?cn=getUser&command=getUser');
      const data = await response.json();
      let favoriteCaptainIds;
      favoriteCaptainIds = data.data.favoriteCaptainIds;
      return favoriteCaptainIds;
  } catch(error) {
      console.error('Error getting favorite captain Ids:', error.message);
      return;
  } 
}

async function joinCaptain(captainId, index) {

  const clientVersion = await retrieveFromStorage("clientVersion")
  const gameDataVersion = await retrieveFromStorage("dataVersion")

  try {
    let cookieString = document.cookie;
    const response = await fetch(`https://www.streamraiders.com/api/game/?cn=addPlayerToRaid&captainId=${captainId}&userSortIndex=${index}&clientVersion=${clientVersion}&clientPlatform=WebLite&gameDataVersion=${gameDataVersion}&command=addPlayerToRaid&isCaptain=0`, {
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
    console.error('Error joining captain:', error.message);
    return;
  }
}

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
    console.error('Error joining captain:', error.message);
    return;
  }
}

//Get every unit the user has
async function fetchUnits() {
  
  const clientVersion = await retrieveFromStorage("clientVersion")
  const gameDataVersion = await retrieveFromStorage("dataVersion")

  try {
    let cookieString = document.cookie;
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
    console.error('Error fetching units:', error.message);
  }
}

async function useCooldownCurrency(unitType, unitLevel) {
  
  const clientVersion = await retrieveFromStorage("clientVersion")
  const gameDataVersion = await retrieveFromStorage("dataVersion")

  let unitArray = await fetchUnits();
  let unitId;
  unit_loop: for (let i = 0; i < unitArray.length; i++) {
    if (unitArray[i].unitType == unitType && unitArray[i].level == unitLevel) {
      unitId = unitArray[i].unitId;
      break unit_loop;
    }
  }
  try {
    let cookieString = document.cookie;
    const response = await fetch(`https://www.streamraiders.com/api/game/?cn=useCooldownCurrency&unitId=${unitId}&clientVersion=${clientVersion}&clientPlatform=WebLite&gameDataVersion=${gameDataVersion}&command=useCooldownCurrency&isCaptain=0`, {
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
    console.error('Error using meat:', error.message);
    return;
  }
}

async function reviveUnit(unitType, unitLevel, captainNameFromDOM) {
  
  const clientVersion = await retrieveFromStorage("clientVersion")
  const gameDataVersion = await retrieveFromStorage("dataVersion")
  const userId = await retrieveFromStorage("userId")
  let requestLoyaltyResults = await getCaptainLoyalty(captainNameFromDOM);
  let raidId = requestLoyaltyResults[0];

  let unitArray = await fetchUnits();
  let unitId;
  unit_loop: for (let i = 0; i < unitArray.data.length; i++) {
    if (unitArray.data[i].unitType == unitType && unitArray.data[i].level == unitLevel) {
      unitId = unitArray.data[i].unitId;
      break unit_loop;
    }
  }
  try {
    let cookieString = document.cookie;
    const response = await fetch(`https://www.streamraiders.com/api/game/?cn=reviveUnit&userId=${userId}&isCaptain=0&gameDataVersion=${gameDataVersion}&command=reviveUnit&unitId=${unitId}&raidId=${raidId}&clientVersion=${clientVersion}&clientPlatform=WebLite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookieString,
      },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    let reviveStatus = await response.json();
    return;
  } catch (error) {
    console.error('Error reviving unit:', error.message);
    return;
  }
}

async function getUnitInfo(unitId) {
  let unitArray = await fetchUnits();
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
  let unitArray = await fetchUnits();
  let unitId;
  unit_loop: for (let i = 0; i < unitArray.data.length; i++) {
    if (unitArray.data[i].unitType == unitType && unitArray.data[i].level == unitLevel) {
      unitId = unitArray.data[i].unitId;
      return unitId
    }
  }
}

async function getUserDungeonInfoForRaid(captainNameFromDOM) {
  
  const clientVersion = await retrieveFromStorage("clientVersion")
  const gameDataVersion = await retrieveFromStorage("dataVersion")
  const userId = await retrieveFromStorage("userId")
  let requestLoyaltyResults = await getCaptainLoyalty(captainNameFromDOM);
  let raidId = requestLoyaltyResults[0];

  try {
    let cookieString = document.cookie;
    const response = await fetch(`https://www.streamraiders.com/api/game/?cn=getUserDungeonInfoForRaid&userId=${userId}&isCaptain=0&gameDataVersion=${gameDataVersion}&command=getUserDungeonInfoForRaid&raidId=${raidId}&clientVersion=${clientVersion}&clientPlatform=WebLite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookieString,
      },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    let dungeonRaidResponse = await response.json();
    let dungeonRaid = dungeonRaidResponse.data;
    let dungeonRaidInfo = [];

    dungeonRaidInfo[0] = dungeonRaid.streak;
    dungeonRaidInfo[1] = dungeonRaid.knockedUnits;
    dungeonRaidInfo[2] = dungeonRaid.recoveredUnits;
    dungeonRaidInfo[3] = dungeonRaid.deadUnits;
    dungeonRaidInfo[4] = dungeonRaid.exhaustedUnits;
    dungeonRaidInfo[5] = dungeonRaid.epicChargesUsed;
    dungeonRaidInfo[6] = dungeonRaid.captainBoons;
    dungeonRaidInfo[7] = dungeonRaid.enemyBoons;
    dungeonRaidInfo[8] = dungeonRaid.completedLevels;

    return dungeonRaidInfo;
  } catch (error) {
    console.error('Error retrieving dungeon info:', error.message);
    return;
  }
}
