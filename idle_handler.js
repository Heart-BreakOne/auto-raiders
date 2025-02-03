// This file handles situations in which the captain may be idling so a captain replacement can be obtained.

//Declaring/initializing variables
const idleDelay = ms => new Promise(res => setTimeout(res, ms));
const diamondLoyaltyLevel = 4;
const goldLoyaltyLevel = 3;
const silverLoyaltyLevel = 2;
const bronzeLoyaltyLevel = 1;
let isContentRunningIdle;
let hasBattlePass;

//This function checks if a captain is idling or if the slot is empty and gets a replacement
async function checkIdleCaptains() {

	/*
	Due to the end of the game, everyone gets a battlepass, so no need to check for it.
	if (hasBattlePass == null) {
		let eventUid = await retrieveFromStorage("getEventProgressionLite");
		eventUid = eventUid.data.eventUid;
		if (eventUid == undefined) return;
	}
	if (hasBattlePass == 1) maxSlots = 4;
	*/
	
	let maxSlots = 4;

	//Initialized a node list with all the captain slots
	const captainSlots = activeRaidsArray;

	//Initialize currentSlots to store slot data
	let currentSlots = [];
	for (let i = 0; i < maxSlots; i++) {
		//Checks if the user wants to switch idle captains by passing the button id
		const slotNo = +i + 1;
		currentSlots.push({
			"userSortIndex": i,
			"raidId": null,
			"captId": null,
			"captName": null,
			"battleStatus": null,
			"idleState": await getIdleState("offlineButton_" + slotNo)
		});
	}

	if (!(captainSlots.length == 1 && captainSlots[0].twitchDisplayName == "")) {
		//Iterates through the list of slots
		for (let index = 0; index < captainSlots.length; index++) {
			//Gets the current slot
			const slot = captainSlots[index];

			//Battle status is used to determine the idle status based on the placementEndTime. When placementEndTime is null, placement is active
			let battleStatus;
			//If hasViewedResults and postBattleComplete are both "1", that means "Waiting for Captain to find battle!"
			if (slot.hasViewedResults !== "1" && slot.postBattleComplete !== "1") {
				battleStatus = true;
			} else {
				battleStatus = false;
			}
			for (let i = 0; i < currentSlots.length; i++) {
				if (currentSlots[i].userSortIndex == slot.userSortIndex) {
					currentSlots[i].raidId = slot.raidId;
					currentSlots[i].captId = slot.captainId;
					currentSlots[i].captName = slot.twitchDisplayName;
					currentSlots[i].battleStatus = battleStatus;
					i = 5;
				}
			}
		}
	}

	for (let i = 0; i < currentSlots.length; i++) {
		let captainName = currentSlots[i].captName;
		//If the idleState indicates that the user wants to disable the slot, skip it
		if (!currentSlots[i].idleState) continue;

		//MAKE SURE NODE CAPTAIN MATCHES DATA CAPTAIN
		let raidId = currentSlots[i].raidId;
		let captId = currentSlots[i].captId;
		const capSlots = document.querySelectorAll('.capSlot');
		const slot = capSlots[i];
		//If the captain name doesn't exist, it means that the slot is empty
		if (captainName == null) {
			if (!slot) return;
			const selectButton = slot.querySelector(".actionButton.actionButtonPrimary.capSlotButton.capSlotButtonAction");
			if (selectButton && selectButton.innerText == "SELECT") {
				if (isContentRunningIdle == true) return;
				isContentRunningIdle = true;
				//Clicks select button to open the captains list
				selectButton.click();
				//Invokes function to get a captain replacement.
				await switchIdleCaptain(i);
				isContentRunningIdle = false;
				return;
			}
		} else if (currentSlots[i].battleStatus == false) {
			//If the captain is possibly on an idle state
			//Invokes function to set the battle status with the captainName as a parameter.
			await setBattleStatus(captainName);
			//Gets whether or not the captain is idling for more than 15 minutes using the captainName as a parameter
			const isIdle = await getBattleStatus(captainName);
			//Captain is idle, switch and select a new one
			if (isIdle) {
				if (isContentRunningIdle == true) return;
				isContentRunningIdle = true;
				await abandonBattle("Abandoned", "abandoned", slot, raidId);
				//Clicks the select button to open captain selection list
				const selectButton = slot.querySelector(".actionButton.actionButtonPrimary.capSlotButton.capSlotButtonAction");
				if (selectButton) selectButton.click();
				//Invokes function to get a captain replacement.
				await switchIdleCaptain(i);
				isContentRunningIdle = false;
				return;
			}
		}
	}
}

