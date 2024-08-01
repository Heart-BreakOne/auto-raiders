//Declaring variables
let isRunning = false;
let requestRunning = false;
let activeRaidsArray = [];
let isEventCurrencyActive;
let allRewardUrls = {};
let lastUserUnitsUpdated;

function getRandNum(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

async function logChestsAndUnitsInterval() {
	let intervalKeysArray = ['paused_checkbox', 'offlineSwitch'];
	let intervalKeys = await retrieveMultipleFromStorage(intervalKeysArray);
	let paused_checkbox = intervalKeys.paused_checkbox;
	let offlineSwitch = intervalKeys.offlineSwitch;

	if (paused_checkbox) return;
	try {
		let activeRaids = activeRaidsArray;
		if (requestRunning || activeRaids == undefined || activeRaids == null || (activeRaids.length == 1 && activeRaids[0].twitchDisplayName == "")) return;
		requestRunning = true;
		await checkBattleMessages(activeRaids);
		await manageGameModes(activeRaids);
		await addNewLogEntry(activeRaids);
		//Checks if the user wants to replace idle captains and invoke the function to check and replace them.
		if (offlineSwitch) await updateRunningCaptains(activeRaids);
		requestRunning = false;
	} catch (error) {
		console.error('Error in logChestsAndUnitsInterval:', error);
		return;
	}
}

async function getCaptainLoyalty(captainName) {
	try {
		let response = activeRaidsArray;
		if (response == undefined) return;

		const activeRaids = response;
		let loyaltyResults = {};
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
		let chests = await retrieveFromStorage("loyaltyChests");
		chests = chests.MapNodes;

		const chestType = chests[nodeId]?.ChestType;
		return chestType;

	} catch (error) {
		console.error('Error in getRaidChest:', new Date().toLocaleTimeString(), error);
		return "chestbronze";
	}
}

async function getLeaderboardUnitsData(getRaid) {
	if (await retrieveFromStorage("paused_checkbox")) return;

	const dataArray = ['userId', 'units', 'skins', 'imageUrls'];
	const dataKeys = await retrieveMultipleFromStorage(dataArray);
	const userId = dataKeys.userId;
	const unitAssetNames = dataKeys.units;
	const skinNames = dataKeys.skins;
	const imageURLs = dataKeys.imageUrls;
	let filteredImageURLs = {};
	Object.keys(imageURLs).forEach(function (key) {
		if (key.startsWith("mobilelite/units/static/")) {
			filteredImageURLs[key] = imageURLs[key];
			return;
		}
	});

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
				if (placement.userId === userId && placement.team === "Ally") {
					if (placement.CharacterType === null || placement.CharacterType === "") {
						CharacterType = "none";
					} else {
						CharacterType = placement.CharacterType;
					}
					if (placement.skin === null || placement.skin === "") {
						Object.keys(unitAssetNames).forEach(function (key) {
							const uid = unitAssetNames[key].Uid;
							if (uid === CharacterType) skin = unitAssetNames[key].AssetName;
						});
					} else {
						skin = placement.skin;
						Object.keys(skinNames).forEach(function (key) {
							if (key === placement.skin) skin = skinNames[key].BaseAssetName;
						});
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
					Object.keys(filteredImageURLs).forEach(function (key) {
						if (key === "mobilelite/units/static/" + skin + ".png") skinURL = "https://d2k2g0zg1te1mr.cloudfront.net/" + filteredImageURLs[key];
					});
					unitIconList = skinURL + " " + skin.replace("allies", "").replace("skinFull", "") + " " + CharacterType + " " + SoulType + " " + specializationUid + "," + unitIconList;
				}
			}
		}

		if (unitIconList !== "") await setLogUnitsData(cptName, raidId, unitIconList);
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
		let raidStats = {};
		let rewards = {};

		const dataArray = ['userId', 'items', 'currency', 'skins', 'imageUrls', 'getEventProgressionLite'];
		const dataKeys = await retrieveMultipleFromStorage(dataArray);
		const userId = dataKeys.userId;
		const items = dataKeys.items;
		const currency = dataKeys.currency;
		const skins = dataKeys.skins;
		const imageURLs = dataKeys.imageUrls;
		let filteredImageURLs = {};
		Object.keys(imageURLs).forEach(function (key) {
			if (key.startsWith("mobilelite/units/static/") || key.startsWith("mobilelite/events/")) {
				filteredImageURLs[key] = imageURLs[key];
				return;
			}
		});
		let eventUid = dataKeys.getEventProgressionLite;
		eventUid = eventUid.data.eventUid;

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
				rewards[i] = "/icons/iconGold.png";
				rewards[i] = rewards[i] + " goldpiecebagx" + raidData.goldAwarded;
				i++;
			}
		} catch (error) {
			console.log(error);
		}
		try {
			if (raidData.bonesAwarded > 0) {
				rewards[i] = "/icons/iconBones.png";
				rewards[i] = rewards[i] + " bonesx" + raidData.bonesAwarded;
				raidStats[5] = "bones";
				i++;
			}
		} catch (error) {
			console.log(error);
		}
		try {
			if (raidData.keysAwarded > 0) {
				rewards[i] = "/icons/keys.png";
				rewards[i] = rewards[i] + " keysx" + raidData.keysAwarded;
				raidStats[5] = "keys";
				i++;
			}
		} catch (error) {
			console.log(error);
		}
		try {
			if (raidData.rubiesAwarded > 0) {
				rewards[i] = "/icons/rubies.png";
				rewards[i] = rewards[i] + " rubiesx" + raidData.rubiesAwarded;
				raidStats[5] = "rubies";
				i++;
			}
		} catch (error) {
			console.log(error);
		}
		try {
			if (raidData.eventCurrencyAwarded > 0) {
				rewards[i] = "";

				Object.keys(filteredImageURLs).forEach(function (key) {
					if (key === "mobilelite/events/" + eventUid + "/iconEventCurrency.png") rewards[i] = "https://d2k2g0zg1te1mr.cloudfront.net/" + filteredImageURLs[key];
				});
				rewards[i] = rewards[i] + " eventcurrencyx" + raidData.eventCurrencyAwarded;
				i++;
			}
		} catch (error) {
			console.log(error);
		}
		try {
			if (raidData.treasureChestGold != "0") {
				rewards[i] = "/icons/iconGold.png";
				rewards[i] = rewards[i] + " treasurechestgoldx" + raidData.treasureChestGold;
				i++;
			}
		} catch (error) {
			console.log(error);
		}
		try {
			if (raidData.potionsAwarded != "0") {
				rewards[i] = "/icons/iconPotion.png";
				rewards[i] = rewards[i] + " epicpotionx" + raidData.potionsAwarded;
				i++;
			}
		} catch (error) {
			console.log(error);
		}
		try {
			if (raidData.bonusItemReceived !== "" && raidData.bonusItemReceived !== null) {
				rewards[i] = await getRewardUrl(raidData.bonusItemReceived, eventUid, items, currency, filteredImageURLs, skins);
				rewards[i] = rewards[i] + " " + raidData.bonusItemReceived;
				i++;
			}
		} catch (error) {
			console.log(error);
		}
		try {
			if (raidData.eventTokensReceived != "0") {
				rewards[i] = "";
				Object.keys(filteredImageURLs).forEach(function (key) {
					if (key === "mobilelite/events/" + eventUid + "/iconEventToken.png") rewards[i] = "https://d2k2g0zg1te1mr.cloudfront.net/" + filteredImageURLs[key];
				});
				rewards[i] = rewards[i] + " eventtokenx" + raidData.eventTokensReceived;
				i++;
			}
		} catch (error) {
			console.log(error);
		}
		try {
			if (raidData.viewerChestRewards !== undefined && raidData.viewerChestRewards !== null) {
				for (var k = 0; k < raidData.viewerChestRewards.length; k++) {
					rewards[i] = await getRewardUrl(raidData.viewerChestRewards[k], eventUid, items, currency, filteredImageURLs, skins);
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
		if (raidStats[2] == "") raidStats[2] = "None";
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

		console.log("LOG-before-logged data for " + captainName + raidId);
		if (captainName !== null && captainName !== undefined && raidId !== null && raidId !== undefined && ((battleResult !== null && battleResult !== undefined) || (chestStringAlt !== null && chestStringAlt !== undefined) || (leaderboardRank !== null && leaderboardRank !== undefined) || (kills !== null && kills !== undefined) || (assists !== null && assists !== undefined) || (unitIconList !== null && unitIconList !== undefined) || (rewards !== null && rewards !== undefined) || (raidChest !== null && raidChest !== undefined) || (chestCount !== null && chestCount !== undefined))) {
			await setLogResults(battleResult, captainName, chestStringAlt, leaderboardRank, kills, assists, unitIconList, rewards, raidId, raidChest, chestCount);
			console.log('await setLogResults("' + battleResult + '", "' + captainName + '", "' + chestStringAlt + '", "' + leaderboardRank + '", "' + kills + '", "' + assists + '", "' + unitIconList + '", "' + rewards + '", "' + raidId + '", "' + raidChest + '", ' + chestCount + ')');
		}
	} catch (error) {
		console.error('Error in getRaidStats:', new Date().toLocaleTimeString(), error);
		return "";
	}
}

async function getRewardUrl(reward, eventUid, items, currency, imageURLs, skins) {
	let url = "";
	if (reward.includes("goldbag") || reward.includes("gold_x")) {
		url = "/icons/iconGold.png";
	} else if (reward.includes("skinticket")) {
		url = "/icons/skinTicket.png";
	} else if (reward.includes("epicpotion")) {
		url = "/icons/iconPotion.png";
	} else if (reward.includes("mythicbox_finalreward")) {
		url = "/icons/rubies.png";
	} else if (reward.includes("mythicbox_jackpot")) {
		url = "/icons/iconGold.png";
	} else if (reward.includes("cooldown") || reward.includes("meat_x")) {
		url = "/icons/iconMeat.png";
	} else if (reward.includes("eventtoken")) {
		if (allRewardUrls.hasOwnProperty(eventUid)) {
			url = allRewardUrls[eventUid].Url;
		} else {
			Object.keys(imageURLs).forEach(function (key) {
				if (key === "mobilelite/events/" + eventUid + "/iconEventToken.png") {
					url = "https://d2k2g0zg1te1mr.cloudfront.net/" + imageURLs[key];
					allRewardUrls[eventUid] = { Url: url };
					return;
				}
			});
		}
	} else if (reward.includes("skin")) {
		let skin;
		Object.keys(skins).forEach(function (key) {
			if (key === reward) {
				skin = skins[key].BaseAssetName;
				return;
			}
		});
		Object.keys(imageURLs).forEach(function (key) {
			if (key === "mobilelite/units/static/" + skin + ".png") {
				url = "https://d2k2g0zg1te1mr.cloudfront.net/" + imageURLs[key];
				return;
			}
		});
	} else {
		let item;
		let itemReceived;
		if (reward.includes("|")) {
			itemReceived = reward.split("|")[1];
		} else {
			itemReceived = reward;
		}
		if (allRewardUrls.hasOwnProperty(itemReceived)) {
			url = allRewardUrls[itemReceived].Url;
		} else {
			Object.keys(items).forEach(function (key) {
				if (key === itemReceived) {
					item = items[key].CurrencyTypeAwarded;
					return;
				}
			});
			Object.keys(currency).forEach(function (key) {
				if (key === item) {
					item = currency[key].UnitAssetName;
					return;
				}
			});
			Object.keys(imageURLs).forEach(function (key) {
				if (key === "mobilelite/units/static/" + item + ".png") {
					url = "https://d2k2g0zg1te1mr.cloudfront.net/" + imageURLs[key];
					allRewardUrls[itemReceived] = { Url: url };
					return;
				}
			});
		}
	}
	return url;
}

//Initialize arrays with null values, get authentication cookies and make requests for the data of interest.
async function checkBattleMessages(activeRaids) {
	if (isRunning) return;
	isRunning = true;

	//Logic to check battle for messages here
	try {
		//Get relevant data from activeRaids and save on storage so it can be displayed to the user
		let battleMessageData = [];
		for (let i = 0; i < activeRaids.length; i++) {
			const position = activeRaids[i];
			const cptName = position.twitchDisplayName;
			const message = position.message;
			battleMessageData.push({ cptName, message });
		}
		//Save battleMessageData on storage
		await chrome.storage.local.set({ battleMessageData: battleMessageData });
		isRunning = false;
	} catch (error) {
		console.error('Error while getting battle messages', new Date().toLocaleTimeString(), error);
		isRunning = false;
	}
	isRunning = false;
}

/*
raidState values

11		In Captain Planning Period
4		In Placement Period
7		Waiting for Captain to start Battle!
Cycle restarts.
The period between 7 and 11 is the time the captain idled or took to hand out rewards
The captain can spend a lot of time on state 1, not a useful marker in my opinion.
1		Waiting on Captain to find Battle
And state 10 can take several minutes while the captain hands out the rewards or mere seconds if the captain doesn't care. If the crawler is not running on this timeframe, it misses.
10		Waiting for Captain to collect reward! 
So effectively, the time between 11 and 7 is the battle time. The time between 7 and 11 is the downtime.
5		Battle ready soon (can't place)

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
		if (!response.ok) throw new Error('Network response was not ok');
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
			return unitId;
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
		dungeonRaidInfo[9] = raidId;
		await chrome.storage.local.set({ "dungeonRaidInfo": dungeonRaidInfo });
	}
}

async function checkEventCurrencyActive() {
	if (isEventCurrencyActive == null || isEventCurrencyActive == undefined) {
		let eventData = await retrieveFromStorage("events");
		let currentDateTime = new Date();
		let currentDateTimePT = new Date(currentDateTime.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
		isEventCurrencyActive = false;
		for (let event in eventData) {
			if (eventData[event].StartTime <= currentDateTimePT && eventData[event].EndTime > currentDateTimePT && eventData[event].EventCurrency != "") isEventCurrencyActive = true;
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
		if (eventTiers == undefined) await locationReload();
		//If the event tiers eventUid doesn't match the eventUid in getEventProgressionLite, reload to update it
		let counter = 0;
		for (const nodeKey in eventTiers) {
			counter++;
			const node = eventTiers[nodeKey];
			if (node.EventUid != eventUid) await locationReload();
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

		//If the user units haven't been checked/updated in the last 10 minutes, do it now
		if (!lastUserUnitsUpdated || new Date().getTime() - lastUserUnitsUpdated > 10 * 60 * 1000) {
			lastUserUnitsUpdated = new Date().getTime();
			let userUnits = await retrieveFromStorage("unitList");

			if (!userUnits) return;
			let gameUnits = data.data;
			//Find the matching user unit and update the level to match the game unit
			for (let i in gameUnits) {
				//If the game unit level is less than 30, compare it to the user unit level
				if (gameUnits[i].level < 30) {
					for (let j in userUnits) {
						//If the unitType matches, the user unit level is less than 30, and the levels don't match, update the user unit level
						for (let n = 0; n <= 7; n++) {
							if (userUnits[j].slotOption == n && userUnits[j].unitType == gameUnits[i].unitType && userUnits[j].level < 30 && userUnits[j].level !== gameUnits[i].level) userUnits[j].level = gameUnits[i].level;
						}
					}
				}
			}
			console.log(`User Unit Count: ${userUnits.length / 8} | Game Unit Count: ${gameUnits.length}`)
			//Find the user units that still have no matching game unit. Iterate in reverse order because units may need to be removed
			for (let j = userUnits.length - 1; j >= 0; j--) {
				//If the user unit level is less than 30, check the game units to ensure one matches, otherwise the user leveled it up to 30
				if (userUnits[j].level < 30) {
					let unitDone = false;
					for (let i in gameUnits) {
						//If the unitType matches and the game unit level is less than 30, then make the levels match (if they don't already) and set a variable to mark the unit as done
						if (userUnits[j].unitType == gameUnits[i].unitType && gameUnits[i].level < 30) {
							if (userUnits[j].level !== gameUnits[i].level) userUnits[j].level == gameUnits[i].level;
							unitDone = true;
						}
					}
					//If the unit was not marked as done, set the level to 30 
					if (!unitDone) userUnits[j].level = '30';
				}
				//Count the number of level 30 units with the same unitType for both user units and game units to compare
				if (userUnits[j].level == 30) {
					let counterUserUnits = 0;
					for (let k in userUnits) {
						if (userUnits[k].unitType == userUnits[j].unitType && userUnits[k].level == 30 && userUnits[k].slotOption == userUnits[j].slotOption) counterUserUnits++
					}
					let counterGameUnits = 0;
					for (let m in gameUnits) {
						if (gameUnits[m].unitType == userUnits[j].unitType && gameUnits[m].level == 30) counterGameUnits++
					}
					//If there are more user units than game units, remove a user unit (the user sacrificed one to get a soul)
					if (counterUserUnits > counterGameUnits) {
						console.log(`Removing ${userUnits[j].level} ${userUnits[j].unitType} ${userUnits[j].slotOption}`);
						userUnits.splice(j, 1);
						//If there are fewer user units than game units, add a user unit (the user created a dupe)
						//Set the priority to 0 since we don't know what priority the user wants this new unit set to. They can eventually set it manually.
					} else if (counterUserUnits < counterGameUnits) {
						console.log(`Adding ${userUnits[j].unitType}`);
						let index = +gameUnits.length + 1;
						userUnits.push({
							"index": `${index}`,
							"level": "30",
							"priority": "0",
							"slotOption": userUnits[j].slotOption,
							"unitType": userUnits[j].unitType
						});
					}
				}
				//Count the number of < level 30 units with the same unitType for both user units and game units to compare
				let counterUserUnits2 = 0;
				for (let k in userUnits) {
					if (userUnits[k].unitType == userUnits[j].unitType && userUnits[k].level < 30 && userUnits[k].slotOption == userUnits[j].slotOption) {
						counterUserUnits2++;
						k = userUnits.length;
					}
				}
				let counterGameUnits2 = 0;
				let gameUnitLevel;
				for (let m in gameUnits) {
					if (gameUnits[m].unitType == userUnits[j].unitType && gameUnits[m].level < 30) {
						counterGameUnits2++;
						gameUnitLevel = gameUnits[m].level;
						m = gameUnits.length;
					}
				}
				//If there are more user units than game units, remove a user unit (the user sacrificed one to get a soul)
				if (counterUserUnits2 > counterGameUnits2) {
					console.log(`Removing ${userUnits[j].level} ${userUnits[j].unitType} ${userUnits[j].slotOption}`);
					userUnits.splice(j, 1);
					//If there are fewer user units than game units, add a user unit (the user created a dupe)
					//Set the priority to 0 since we don't know what priority the user wants this new unit set to. They can eventually set it manually.
				} else if (counterUserUnits2 < counterGameUnits2) {
					console.log(`Adding ${userUnits[j].unitType}`);
					let index = +gameUnits.length + 1;
					userUnits.push({
						"index": `${index}`,
						"level": `${gameUnitLevel}`,
						"priority": "0",
						"slotOption": userUnits[j].slotOption,
						"unitType": userUnits[j].unitType
					});
				}
			}
			console.log(`User Unit Count: ${userUnits.length / 8}(${userUnits.length}) | Game Unit Count: ${gameUnits.length}`)
			await chrome.storage.local.set({ "unitList": userUnits });
		}
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
			captainSearchData.push({ "timestamp": new Date().getTime(), ...captainSearchResults[i] });
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
			});
		}
		await saveToStorage("userChests", userChestData);
		await saveToStorage("userChestsLog", userChestLogData);
	}
	else if (url == "https://www.streamraiders.com/api/game/?cn=purchaseBoxItem") {
		//Save box results to log
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
			});
		}
		await saveToStorage("userChests", userChestData);
		await saveToStorage("userChestsLog", userChestLogData);
	}
}

async function getActiveRaidsLite(activeRaids) {
	activeRaidsArrayOld = activeRaidsArray;
	activeRaidsArray = [];
	for (let i = 0; i < activeRaids.data.length; i++) {
		let activeRaid = activeRaids.data[i];
		let chestType;
		for (let j = 0; j < activeRaidsArrayOld.length; j++) {
			let activeRaidOld = activeRaidsArrayOld[j];
			if (activeRaidOld.raidId == activeRaid.raidId) {
				if (activeRaid.nodeId == activeRaidOld.nodeId && activeRaidOld.chestType) {
					chestType = activeRaidOld.chestType;
				} else {
					chestType = await getRaidChest(activeRaid.nodeId);
				}
				j = activeRaidsArrayOld.length;
			}
		}
		activeRaidsArray.push({
			"twitchDisplayName": activeRaid.twitchDisplayName,
			"twitchUserName": activeRaid.twitchUserName,
			"captainId": activeRaid.captainId,
			"userSortIndex": activeRaid.userSortIndex,
			"raidId": activeRaid.raidId,
			"nodeId": activeRaid.nodeId,
			"chestType": chestType,
			"opponentTwitchDisplayName": activeRaid.opponentTwitchDisplayName,
			"type": activeRaid.type,
			"isCodeLocked": activeRaid.isCodeLocked,
			"pveWins": activeRaid.pveWins,
			"message": activeRaid.message,
            "hasViewedResults": activeRaid.hasViewedResults,
            "postBattleComplete": activeRaid.postBattleComplete
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
			"pveWins": "",
			"message": "",
            "hasViewedResults": "",
            "postBattleComplete": ""
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
	];
	let currency = data.sheets.Currency;
	currency = removeKeys(currency, currency_keys_rm);

	const items_keys_rm = ["DisplayName", "IsInRandomPool", "Rarity", "Uid"];
	let items = data.sheets.Items;
	items = removeKeys(items, items_keys_rm);

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
		"WeakAgainstTagsList"];
	const units = data.sheets.Units;
	const unitsArray = Object.values(units);
	let filteredUnits = unitsArray.filter(unit => unit.PlacementType === "viewer");
	filteredUnits = removeKeys(filteredUnits, units_keys_rm);

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
		"Uid"];
	let skins = data.sheets.Skins;
	skins = removeKeys(skins, skins_keys_rm);

	const store_keys_rm = ["CaptainBasePrice",
		"CaptainQuantity",
		"CaptainSalePrice",
		"DefaultItemUid",
		"SaleEndTime",
		"SalePrice",
		"SaleStartTime",
		"SlotNumber"];
	let store = data.sheets.Store;
	store = removeKeys(store, store_keys_rm);

	let userChests = await retrieveFromStorage("userChests");
	if (userChests) {
		for (let i = 0; i < userChests.length; i++) {
			for (let j = 0; j < store.length; j++) {
				if (userChests[i].hasOwnProperty(store[j].Uid) && userChests[i].canBuy) {
					const liveEndTime = new Date(store[j].LiveEndTime);
					const currentDate = new Date();
					const currentUTCTime = Date.UTC(
						currentDate.getUTCFullYear(),
						currentDate.getUTCMonth(),
						currentDate.getUTCDate(),
						currentDate.getUTCHours(),
						currentDate.getUTCMinutes(),
						currentDate.getUTCSeconds()
					);

					if (currentUTCTime > liveEndTime.getTime()) userChests[i].canBuy = false;

					j = store.length;
				}
			}
		}
		await chrome.storage.local.set({ 'userChests': userChests });
	}

	let chestRewardSlots = data.sheets.ChestRewardSlots;
	let boxesRewardSlots = data.sheets.BoxesRewardSlots;

	const map_keys_rm = ["NodeDifficulty", "NodeType", "MapTags", "OnLoseDialog", "OnStartDialog", "OnWinDialog"]
	let mapNodes = data.sheets.MapNodes;
	mapNodes = removeKeys(mapNodes, map_keys_rm);

	const transformedJson = {
		url: url,
		MapNodes: mapNodes
	};

	const events_keys_rm = ["BannerAsset", "Customizations", "Description", "MapNodeSpecialAsset", "PreviewLegendaryAsset1", "PreviewLegendaryAsset2", "PreviewLegendaryAsset3", "PreviewSkinAsset1", "PreviewSkinAsset2", "PreviewSkinAsset3", "PreviewSkinAsset4", "PreviewSkinAsset5", "PreviewSkinAsset6", "PreviewSkinAsset7", "PreviewSkinAsset7Epic", "TeaserTime", "WorldIndex"];
	let events = data.sheets.Events;
	events = removeKeys(events, events_keys_rm);

	const chests_keys_rm = ["BonusSlots", "BuyButtonMessageOverride", "CaptainSlots", "CharityChestEventUid", "CharityChestReward", "ClosedIcon", "GrandPrizeIcon", "IsBoosted", "IsCharity", "OpenCountMessageOverride", "OpenIcon", "RewardDescription", "RewardDescription2", "RewardOpenCountDescriptionOverride", "ShowOpenCount", "TrackOpenCount"];
	let chests = data.sheets.Chests;
	chests = removeKeys(chests, chests_keys_rm);

	const chest_rewards_keys_rm = ["ItemUid"];
	let chestRewards = data.sheets.ChestRewards;
	chestRewards = removeKeys(chestRewards, chest_rewards_keys_rm);

	const boxes_keys_rm = ["CaptainBasicSlots", "CaptainBoxSlot", "ClosedIcon", "OpenIcon"];
	let boxes = data.sheets.Boxes;
	boxes = removeKeys(boxes, boxes_keys_rm);

	const eventTiers_keys_rm = ["Badge", "BasicRewardImageOverride", "BattlePassRewardImageOverride", "Requirement"];
	let eventTiers = data.sheets.EventTiers;
	eventTiers = removeKeys(eventTiers, eventTiers_keys_rm);

	let eventUid = await retrieveFromStorage("getEventProgressionLite");
	if (eventUid) eventUid = eventUid.data.eventUid;

	for (const nodeKey in eventTiers) {
		const node = eventTiers[nodeKey];
		if (node.EventUid != eventUid) delete eventTiers[nodeKey];
	}

	const quests_keys_rm = ["AssetPathOverride", "AssetScaleOverride", "AutoCompleteCost", "CompletionCooldown", "CurrencyIdRequirement", "CurrencyMaxRequirement", "CurrencyMinRequirement", "QuestIds", "UnitAsset", "UnitLevelRequirement", "UnitTypeRequirement"];
	let quests = data.sheets.Quests;
	quests = removeKeys(quests, quests_keys_rm);

	await chrome.storage.local.set({ "loyaltyChests": transformedJson, "currency": currency, "items": items, "units": filteredUnits, "skins": skins, "store": store, "chestRewardSlots": chestRewardSlots, "boxesRewardSlots": boxesRewardSlots, "events": events, "chests": chests, "chestRewards": chestRewards, "boxes": boxes, "eventTiers": eventTiers, "quests": quests });

	console.log("Game data successfully fetched and saved to chrome storage.");
}

function removeKeys(items, keysToRemove) {
	for (const nodeKey in items) {
		const node = items[nodeKey];
		for (const keyToRemove of keysToRemove) {
			delete node[keyToRemove];
		}
	}
	return items;
}
