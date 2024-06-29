let logRunning = false;

//Observer for changes on the dom
async function addNewLogEntry(activeRaids) {

	if (await retrieveFromStorage("paused_checkbox")) return;

	const logSlots = activeRaids;
	if (logSlots.length === 0) return;

	for (let i = 0; i < logSlots.length; i++) {
		const logSlot = logSlots[i];
		const logId = +logSlot.userSortIndex + 1;
		let logCapName, logMode, currentTime, colorCode;

		try {
			logCapName = logSlot.twitchDisplayName;
			logMode = logSlot.type == 1 ? "Campaign" : logSlot.type == 2 ? "Clash" : logSlot.type == 3 ? "Dungeons" : logSlot.type == 5 ? "Duel" : "";
			currentTime = new Date().toString();

			//Get flag states
			let purpleFlag = await getCaptainFlag(logCapName, 'flaggedCaptains');
			if (!purpleFlag) purpleFlag = await retrieveMaxUnit(logCapName);

			const blueFlag = await getCaptainFlag(logCapName, 'captainLoyalty');

			/*If the current captain is running a special mode and is not the one with the current flag OR
			if the currently flagged captain is not running their assigned special mode they get colored red
			for visual identification */
			if (blueFlag) {
				colorCode = "rgb(185, 242, 255)"; //blue
			}
			else if (purpleFlag) {
				colorCode = "rgb(203, 195, 227)"; //purple
			}
			else {
				let captKeysArray = ['dungeonCaptain', 'clashCaptain', 'duelCaptain', 'campaignCaptain', 'modeChangeSwitch', 'multiClashSwitch'];
				let captKeys = await retrieveMultipleFromStorage(captKeysArray);
				let dungeonCaptainNameFromStorage = captKeys.dungeonCaptain?.toLowerCase() ?? "";
				let clashCaptainNameFromStorage = captKeys.clashCaptain?.toLowerCase() ?? "";
				let duelsCaptainNameFromStorage = captKeys.duelCaptain?.toLowerCase() ?? "";
				let campaignCaptainNameFromStorage = captKeys.campaignCaptain?.toLowerCase() ?? "";
				let modeChangeSwitch = captKeys.modeChangeSwitch;
				let multiClashSwitch = captKeys.multiClashSwitch;

				if (!modeChangeSwitch &&
					(((campaignCaptainNameFromStorage.includes("," + logCapName.toLowerCase() + ",")) && logMode != "Campaign") ||
						((dungeonCaptainNameFromStorage != "," + logCapName.toLowerCase() + ",") && logMode == "Dungeons") ||
						(!multiClashSwitch && (!clashCaptainNameFromStorage.includes("," + logCapName.toLowerCase() + ",")) && logMode == "Clash") ||
						((duelsCaptainNameFromStorage != "," + logCapName.toLowerCase() + ",") && logMode == "Duel") ||
						((dungeonCaptainNameFromStorage == "," + logCapName.toLowerCase() + ",") && logMode != "Dungeons") ||
						((clashCaptainNameFromStorage.includes("," + logCapName.toLowerCase() + ",")) && logMode != "Clash") ||
						((duelsCaptainNameFromStorage == "," + logCapName.toLowerCase() + ",") && logMode != "Duel"))) {
					colorCode = "rgb(255, 204, 203)"; //red
				}
			}
		} catch (error) {
			continue;
		}

		if (logCapName) {
			const raidId = logSlot.raidId;
			const captainId = logSlot.captainId;
			let pvpOpponent;
			if (logMode == "Clash" || logMode == "Duel") {
				pvpOpponent = logSlot.opponentTwitchDisplayName;
			} else {
				pvpOpponent = undefined;
			}
			const mapName = logSlot.nodeId;
			const mapLoyalty = await getRaidChest(mapName);
			await setLogCaptain(logId, logCapName, logMode, currentTime, colorCode, raidId, mapName, mapLoyalty, captainId, pvpOpponent);
		}
	}
}

//Saves initial battle information to the local storage
async function setLogCaptain(logId, logCapName, logMode, currentTime, colorCode, raidId, mapName, mapLoyalty, captainId, pvpOpponent) {

	// default rgb(42, 96, 132) 
	//Check if color needs to be updated on storage.
	let updateColor = false;
	if (colorCode === "rgb(185, 242, 255)" || colorCode === "rgb(255, 204, 203)" || colorCode === "rgb(203, 195, 227)") updateColor = true;
	while (logRunning == true) {
		await delay(10);
	}
	logRunning = true;
	return new Promise((resolve, reject) => {
		// Retrieve existing data from local storage
		chrome.storage.local.get(["logData"], async function (result) {
			let loggedData = result.logData || [];
			//Check if an entry for the current captain battle exists
			const existingEntryIndex = loggedData.findIndex(entry => (entry.logCapName === logCapName && entry.raidId === raidId));

			//Pushes battle data into the storage
			if (existingEntryIndex === -1 && currentTime !== null && currentTime !== undefined) {
				loggedData.push({
					logId: logId,
					logMode: logMode,
					logCapName: logCapName,
					currentTime: currentTime.toString(),
					elapsedTime: undefined,
					result: undefined,
					colorCode: colorCode,
					chest: undefined,
					initialchest: mapLoyalty,
					mapName: mapName,
					initialchest2: undefined,
					rewards: undefined,
					leaderboardRank: undefined,
					kills: undefined,
					assists: undefined,
					units: undefined,
					raidId: raidId,
					units2: undefined,
					raidChest: undefined,
					chestCount: undefined,
					captainId: captainId,
					dungeonLevel: undefined,
					pvpOpponent: pvpOpponent
				});
			} else {
				//If no battle data exists, check if the color needs to be updated on existing slots.
				if (updateColor && loggedData[existingEntryIndex].colorCode !== colorCode && loggedData[existingEntryIndex].elapsedTime === undefined && loggedData[existingEntryIndex].chest === undefined && loggedData[existingEntryIndex].result === undefined) {
					loggedData[existingEntryIndex].colorCode = colorCode;
					loggedData[existingEntryIndex].result = "Unknown";
				}
			}

			//If there's more than 1000 entries, delete oldest.
			if (loggedData.length > 10000) loggedData.shift();

			// Update the loggedData object in storage
			chrome.storage.local.set({ ["logData"]: loggedData }, function () {
				resolve(loggedData);
			});
		});
		logRunning = false;
	});
}