/*This function ensures that a captain that was previously on a possible idle state (less than 15 minutes of idling)
but is now running a battle is removed from the idle list. */
async function updateRunningCaptains(activeRaids) {
	//Get all captain slots
	const captainSlots = activeRaids;
	for (let index = 0; index < captainSlots.length; index++) {
		//Iterate through every slot to get the captain name
		const slot = captainSlots[index];
		const capName = slot.twitchDisplayName;
		//If hasViewedResults and postBattleComplete are both "1", that means "Waiting for Captain to find battle!" As long as both are not "0", the captain can be removed from the idle list.
		if (slot.hasViewedResults !== "1" && slot.postBattleComplete !== "1" && capName) {
			//Retrieves the idle data from storage.
			chrome.storage.local.get(['idleData'], function (result) {
				let idleData = result.idleData || [];
				// Looks for a captain with the same name, removed it and saves back to storage.
				const existingCaptainIndex = idleData.findIndex(item => item.captainName === capName);
				if (existingCaptainIndex !== -1) {
					idleData.splice(existingCaptainIndex, 1);
					chrome.storage.local.set({ idleData: idleData });
				}
			});
		}
	}
}

//This function saves a captain that is possibly idling into the storage using the captainName as a parameter
async function setBattleStatus(captainName) {
	//Get current time
	const currentTime = new Date().getTime();
	//Gets idle data from storage
	chrome.storage.local.get(['idleData'], function (result) {
		let idleData = result.idleData || [];
		// Find the captain with the same name so the value can be updated
		const existingCaptainIndex = idleData.findIndex(item => item.captainName === captainName);
		//If the captain exists
		if (existingCaptainIndex !== -1) {
			// 1200000 = 20 minutes  - 3600000 = 60 minutes
			//If the captain already exists check for old time data is performed, if the idle time is bigger than an hour the value
			// is updated since it means the captain was not recently added into storage.
			const lastUpdateTime = idleData[existingCaptainIndex].currentTime;
			if (currentTime - new Date(lastUpdateTime).getTime() > 3600000) {
				// Update the currentTime
				idleData[existingCaptainIndex].currentTime = currentTime;
				// Save updated data back to local storage
				chrome.storage.local.set({ idleData: idleData });
			}
		} else {
			// If the captain does not exist, the data is added
			idleData.push({ captainName, currentTime });
			//Keeps the array to a maximum size of 15 items.
			if (idleData.length > 15) idleData.shift();
			// Save updated data back to local storage
			chrome.storage.local.set({ idleData: idleData });
		}
	});
}

//When invoked this function receives the captain name returns a true or false as to whether or not the captain is idling for more than 15 minutes.
async function getBattleStatus(captainName) {
	return new Promise((resolve, reject) => {
		//Gets the idle data from storage
		chrome.storage.local.get(['idleData'], async function (result) {
			let idleData = result.idleData || [];
			//Gets current time for comparison with the stored time data
			const currentTime = new Date().getTime();

			//Checks if the captain exists in the idle database
			const existingCaptain = idleData.find(item => item.captainName === captainName);

			//Captain exists
			if (existingCaptain) {
				//If the captain exists the idle time is calculated based on when the captain was flagged as idling and the current time
				const lastUpdateTime = new Date(existingCaptain.currentTime).getTime();
				const elapsedTime = currentTime - lastUpdateTime;
				//If the elapsed idle time is greater than the user defined idle time, it returns true
				const uITi = await getUserIdleTime();
				if (elapsedTime >= uITi) {
					resolve(true);
				} else {
					resolve(false);
				}
			} else {
				//Captain is not on the idle database.
				resolve(false);
			}
		});
	});
}

