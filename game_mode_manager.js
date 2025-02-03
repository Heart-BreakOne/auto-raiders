//This file keeps track of which captains are running which special modes.

/* This function checks which captain is running dungeon, clash and duels.
If there is only one captain running the mode (one in dungeon, one in clash and one in duels),
they are saved on storage with their flag to identify their mode.
*/
async function manageCaptain(captainType, keyword, activeRaids) {
	//Get all captain data
	let captains = [];

	for (let i = 0; i < activeRaids.length; i++) {
		const activeRaid = activeRaids[i];
		const captainNameFromAPI = activeRaid.twitchDisplayName.toLowerCase();
		const mode = activeRaid.type == 1 ? "Campaign" : activeRaid.type == 2 ? "Clash" : activeRaid.type == 3 ? "Dungeons" : activeRaid.type == 5 ? "Duel" : "";
		captains.push({ "captainNameFromAPI": captainNameFromAPI, "mode": mode });
	}

	//Initializes variables
	let captainNameForMode = "";
	let allCaptainNames = "";
	let counter = 0;

	let captKeysArray = [captainType, 'dungeonCaptain', 'clashCaptain', 'duelCaptain', 'campaignCaptain', 'modeChangeSwitch', 'multiClashSwitch'];
	let captKeys = await retrieveMultipleFromStorage(captKeysArray);
	let captainNamesFromStorage = captKeys[captainType]?.toLowerCase() ?? "";
	let dungeonCaptainNameFromStorage = captKeys.dungeonCaptain?.toLowerCase() ?? "";
	let clashCaptainNameFromStorage = captKeys.clashCaptain?.toLowerCase() ?? "";
	let duelsCaptainNameFromStorage = captKeys.duelCaptain?.toLowerCase() ?? "";
	let campaignCaptainNameFromStorage = captKeys.campaignCaptain?.toLowerCase() ?? "";
	let modeChangeSwitch = captKeys.modeChangeSwitch;
	let multiClashSwitch = captKeys.multiClashSwitch;

	let allCaptainNamesFromStorage = [];
	if (keyword != "Campaign") allCaptainNamesFromStorage.push(campaignCaptainNameFromStorage);
	if (keyword != "Dungeons") allCaptainNamesFromStorage.push(dungeonCaptainNameFromStorage);
	if (keyword != "Clash") allCaptainNamesFromStorage.push(clashCaptainNameFromStorage);
	if (keyword != "Duel") allCaptainNamesFromStorage.push(duelsCaptainNameFromStorage);

	//Checks what mode the captain is running and whenever a captain is running the same mode a counter is incremented. 
	if (captains) {
		captains.forEach((captain) => {
			if (keyword == captain.mode) counter++;
		});
	}
	//If counter is zero it means there are no captains running the mode and if modeChangeSwitch is enabled, the name should be cleared
	if (counter === 0 && modeChangeSwitch) await saveToStorage(captainType, "");
	//If counter is one it means there is only one captain running the mode
	else if (counter === 1 || (counter > 1 && (keyword == "Campaign" || (keyword == "Clash" && multiClashSwitch)))) {
		captains.forEach((captain) => {
			if (captain.captainNameFromAPI != null) {
				//Store all active captains for later comparison
				allCaptainNames += "," + captain.captainNameFromAPI + ",";
				//Gets the captain's name running the mode of interest
				/*
				If the captain's mode matches and the captain is not currently in the mode's storage and
				One of the following:
				  modeChangeSwitch is enabled (bypasses captainNamesFromStorage check to allow another captain to replace it)
				  captainNamesFromStorage is null or blank (allows only one captain)
				  mode is Clash and multiClashSwitch is enabled (allows multiple captains)
				  mode is Campaign (allows multiple captains)
				*/
				if (
					keyword == captain.mode &&
					!captainNamesFromStorage.includes(captain.captainNameFromAPI) &&
					(
						modeChangeSwitch ||
						captainNamesFromStorage == null ||
						captainNamesFromStorage == "" ||
						(keyword == "Clash" && multiClashSwitch) ||
						keyword == "Campaign"
					)
				) {
					captainNameForMode += "," + captain.captainNameFromAPI + ",";
				}
				//If the mode doesn't match but the captain is in the mode's storage and modeChangeSwitch is enabled, remove the name
				if (
					keyword !== captain.mode &&
					captainNamesFromStorage.includes(captain.captainNameFromAPI) &&
					modeChangeSwitch
				) {
					captainNamesFromStorage = captainNamesFromStorage.replace(captain.captainNameFromAPI, "");
				}
			}
		});
		captainNamesFromStorage = captainNamesFromStorage.replaceAll(",,", ",");
		let allCaptainNamesArray = allCaptainNames.split(",");
		let captainNameForModeArray = captainNameForMode.split(",");
		let captainNamesFromStorageArray = captainNamesFromStorage.split(",");
		if (captainNamesFromStorage != "") {
			//Check if the captain names in storage are still in a slot. If not, remove it
			captainNamesFromStorageArray.forEach((captain) => {
				if (captain != "" && !allCaptainNamesArray.includes(captain)) captainNamesFromStorage = captainNamesFromStorage.replace(captain, "");
			});
		}
		//Check if the captain exists in another mode. If not, update the storage value
		captainNameForModeArray.forEach((captain) => {
			if (captain != "") {
				//If the captain already exists in another mode in storage, don't add the captain to this one
				if (allCaptainNamesFromStorage.join(",").includes("," + captain + ",")) return;
				//If they don't exist, add the captain to storage
				if (!captainNamesFromStorageArray.includes(captain)) captainNamesFromStorage += "," + captain + ",";
			}
		});
		captainNamesFromStorage = captainNamesFromStorage.replaceAll(",,", ",");
		//Saves the game mode and the captain's name on storage so they are flagged as running that mode.
		await saveToStorage(captainType, captainNamesFromStorage);
	}
}

//Checks if the slots menu exists and invokes the manageCaptain function.
async function manageGameModes(activeRaids) {
	if (await retrieveFromStorage("paused_checkbox")) return;

	//Invokes the manageCaptain so the captains running these modes can be flagged.
	await manageCaptain("campaignCaptain", "Campaign", activeRaids);
	await manageCaptain("dungeonCaptain", "Dungeons", activeRaids);
	await manageCaptain("clashCaptain", "Clash", activeRaids);
	await manageCaptain("duelCaptain", "Duel", activeRaids);
}