//Saves initial chest information on storage
async function setLogInitialChest2(logCapName, raidId, initialchest2) {
	while (logRunning == true) await delay(10);
	logRunning = true;
	return new Promise((resolve, reject) => {
		// Retrieve existing data from local storage
		chrome.storage.local.get(["logData"], async function (result) {
			let loggedData = result.logData || [];

			// Add final battle time, result, and chest type
			for (let i = loggedData.length - 1; i >= 0; i--) {
				let entry = loggedData[i];
				if (entry.logCapName === logCapName &&
					(entry.currentTime !== null && entry.currentTime !== undefined) &&
					entry.elapsedTime === undefined && entry.initialchest2 === undefined && entry.raidId === raidId) {
					entry.initialchest2 = initialchest2;
					break;
				}
			}

			// Update the loggedData object in storage
			chrome.storage.local.set({ "logData": loggedData }, function () {
				resolve(loggedData);
			});
		});
		logRunning = false;
	});
}

//Saves units list on storage
async function setLogUnitsData(logCapName, raidId, unitsData) {
	while (logRunning == true) await delay(10);
	logRunning = true;
	return new Promise((resolve, reject) => {
		// Retrieve existing data from local storage
		chrome.storage.local.get(["logData"], async function (result) {
			let loggedData = result.logData || [];

			// Add final battle time, result, and chest type
			for (let i = loggedData.length - 1; i >= 0; i--) {
				let entry = loggedData[i];
				if (entry.logCapName === logCapName && entry.raidId === raidId) {
					entry.units2 = unitsData;
					if (entry.logMode == "Dungeons") {
						let dungeonInfo = await retrieveFromStorage("dungeonRaidInfo");
						try {
							let dungeonLevel = parseInt(dungeonInfo[8]) + 1;
							entry.dungeonLevel = dungeonLevel;
						} catch (error) { }
					}
					break;
				}
			}

			// Update the loggedData object in storage
			chrome.storage.local.set({ "logData": loggedData }, function () {
				resolve(loggedData);
			});
		});
		logRunning = false;
	});
}

//Saves final battle information on storage
async function setLogResults(conclusion, logCapName, chest, leaderboardRank, kills, assists, units, rewards, raidId, raidChest, chestCount) {
	const unknown = "Unknown";
	let now = new Date();

	// Determines battle resolution
	let resolution;
	if (conclusion.includes("Defeat")) {
		resolution = "Defeat";
	} else if (conclusion.includes("Victory")) {
		resolution = "Victory";
	} else if (conclusion.includes("Abandoned")) {
		resolution = "Abandoned";
	} else {
		resolution = unknown;
	}
	while (logRunning == true) await delay(10);
	logRunning = true;
	return new Promise((resolve, reject) => {
		// Retrieve existing data from local storage
		chrome.storage.local.get(["logData"], function (result) {
			let loggedData = result.logData || [];

			// Add final battle time, result, and chest type
			for (let i = loggedData.length - 1; i >= 0; i--) {
				let entry = loggedData[i];
				if (entry.logCapName === logCapName && entry.raidId === raidId &&
					(entry.currentTime !== null && entry.currentTime !== undefined)) {
					if (entry.elapsedTime === undefined) entry.elapsedTime = Math.floor((now - new Date(entry.currentTime)) / (1000 * 60)).toString();
					if (entry.result == undefined && resolution !== "" && resolution !== undefined) entry.result = resolution;
					if (entry.chest == undefined && chest !== "" && chest !== undefined) entry.chest = chest;
					if (entry.leaderboardRank == undefined && leaderboardRank !== "" && leaderboardRank !== undefined) entry.leaderboardRank = leaderboardRank;
					if (entry.kills == undefined && kills !== "" && kills !== undefined) entry.kills = kills;
					if (entry.assists == undefined && assists !== "" && assists !== undefined) entry.assists = assists;
					if (entry.units == undefined && units !== "" && units !== undefined) entry.units = units;
					if (entry.rewards == undefined && rewards !== "" && rewards !== undefined) entry.rewards = rewards;
					if (entry.raidChest == undefined && raidChest !== "" && raidChest !== undefined) entry.raidChest = raidChest;
					if (entry.chestCount == undefined && chestCount !== "" && chestCount !== undefined) entry.chestCount = chestCount;
					break;
				}
			}

			// If the entry on the array is older than 1 hour, update it for battle result closure
			loggedData = loggedData.map((entry) => {
				const elapsedTime = Math.floor((now - new Date(entry.currentTime)) / (1000 * 60));
				if (elapsedTime > 60 && entry.elapsedTime === undefined && entry.chest === undefined) {
					entry.elapsedTime = entry.currentTime.toString();
					entry.result = unknown;
					entry.chest = unknown;
				}
				return entry;
			});
			// Update the loggedData object in storage
			chrome.storage.local.set({ "logData": loggedData }, function () {
				resolve(loggedData);
			});
		});
		logRunning = false;
	});
}