//When invoked this function gets a captain replacement for the current empty slot
async function switchIdleCaptain() {

	let idlersList;
	const storageData = await chrome.storage.local.get(['idleData']);
	const idlers = storageData.idleData || [];

	if (idlers) {
		const presentTime = Date.now();
		const uIT = await getUserIdleTime();
		idlersList = idlers
			.filter(entry => presentTime - entry.presentTime < uIT)
			.map(entry => entry.captainName.toUpperCase());
	} else {
		idlersList = [];
	}

	//Clicks on the ALL captains tab to obtain the full list of online captains
	const allCaptainsTab = document.querySelector(".subNavItemText");
	allCaptainsTab.click();
	//Scrolls to the bottom
	await scroll();
	await idleDelay(3000);
	//Gets the full list of captains

	let fullCaptainList = await retrieveFromStorage("captainSearchData");
	if (!fullCaptainList) return;
	if (idlersList.length != 0) {
		fullCaptainList = fullCaptainList.filter(captain => !idlersList.includes(captain.twitchDisplayName.toUpperCase()));
	}

	let blackList = await filterCaptainList('blacklist', fullCaptainList);
	const acceptableList = fullCaptainList.filter(
		entry => !blackList.includes(entry)
	);
	let whiteList = await filterCaptainList('whitelist', acceptableList);
	let masterList = await filterCaptainList('masterlist', acceptableList);

	//Manage masterlist states
	const skipIdleMasterSwitch = await getSwitchState("skipIdleMasterSwitch");
	const idleMasterSwitch = await getSwitchState("idleMasterSwitch");
	//User wants to leave slot blank if there no masterlisted captains online
	if (skipIdleMasterSwitch && masterList.length == 0) {
		closeAll();
		return;
	}

	//Invokes function to get list with gold loyalty captains
	let diamondLoyaltyList = createLoyaltyList(acceptableList, diamondLoyaltyLevel);
	//Invokes function to get list with gold loyalty captains
	let goldLoyaltyList = createLoyaltyList(acceptableList, goldLoyaltyLevel);
	//Invokes function to get list with silver loyalty captains
	let silverLoyaltyList = createLoyaltyList(acceptableList, silverLoyaltyLevel);
	//Invokes function to get list with bronze loyalty captains
	let bronzeLoyaltyList = createLoyaltyList(acceptableList, bronzeLoyaltyLevel);
	//Gets list of favorited captains that are running campaign
	let favoriteList = [];
	try {
		let favoriteCaptainIds = await retrieveFromStorage("favoriteCaptainIds");
		let favoriteCaptainIdsArray = favoriteCaptainIds.split(",");
		favoriteList = acceptableList.filter(
			entry => (favoriteCaptainIdsArray.includes(entry.userId) && !entry.isSelected && entry.type == 1)
		);
	} catch (error) {
		favoriteList = [];
	}
	//If diamond loyalty captains exist, click on a random one
	if (idleMasterSwitch && masterList.length != 0) {
		await joinCaptainToAvailableSlot(masterList[0].twitchDisplayName);
	} else if (diamondLoyaltyList.length != 0) {
		await joinCaptainToAvailableSlot(diamondLoyaltyList[getRandomIndex(diamondLoyaltyList.length)].twitchDisplayName);
	}
	//If diamond loyalty captains exist, click on a random one
	else if (goldLoyaltyList.length != 0) {
		await joinCaptainToAvailableSlot(goldLoyaltyList[getRandomIndex(goldLoyaltyList.length)].twitchDisplayName);
	}
	//If silver loyalty captains exist, click on a random one
	else if (silverLoyaltyList.length != 0) {
		await joinCaptainToAvailableSlot(silverLoyaltyList[getRandomIndex(silverLoyaltyList.length)].twitchDisplayName);
	}
	//If bronze loyalty captains exist, click on a random one
	else if (bronzeLoyaltyList.length != 0) {
		await joinCaptainToAvailableSlot(bronzeLoyaltyList[getRandomIndex(bronzeLoyaltyList.length)].twitchDisplayName);
	}
	//Get a whitelisted captain
	else if (whiteList.length != 0) {
		await joinCaptainToAvailableSlot(whiteList[0].twitchDisplayName);
	}
	//If favorited captains exist, click on a random one
	else if (favoriteList.length != 0) {
		await joinCaptainToAvailableSlot(favoriteList[getRandomIndex(favoriteList.length)].twitchDisplayName);
	}
	else {
		//Checks if the user wants to switch to non special captains, if not the list is closed
		const skipSwitch = await retrieveFromStorage("skipSwitch");
		if (skipSwitch) {
			//Closes the list
			closeAll();
			return;
		}
		//Get an acceptable captain
		if (acceptableList.length != 0) await joinCaptainToAvailableSlot(acceptableList[0].twitchDisplayName);
		//No special captains (no loyalty, not favorite, no whitelist, no acceptable captains) exist
		else {
			for (let i = 0; i < acceptableList.length; i++) {
				//Iterates through the list of captains
				const captain = acceptableList[i];
				//Gets mode the current captain is running
				const mode = captain.type == 1 ? "Campaign" : captain.type == 2 ? "Clash" : captain.type == 3 ? "Dungeons" : captain.type == 5 ? "Duel" : "";
				//Gets the already joined from the current captain
				const alreadyJoined = captain.isSelected ?? false;
				//If the captain is running campaign and has not been joined yet
				if (mode === "Campaign" || !alreadyJoined) {
					//If user wants to select any captain, the first captain from the list is clicked
					await joinCaptainToAvailableSlot(captain.twitchDisplayName);
					break;
				}
			}
		}
	}
	closeAll();
	goHome();
}

