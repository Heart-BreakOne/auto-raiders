//RETURNS raidId and CHESTTYPE (returns "chestbronze" if not found or if error)
async function getCaptainLoyalty(captainName) {
    //Get client and game version for http request
    const response = await fetch('https://www.streamraiders.com/api/game/?cn=getUser&command=getUser');
    const data = await response.json();
    if (data && data.info && data.info.version && data.info.clientVersion) {
      clientVersion = data.info.version;
      gameDataVersion = data.info.dataVersion;
    }
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
        const cptName = position.twitchDisplayName;
        if (cptName === captainName) {
          loyaltyResults[0] = raidId;
          loyaltyResults[1] = "chestbronze";
          const mapLoyalty = await getRaidChest(raidId);
          loyaltyResults[1] = mapLoyalty;
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
async function getRaidChest(raidId) {
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
      const raid_url = currentRaid.info.dataPath
      let chests = await new Promise((resolve) => {
        chrome.storage.local.get("loyaltyChests", async function (lChests) {
          let update = false;
          let storage_url;
          let new_chests;
          let get_chests
          if (!lChests.loyaltyChests) {
            new_chests = await fetchLoyaltyChests(raid_url);
            await new Promise((resolve) => {
              chrome.storage.local.set({ "loyaltyChests": new_chests }, resolve);
            });
            update = true;
          }
  
          if (update) {
            storage_url = new_chests.url;
            get_chests = new_chests.MapNodes;
          } else {
            storage_url = lChests.url;
            get_chests = lChests.MapNodes;
          }
  
          if (raid_url !== storage_url) {
            new_chests = await fetchLoyaltyChests(raid_url);
            await new Promise((resolve) => {
              chrome.storage.local.set({ "loyaltyChests": new_chests }, resolve);
            });
            storage_url = new_chests.url;
            get_chests = new_chests.MapNodes;
          }
  
          resolve(get_chests);
        });
      });
  
      const nodeKeys = [];
  
      for (const key in chests) {
        if (chests.hasOwnProperty(key)) {
          nodeKeys.push(key);
        }
      }
  
      const nodeId = currentRaid.data.nodeId;
      const chestType = chests[nodeId].ChestType;
      return chestType;
  
    } catch (error) {
      console.error('Error in getRaidChest:', error);
      return "chestbronze";
    }
  }


  async function fetchLoyaltyChests(raid_url) {
    try {
      const response = await fetch(raid_url);
      const blob = await response.blob();
      const corsResponse = new Response(blob, { headers: { 'Access-Control-Allow-Origin': '*' } });
  
      const data = await corsResponse.json();
      const mapNodes = data["sheets"]["MapNodes"]
      for (const nodeKey in mapNodes) {
        const node = mapNodes[nodeKey];
        for (const keyToRemove of ["NodeDifficulty", "NodeType", "MapTags", "OnLoseDialog", "OnStartDialog", "OnWinDialog"]) {
          delete node[keyToRemove];
        }
      }
      const transformedJson = {
        url: raid_url,
        MapNodes: mapNodes
      };
  
      return transformedJson
    } catch (error) {
      console.log("There was an error fetching the map nodes")
    }
  }
  
  async function getLeaderboardUnitsData(raidId) {
    const response = await fetch('https://www.streamraiders.com/api/game/?cn=getUser&command=getUser');
    const userData = await response.json();
    const userId = userData.data.userId;
  
    let unitAssetNames = await fetchUnitAssetNames(userData.info.dataPath)
    let skinNames = await fetchSkinNames(userData.info.dataPath);
    let imageURLs = await fetchImageURLs("https://d2k2g0zg1te1mr.cloudfront.net/manifests/mobilelite.json");
    
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
      const raid_url = currentRaid.info.dataPath
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
              Object.keys(unitAssetNames.Units).forEach(function(key) {
                if (key === CharacterType) {
                  skin = unitAssetNames.Units[key].AssetName;
                }
              })
            } else {
              skin = placement.skin;
              
              Object.keys(skinNames.Skins).forEach(function(key) {
                if (key === placement.skin) {
                  skin = skinNames.Skins[key].BaseAssetName;
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
            Object.keys(imageURLs.ImageURLs).forEach(function(key) {
              if (key === "mobilelite/units/static/" + skin + ".png") {
                skinURL = "https://d2k2g0zg1te1mr.cloudfront.net/" + imageURLs.ImageURLs[key];
              }
            })
            unitIconList = skinURL + " " + skin.replace("allies","").replace("skinFull","") + " " + CharacterType + " " + SoulType + " " + specializationUid + "," + unitIconList
          }
        }
      }
  
      return unitIconList;
  
    } catch (error) {
      console.error('Error in getLeaderboardData:', error);
      return "";
    }
  }
  
  async function getRaidStats(raidId) {
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
      } catch (error){
        console.log(error);
      }
      const raidData = currentRaid.data;
      const stats = raidData.stats;
      let raidStats = new Object();
      let rewards = new Object();
      
      const userResponse = await fetch('https://www.streamraiders.com/api/game/?cn=getUser&command=getUser');
      const userData = await userResponse.json();
      const userId = userData.data.userId;
      
      let eventUid = await getEventProgressionLite();
      
      let items = await fetchItems(userData.info.dataPath);
      let currency = await fetchCurrency(userData.info.dataPath)
      let imageURLs = await fetchImageURLs("https://d2k2g0zg1te1mr.cloudfront.net/manifests/mobilelite.json");
  
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
          Object.keys(imageURLs.ImageURLs).forEach(function(key) {
            if (key === "mobilelite/events/" + eventUid + "/iconEventCurrency.png") {
              rewards[i] = "https://d2k2g0zg1te1mr.cloudfront.net/" + imageURLs.ImageURLs[key];
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
          } else if (raidData.viewerChestRewards[k].includes("cooldown")) {
            rewards[i] = "https://d2k2g0zg1te1mr.cloudfront.net/env/prod1/mobile-lite/static/media/iconMeat.5c167903.png";
          } else {
            rewards[i] = "";
            let item;
            let bonusItemReceived;
            if (raidData.bonusItemReceived.includes("|")) {
              bonusItemReceived = raidData.bonusItemReceived.split("|")[1];
            } else {
              bonusItemReceived = raidData.bonusItemReceived;
            }
            Object.keys(items.Items).forEach(function(key) {
              if (key === bonusItemReceived) {
                item = items.Items[key].CurrencyTypeAwarded;
              }
            })
            Object.keys(currency.Currency).forEach(function(key) {
              if (key === item) {
                item = currency.Currency[key].UnitAssetName;
              }
            })
            Object.keys(imageURLs.ImageURLs).forEach(function(key) {
              if (key === "mobilelite/units/static/" + item + ".png") {
                rewards[i] = "https://d2k2g0zg1te1mr.cloudfront.net/" + imageURLs.ImageURLs[key];
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
          Object.keys(imageURLs.ImageURLs).forEach(function(key) {
            if (key === "mobilelite/events/" + eventUid + "/iconEventToken.png") {
              rewards[i] = "https://d2k2g0zg1te1mr.cloudfront.net/" + imageURLs.ImageURLs[key];
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
            } else {
              rewards[i] = "";
              let item;
              let viewerChestRewardItem;
              if (raidData.viewerChestRewards[k].includes("|")) {
                viewerChestRewardItem = raidData.viewerChestRewards[k].split("|")[1];
              } else {
                viewerChestRewardItem = raidData.viewerChestRewards[k]
              }
              Object.keys(items.Items).forEach(function(key) {
                if (key === viewerChestRewardItem) {
                  item = items.Items[key].CurrencyTypeAwarded;
                }
              })
              Object.keys(currency.Currency).forEach(function(key) {
                if (key === item) {
                  item = currency.Currency[key].UnitAssetName;
                }
              })
              Object.keys(imageURLs.ImageURLs).forEach(function(key) {
                if (key === "mobilelite/units/static/" + item + ".png") {
                  rewards[i] = "https://d2k2g0zg1te1mr.cloudfront.net/" + imageURLs.ImageURLs[key];
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
      raidStats[3] = raidData.kills;
      raidStats[4] = raidData.assists;
      //raidStats[5] = raidData.chestAwarded; //this value is set earlier in this function
      raidStats[6] = raidData.raidChest;
      raidStats[7] = raidData.chestCount;
      
      
      return raidStats;
  
    } catch (error) {
      console.error('Error in getRaidStats:', error);
      return "";
    }
  }
  
  async function getEventProgressionLite() {
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
  
  async function fetchSkinNames(data_url) {
    try {
      const response = await fetch(data_url);
      const blob = await response.blob();
      const corsResponse = new Response(blob, { headers: { 'Access-Control-Allow-Origin': '*' } });
  
      const data = await corsResponse.json();
      const skins = data["sheets"]["Skins"]
      const transformedJson = {
        url: data_url,
        Skins: skins
      };
  
      return transformedJson
    } catch (error) {
      console.log("There was an error fetching the skins")
    }
  }
  
  async function fetchUnitAssetNames(data_url) {
    try {
      const response = await fetch(data_url);
      const blob = await response.blob();
      const corsResponse = new Response(blob, { headers: { 'Access-Control-Allow-Origin': '*' } });
  
      const data = await corsResponse.json();
      const units = data["sheets"]["Units"]
      const transformedJson = {
        url: data_url,
        Units: units
      };
  
      return transformedJson
    } catch (error) {
      console.log("There was an error fetching the units")
    }
  }
  
  async function fetchItems(data_url) {
    try {
      const response = await fetch(data_url);
      const blob = await response.blob();
      const corsResponse = new Response(blob, { headers: { 'Access-Control-Allow-Origin': '*' } });
  
      const data = await corsResponse.json();
      const items = data["sheets"]["Items"]
      
      const transformedJson = {
        url: data_url,
        Items: items
      };
  
      return transformedJson
    } catch (error) {
      console.log("There was an error fetching the items")
    }
  }
  
  async function fetchCurrency(data_url) {
    try {
      const response = await fetch(data_url);
      const blob = await response.blob();
      const corsResponse = new Response(blob, { headers: { 'Access-Control-Allow-Origin': '*' } });
  
      const data = await corsResponse.json();
      const currency = data["sheets"]["Currency"]
      
      const transformedJson = {
        url: data_url,
        Currency: currency
      };
  
      return transformedJson
    } catch (error) {
      console.log("There was an error fetching the currency")
    }
  }
  
  async function fetchImageURLs(mobilelite_url) {
    let contentScriptPort = chrome.runtime.connect({ name: "content-script" });
    return new Promise((resolve, reject) => {
      const responseListener = (response) => {
        clearTimeout(timeout);
        // Handle the response (true/false)
        if (response !== undefined) {
          resolve(response.response);
        } else {
          reject(new Error('Invalid response format from the background script'));
        }
        contentScriptPort.onMessage.removeListener(responseListener);
      };
  
      const timeout = setTimeout(() => {
        reject(new Error('Timeout while waiting for response'));
        contentScriptPort.onMessage.removeListener(responseListener);
      }, 8000);
  
      contentScriptPort.onMessage.addListener(responseListener);
  
      contentScriptPort.postMessage({ action: "getImageURLs", mobilelite_url });
    });
  }