//Returns a random index number for the captains special list
function getRandomIndex(max) {
	return Math.floor(Math.random() * max);
}

/* This function receives the full captain list as well as a loyalty string
and returns an sub array with only captains that match the loyalty string and
captains that are running campaign and captains that have not been joined yet */

function createLoyaltyList(captainList, loyaltyLevel) {

	return Array.from(captainList).filter(captain => {
		//Gets loyalty for comparison
		const loyalty = captain.pveLoyaltyLevel;
		//Gets game mode
		const mode = captain.type == 1 ? "Campaign" : captain.type == 2 ? "Clash" : captain.type == 3 ? "Dungeons" : captain.type == 5 ? "Duel" : "";
		//Gets whether or not the captain has been joined already.
		const alreadyJoined = captain.isSelected ?? false;

		//Returns captain if they match the loyalty string and the game mode campaign and have not been joined.
		return loyalty === loyaltyLevel && mode === "Campaign" && !alreadyJoined;
	});
}


//This function receives the list type and the full list and sorts the matching captains
async function filterCaptainList(type, captainList) {

	let filteredArray = [];
	function getListedCaptains() {
		return new Promise((resolve) => {
			chrome.storage.local.get({ [type]: [] }, function (result) {
				resolve(result[type] || []);
			});
		});
	}

	// Use async/await to wait for the storage data
	const listArray = await getListedCaptains();

	//Create a filtered nodeList array of captains with the order of favoritism
	for (let i = 0; i < listArray.length; i++) {
		//Get favorite captain in order
		const listedCaptain = listArray[i];
		//Check if the captainName and other condition match, add it to filtered array
		for (let j = 0; j < captainList.length; j++) {
			const captain = captainList[j];
			const captainName = captain.twitchDisplayName;
			//Gets game mode
			const mode = captain.type == 1 ? "Campaign" : captain.type == 2 ? "Clash" : captain.type == 3 ? "Dungeons" : captain.type == 5 ? "Duel" : "";
			//Gets whether or not the captain has been joined already.
			const alreadyJoined = captain.isSelected ?? false;

			if (captainName != undefined && listedCaptain != undefined && captainName.toUpperCase() === listedCaptain.toUpperCase() &&
				mode === "Campaign" && !alreadyJoined) {
				filteredArray.push(captain);
			}
		}
	}
	return filteredArray;
}

//Scroll to the bottom of the page and load all captains
async function scroll() {
	//Initialized the scrollable element
	const scroll = document.querySelector('.capSearchResults');
	//Scrolls to the bottom with a delay so the new dynamically elements can be loaded
	for (let i = 0; i < 20; i++) {
		scroll.scrollTop = scroll.scrollHeight;
		await idleDelay(450);
	}
}

//Abandon the battle and select a new captain
async function abandonBattle(status, status1, slot, raidId) {
	//Closes captain slot
	let close = slot.querySelector(".fas.fa-square");
	const c = close.offsetParent;
	if (!c) return;
	const closeOffset = c.offsetParent;
	if (!closeOffset) return;
	const idleCapName = closeOffset.querySelector(".capSlotName").innerText;

	if (close) close.click();
	await delay(1000);
	//Store battle result as abandoned on storage log
	await setLogResults(status, idleCapName, status1, "N/A", "N/A", "N/A", "N/A", "N/A", raidId, "N/A", "N/A");
	// Special modes have a leave battle confirmation popup. This handles those
	await confirmLeaveBattlePopup();
	await idleDelay(2000);
}

async function getUserIdleTime() {
	try {
		let userIdleTime = await retrieveNumberFromStorage("userIdleTimeInput");
		if (userIdleTime == -100) {
			return 900000;
		} else {
			return userIdleTime * 60000;
		}
	} catch (error) {
		return 900000;
	}
}