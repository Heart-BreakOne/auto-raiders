/* This file is the heart of the extension, it performs the auto playing, invokes functions to set and get values as well as
functions to perform tasks such as replacing idle captains or buying scrolls.
*/

//Triggers the start function every 10-15 seconds
(function loopStart() {
	setTimeout(() => {
		start();
		loopStart();
	}, getRandNum(10, 15) * 1000);
}());

var s = document.createElement('script');
// must be listed in web_accessible_resources in manifest.json
s.src = chrome.runtime.getURL('xmlhttprequest.js');
s.type = "module";
s.onload = function () {
	this.remove();
};
(document.head || document.documentElement).appendChild(s);

window.addEventListener('message', (message) => handleMessage(message));

//Declares/initializes variables
let currentMarker;
let arrayOfMarkers;
let firstReload;
let reload = 0;
let isContentRunning = false;
let unfinishedQuests = null;
const blue = 'rgb(185, 242, 255)';
const red = 'rgb(255, 204, 203)';
const purple = 'rgb(203, 195, 227)';
const gameBlue = 'rgb(42, 96, 132)';
const cancelButtonSelector = ".actionButton.actionButtonNegative.placerButton";
const delay = ms => new Promise(res => setTimeout(res, ms));
let unitDrawer;
let hasPlacedSkin;
let contentRunningLoopCount = 0;
let isEnemyPresentNameArray = ['Puppet Master', 'Goblin Midhowler', 'Mind Control Device', 'Mind Control Device']; //Enemy name as seen in DOM alt text (case sensitive)
let ifPresentAvoidUnitArray = ['RANGED', 'RANGED', 'BUSTER', 'ROGUE']; //Unit name or type to avoid if enemy is present on the map. Pairs with the enemy name at the same index in the array (isEnemyPresentNameArray[0] - ifPresentAvoidUnitArray[0])
let collectRunning = false;
let collectLastTime = new Date();

//Unit icons from the unit drawer (the icon on the top left corner of the unit square)
const arrayOfUnits = [
	{ key: "VIBE", type: "VIBE", icon: "VIBE" },
	{ key: "AMAZON", type: "MELEE", icon: "5GHK8AAAAASUVORK5CYII=", name: "amazon" },
	{ key: "ARCHER", type: "RANGED", icon: "FBPKAZY", name: "archer" },
	{ key: "ARTILLERY", type: "RANGED", icon: "3GY1DLAQ", name: "alliesballoonbuster" },
	{ key: "BALLOON", type: "ASSASSIN", icon: "FOPPA6G", name: "amazon" },
	{ key: "BARBARIAN", type: "MELEE", icon: "Y2AZRA3G", name: "barbarian" },
	{ key: "BERSERKER", type: "MELEE", icon: "BCIAAA", name: "berserker" },
	{ key: "BLOB", type: "ARMORED", icon: "LXTAAA", name: "blob" },
	{ key: "BOMBER", type: "RANGED", icon: "QWP8WBK", name: "bomber" },
	{ key: "BUSTER", type: "ASSASSIN", icon: "PCCPYIHW", name: "buster" },
	{ key: "CENTURION", type: "ARMORED", icon: "DUWAAA", name: "centurion" },
	{ key: "FAIRY", type: "SUPPORT", icon: "FNJQA", name: "fairy" },
	{ key: "FLAG", type: "SUPPORT", icon: "KF7A", name: "flagbearer" },
	{ key: "FLYING", type: "ASSASSIN", icon: "GSGE2MI", name: "flyingarcher" },
	{ key: "GLADIATOR", type: "MELEE", icon: "EMWA84U", name: "gladiator" },
	{ key: "HEALER", type: "SUPPORT", icon: "UY3N8", name: "healer" },
	{ key: "LANCER", type: "MELEE", icon: "PU+OGW", name: "lancer" },
	{ key: "MAGE", type: "RANGED", icon: "4Q+BQML8", name: "mage" },
	{ key: "MONK", type: "SUPPORT", icon: "D46EKXW", name: "monk" },
	{ key: "MUSKETEER", type: "RANGED", icon: "DL9SBC7G", name: "musketeer" },
	{ key: "NECROMANCER", type: "SUPPORT", icon: "85VI", name: "necromancer" },
	{ key: "ORC", type: "ARMORED", icon: "VPAASGY8", name: "orcslayer" },
	{ key: "PALADIN", type: "ARMORED", icon: "IYUEO", name: "alliespaladin" },
	{ key: "PHANTOM", type: "ASSASSIN", icon: "XJQAAAABJRU5ERKJGGG==", name: "phantom" },
	{ key: "ROGUE", type: "ASSASSIN", icon: "GRJLD", name: "rogue" },
	{ key: "SAINT", type: "SUPPORT", icon: "PBUHPCG", name: "saint" },
	{ key: "SHINOBI", type: "ASSASSIN", icon: "XSCZQ", name: "shinobi" },
	{ key: "SPY", type: "ASSASSIN", icon: "FJBDFFQ", name: "spy" },
	{ key: "TANK", type: "ARMORED", icon: "XEK7HQU", name: "tank" },
	{ key: "TEMPLAR", type: "SUPPORT", icon: "CYNUL", name: "templar" },
	{ key: "VAMPIRE", type: "ARMORED", icon: "BL5378", name: "vampire" },
	{ key: "WARBEAST", type: "MELEE", icon: "SRJSYO", name: "warbeast" },
	{ key: "WARLOCK", type: "SUPPORT", icon: "OFWKD", name: "warlock" },
	{ key: "WARRIOR", type: "MELEE", icon: "YTUUAHQ", name: "warrior" },
];

// This is the start, it selects a captain placement as well as collect any rewards to proceed
async function start() {
	if (await retrieveFromStorage("paused_checkbox") || collectRunning) return;
	//Reload tracker
	if (firstReload === undefined) firstReload = new Date();

	//Keep track of time and reload after 1hr15min to avoid the browser crashing due to low memory.
	const elapsedMinutes = Math.floor((new Date() - firstReload.getTime()) / (1000 * 60));
	const elapsedSeconds = (new Date() - firstReload.getTime()) / 1000;
	const timeContainer = document.querySelector(".elapsedTimeContainer");
	let battleMessages = "";

	if (timeContainer && (elapsedMinutes !== null || elapsedMinutes !== undefined)) {
		battleMessages = await displayMessage();
		timeContainer.innerHTML = `Refresh: ${elapsedMinutes} mins ago. <span style="color: white; font-weight: bold">${battleMessages}</span>`;
	}

	if (timeContainer && await retrieveFromStorage("clashQuestlineSwitch")) {
		let questCount = 0;
		let userQuests = await retrieveFromStorage("userQuests");
		for (let i = 0; i < userQuests.data.length; i++) {
			let questSlotId = userQuests.data[i].questSlotId;
			let userQuestData = userQuests.data[i];
			if (questSlotId.includes("questslot_versus_arena_viewer_event")) {
				if (userQuestData.completedQuestGroupIds) {
					let completedQuests = userQuestData.completedQuestGroupIds.split(",");
					questCount = completedQuests.length;
				}
				i = userQuests.length;
			}
		}
		timeContainer.innerHTML += ` [${questCount}]`;
	}

	updateChestContainer();

	if (reload == 0) {
		chrome.storage.local.get(['reloaderInput'], function (result) {
			const reloaderInputValue = result.reloaderInput;

			if (reloaderInputValue !== undefined) reload = reloaderInputValue;
		});
	}
console.log("LOG-requestRunning-"+requestRunning);
	if ((activeRaidsArray.length == 0 && elapsedSeconds > 20) || (requestRunning == false && ((reload != undefined && elapsedMinutes >= reload && reload > 0) || ((reload != undefined || reload != 0) && elapsedMinutes >= 60)))) {
		await locationReload();
		return;
	}

	//Initialized nav items, if they don't exist it means the extension is already executing.
console.log("LOG-"+isContentRunning+contentRunningLoopCount);
	if (isContentRunning && contentRunningLoopCount < 5) {
		contentRunningLoopCount++;
		const menuElements = document.querySelectorAll(".slideMenuCont.slideLeft.slideLeftOpen");
		const leaderboard = Array.from(menuElements).find(element => element.innerText.includes('Leaderboard'));
		if (leaderboard) {
			leaderboard.classList.remove('slideLeftOpen');
			leaderboard.classList.add('slideLeftClosed');
		}
		return;
	}
	contentRunningLoopCount = 0;
	isContentRunning = true;
console.log("LOG-nav items");
	let navItems = document.querySelectorAll('.mainNavItemText');
	if (navItems.length === 0 || navItems === undefined) {
		isContentRunning = false;
		return;
	} else {
		const selectedNavItem = document.querySelector(".mainNavItem.mainNavItemSelected");
		if (selectedNavItem.innerText !== "Battle") {
			//If navItem exists, open main menu
			for (let i = navItems.length - 1; i >= 0; i--) {
				let navItem = navItems[i];
				if (navItem.innerText === "Battle") {
					navItem.click();
					await delay(1000);
					break;
				}
			}
		}
	}

console.log("LOG-unfinished quests");
	unfinishedQuests = null;
	if (await retrieveFromStorage("completeQuests")) {
		try {
			unfinishedQuests = await getUnfinishedQuests();
		} catch (error) {
			unfinishedQuests = undefined;
		}
	}

console.log("LOG-cap slots");
	const capSlots = document.querySelectorAll(".capSlot");
	for (let i in capSlots) {
		try {
			const st = capSlots[i];
			//Check if captain has a code
			if (st.innerHTML.includes("ENTER_CODE")) {
				const cpId = parseInt(i, 10) + 1;
				const cpNmSt = st.querySelector(".capSlotName").innerText;
				const cB = st.querySelector(".fal.fa-times-square");
				if (cB) {
					cB.click();
					const modal = document.querySelector('.modalContent');
					if (modal) {
						const btn = modal.querySelector('.actionButton.actionButtonPrimary');
						if (btn) btn.click();
					}
				}
				//Flag captain into memory
				await flagCaptainRed(cpId, cpNmSt);
				continue;
			}
		} catch (error) {
			continue;
		}
	}

console.log("LOG-masterlist");
	//Checks masterlist to switch
	let masterSwitchkeysArray = ['liveMasterSwitch', 'priorityMasterSwitch'];
	let masterSwitchkeys = await retrieveMultipleFromStorage(masterSwitchkeysArray);
	let forceMaster = masterSwitchkeys.liveMasterSwitch;
	let replaceMaster = masterSwitchkeys.priorityMasterSwitch;
	if (forceMaster || replaceMaster) {
		let masterlistSwitchSuccessful;
		if (forceMaster || replaceMaster) masterlistSwitchSuccessful = await switchToMasterList(forceMaster, replaceMaster);
		if (masterlistSwitchSuccessful) {
			navItems = document.querySelectorAll('.mainNavItemText');
			let storeButton;
			let battleButton;
			if (navItems.length !== 0 || navItems !== undefined) {
				//If navItem exists, open main menu
				for (let i = navItems.length - 1; i >= 0; i--) {
					let navItem = navItems[i];
					if (navItem.innerText === "Store") storeButton = navItem;
					if (navItem.innerText === "Battle") battleButton = navItem;
				}
				storeButton.click();
				battleButton.click();
				await delay(5000);
			}
		}
	}

	//Checks if the user wants to replace idle captains and invoke the function to check and replace them.
	const offline = await retrieveFromStorage("offlineSwitch");
	if (offline) await checkIdleCaptains();

	let captainNameFromDOM = "";

console.log("LOG-check for place unit buttons");
	//Initialized a node list with placeable buttons
	const rewardButtonLabels = ["SEE RESULTS", "OPEN CHEST", "COLLECT RUBIES", "COLLECT KEYS", "COLLECT BONES"];
	let allButtons = document.querySelectorAll(".actionButton.capSlotButton.capSlotButtonAction");
	if (allButtons.length != 0) {
		for (var button of allButtons) {
			//If the button has inner text and includes one of the reward button labels, it's a valid button to collect rewards
			if (rewardButtonLabels.includes(button.innerText)) {
				let captainSlot = button.closest('.capSlot');
				captainNameFromDOM = captainSlot.querySelector('.capSlotName').innerText;
				//Retrieve the slot pause state
				const btn = captainSlot.querySelector(".capSlotStatus .offlineButton");
				if (btn == null || btn == undefined) return;
				const buttonId = btn.getAttribute('id');
				const slotState = await getIdleState(buttonId);
				button.click();
console.log("LOG-LA-reward button clicked");
				await delay(2000);
				const rewardsScrim = document.querySelector(".rewardsScrim");
console.log("LOG-LA-rewardsScrim");
console.log(rewardsScrim);
				if (rewardsScrim) hideElementsFromView(rewardsScrim);
console.log("LOG-LA-slotState " + slotState);
				if (slotState == 2) {
					allButtons = document.querySelectorAll(".actionButton.capSlotButton.capSlotButtonAction");
					for (var button of allButtons) {
						await delay(500);
						captainSlot = button.closest('.capSlot');
console.log("LOG-LA-capSlotName " + captainSlot.querySelector('.capSlotName'));
						if (!captainSlot.querySelector('.capSlotName')) continue;
						if (captainSlot.querySelector('.capSlotName').innerText == captainNameFromDOM) {
							let close;
							do {
								close = captainSlot.querySelector(".capSlotClose");
								await delay(500);
							} while (!close);
console.log("LOG-LA-close");
console.log(close);
							if (close) {
								const afterSwitch = await retrieveFromStorage('afterSwitch');
console.log("LOG-LA-afterSwitch " + afterSwitch);
								if (afterSwitch) {
									await setIdleState(buttonId, 1);
								} else {
									await setIdleState(buttonId, 0);
								}
								close.click();
console.log("LOG-LA-close clicked");
								await delay(1000);
								await confirmLeaveBattlePopup();
console.log("LOG-LA-confirmLeaveBattlePopup");
							}
							break;
						}
					}
				}
console.log("LOG-LA-done");
				goHome();
				isContentRunning = false;
			}
		}
	}
	const placeUnitButtons = document.querySelectorAll(".actionButton.actionButtonPrimary.capSlotButton.capSlotButtonAction");
	let placeUnit = null;
	//If there are no place unit buttons, invoke the collection function then return.
	if (placeUnitButtons.length == 0 || (placeUnitButtons.length == 1 && placeUnitButtons[0].innerText === "SELECT")) {
console.log("LOG-make false");
		await performCollectionInterval();
		isContentRunning = false;
		return;
	}
	//If placement buttons exist, validate them
	else if (placeUnitButtons.length != 0) {
		//Iterate through every button
		placeButtonLoop: for (var button of placeUnitButtons) {
console.log("LOG-button loop");
			//If the button has the inner text SELECT then continue to next button
			if (button.innerText.includes("SELECT")) continue;
			//If the button has the inner text PLACE UNIT it's a valid button
			if (button.innerText.includes("PLACE UNIT")) {
console.log("LOG-button has place unit");
				//Get captain name from the slot
				var captainSlot = button.closest('.capSlot');
				captainNameFromDOM = captainSlot.querySelector('.capSlotName').innerText;
				//Retrieve the slot pause state
				const btn = captainSlot.querySelector(".capSlotStatus .offlineButton");
				if (btn == null || btn == undefined) return;
				const buttonId = btn.getAttribute('id');
				const slotOption = buttonId.replace("offlineButton_", "");
				const slotState = await getIdleState(buttonId);
				let battleType;
				if (!captainSlot.innerText.includes("Dungeons") && !captainSlot.innerText.includes("Clash") && !captainSlot.innerText.includes("Duel")) {
					battleType = "Campaign";
				} else if (captainSlot.innerText.includes("Dungeons")) {
					battleType = "Dungeons";
				} else if (captainSlot.innerText.includes("Clash")) {
					battleType = "Clash";
				} else if (captainSlot.innerText.includes("Duel")) {
					battleType = "Duel";
				}

console.log("LOG-"+battleType);
				//If slot state is disabled, move to the next slot
				if (slotState == 0) continue;

				let captainFlag;
console.log("LOG-check if capt flagged");
				//Pass captain name and check if the captain is flagged
				try {
					if (!captainNameFromDOM) captainNameFromDOM = "";
					captainFlag = await getCaptainFlag(captainNameFromDOM, 'flaggedCaptains');
					if (captainFlag) continue;
					//Make a second attempt to set loyalty flag
				} catch (error) {
					captainFlag = false;
				}
console.log("LOG-"+ captainFlag);
console.log("LOG-check special game modes");
				let captKeysArray = ['dungeonCaptain', 'clashCaptain', 'duelCaptain', 'campaignCaptain', 'clashSwitch', 'dungeonSwitch', 'duelSwitch', 'campaignSwitch', 'modeChangeSwitch', 'modeChangeLeaveSwitch', 'multiClashSwitch'];
				let captKeys = await retrieveMultipleFromStorage(captKeysArray);
				let dungeonCaptainNameFromStorage = captKeys.dungeonCaptain?.toLowerCase() ?? "";
				let clashCaptainNameFromStorage = captKeys.clashCaptain?.toLowerCase() ?? "";
				let duelsCaptainNameFromStorage = captKeys.duelCaptain?.toLowerCase() ?? "";
				let campaignCaptainNameFromStorage = captKeys.campaignCaptain?.toLowerCase() ?? "";
				let clashSwitch = captKeys.clashSwitch;
				let duelSwitch = captKeys.duelSwitch;
				let dungeonSwitch = captKeys.dungeonSwitch;
				let campaignSwitch = captKeys.campaignSwitch;
				let modeChangeSwitch = captKeys.modeChangeSwitch;
				let modeChangeLeaveSwitch = captKeys.modeChangeLeaveSwitch;
				let multiClashSwitch = captKeys.multiClashSwitch;

				/* Check if the captain is running a special game mode and if the same captain is the one in storage.
				So if the dungeon captain on storage is Mike and there is another captain name John also running a dungeon
				the captain John will be skipped, this is done so only one captain runs a special mode at any given time and keys don't get reset.  */
				if (captainNameFromDOM && ((dungeonCaptainNameFromStorage != "," + captainNameFromDOM.toLowerCase() + ",") && battleType == "Dungeons") ||
					(!multiClashSwitch && (clashCaptainNameFromStorage.includes("," + captainNameFromDOM.toLowerCase() + ",")) && battleType == "Clash") ||
					((duelsCaptainNameFromStorage != "," + captainNameFromDOM.toLowerCase() + ",") && battleType == "Duel")) {
					continue;
				}
				/* Checks if the captain saved on storage running a special mode is still running the same mode, if they change they might lock
				the slot for 30 minutes so if a captain switches to campaign they are skipped and colored red */
				else if (captainNameFromDOM && !modeChangeSwitch &&
					((dungeonCaptainNameFromStorage == "," + captainNameFromDOM.toLowerCase() + "," && battleType != "Dungeons") ||
						(clashCaptainNameFromStorage.includes("," + captainNameFromDOM.toLowerCase() + ",") && battleType != "Clash") ||
						(campaignCaptainNameFromStorage.includes("," + captainNameFromDOM.toLowerCase() + ",") && battleType != "Campaign") ||
						(duelsCaptainNameFromStorage == "," + captainNameFromDOM.toLowerCase() + "," && battleType != "Duel"))) {
					/* If modeChangeLeaveSwitch is enabled, leave the captain and allow the idle switcher to find a replacement */
					if (!modeChangeLeaveSwitch) {
						captainSlot.style.backgroundColor = red;
					} else if (modeChangeLeaveSwitch) {
						let captLoyalty = await getCaptainLoyalty(captainNameFromDOM);
						let raidId = captLoyalty[0];
						let captainId = captLoyalty[2];
						await abandonBattle("Abandoned-Mode Change", "abandoned", captainSlot, raidId);
					}
					continue;
				}
				/* Checks if the slot is a special game mode and if a unit has already been placed it check if the user wants to place
				multiple units on special modes */
				else if (((battleType == "Dungeons" && !dungeonSwitch) || (battleType == "Clash" && !clashSwitch) ||
					((battleType == "Duel" && !duelSwitch)) || !campaignSwitch) &&
					captainSlot.querySelector('.capSlotClose') == null) {
					continue;
				}

				let userWaitTime = await getUserWaitTime(battleType);
				let batTime;
				try {
					const batClock = captainSlot.querySelector(".capSlotTimer").lastChild.innerText.replace(':', '');
					batTime = parseInt(batClock, 10);
					if (batTime > userWaitTime) continue;
				} catch (error) {
					console.log("");
				}

				if (battleType == "Clash" && placeUnitButtons.length > 1) {
					if (await retrieveFromStorage("nextClashSwitch")) {
						compareLoop: for (var placeButton of placeUnitButtons) {
							if (placeButton.innerText.includes("PLACE UNIT")) {
								var slotToCompare = placeButton.closest('.capSlot');
								//If another slot has clash, check the time and compare to the original
								if (slotToCompare.innerText.includes("Clash")) {
									//Retrieve the slot pause state
									const btnToCompare = slotToCompare.querySelector(".capSlotStatus .offlineButton");
									const buttonIdToCompare = btnToCompare.getAttribute('id');
									const slotStateToCompare = await getIdleState(buttonIdToCompare);
									if (slotStateToCompare == 1) {
										try {
											const batClockToCompare = slotToCompare.querySelector(".capSlotTimer").lastChild.innerText.replace(':', '');
											const batTimeToCompare = parseInt(batClockToCompare, 10);
											//If the time of the other slot is more than or equal to the original minus 2 seconds (for delay), skip to the next one to compare
											//If it's less, skip the original button altogether and go to the next available place button
											if (batTimeToCompare >= batTime - 2) {
												continue compareLoop;
											} else {
												continue placeButtonLoop;
											}
										} catch (error) {
											console.log("");
										}
									}
								}
							}
						}
					}
				}

console.log("LOG-placement odds");
				// Calculate placements odds
				const bSlot = button.closest('.capSlot');
				const currentTime = new Date();
				const oddKey = "oddId" + bSlot.querySelector(".offlineButton").id;
				let placementOdds = await retrieveNumberFromStorage("placementOddsInput");
				if (placementOdds == -100 || placementOdds == undefined || placementOdds > 100) {
					placementOdds = 100;
				} else if (placementOdds > 0 && placementOdds < 100) {

					let canPlace = false;

					await new Promise((resolve, reject) => {
						chrome.storage.local.get(oddKey, function (result) {
							if (chrome.runtime.lastError) {
								canPlace = true;
								resolve();
							} else {
								const enableTimeString = result[oddKey];
								if (enableTimeString) {
									const enableTime = new Date(enableTimeString);

									if (currentTime > enableTime) {
										canPlace = true;
									} else {
										canPlace = false;
									}
								} else {
									canPlace = true;
								}
								resolve();
							}
						});
					});
console.log("placement odds-can't place");
					if (!canPlace) continue;
				} else if (placementOdds <= 0) continue;

				const closeBtn = bSlot.querySelector(".capSlotClose");
				if (placementOdds != 100 && button.innerText.includes("PLACE UNIT") && !closeBtn) {
					if (!((Math.floor(Math.random() * 100) + 1) <= placementOdds)) {
						const minutes = Math.floor(Math.random() * 5) + 7;
						const eT = new Date(currentTime.getTime() + minutes * 60000);
						const eTString = eT.toISOString();
						await chrome.storage.local.set({ [oddKey]: eTString });
console.log("placement odds-can't place-time");
						continue;
					}
				}

console.log("LOG-check loyalty");
				//Pass captain name and check if the captain has a loyalty flag.
				const loyaltyRadio = await getRadioButton("loyalty");
				let loyaltyRadioInt = 0;
				try {
					loyaltyRadioInt = parseInt(loyaltyRadio);
				} catch (error) {
					loyaltyRadioInt = 0;
				}
console.log("LOG-check loyalty2");
				let notAcceptableLoyalty, captainLoyalty, pveWins, captainLoyaltyLevel, raidId;
				for (let i = 0; i < activeRaidsArray.length; i++) {
					if (activeRaidsArray[i].twitchDisplayName == captainNameFromDOM) {
						pveWins = activeRaidsArray[i].pveWins;
						// captainLoyaltyLevel = pveWins >= 98 ? "Diamond" : (pveWins < 98 && pveWins >= 48) ? "Gold" : (pveWins < 48 && pveWins >= 13) ? "Silver" : "Bronze";
						captainLoyaltyLevel = pveWins >= 98 ? 4 : (pveWins < 98 && pveWins >= 48) ? 3 : (pveWins < 48 && pveWins >= 13) ? 2 : 1;
						raidId = activeRaidsArray[i].raidId;
						i = activeRaidsArray.length;
					}
				}
				let lResults = await getCaptainLoyalty(captainNameFromDOM);
				let chestType = lResults[1];
console.log("LOG-check loyalty2.1");
				if (battleType == "Campaign" && loyaltyRadioInt != 0 && loyaltyRadio != undefined) {
					try {
						captainLoyalty = await getCaptainFlag(captainNameFromDOM, 'captainLoyalty');
						if (!captainLoyalty || captainLoyalty == undefined) {

console.log("LOG-check loyalty2.5");
							let chestKeysArray = ['lgoldSwitch', 'lskinSwitch', 'lscrollSwitch', 'ltokenSwitch', 'lbossSwitch', 'lsuperbossSwitch'];
							let chestKeys = await retrieveMultipleFromStorage(chestKeysArray);
							let lgold = chestKeys.lgoldSwitch;
							let lskin = chestKeys.lskinSwitch;
							let lscroll = chestKeys.lscrollSwitch;
							let ltoken = chestKeys.ltokenSwitch;
							let lboss = chestKeys.lbossSwitch;
							let lsuperboss = chestKeys.lsuperbossSwitch;
							if ((!lgold && chestType == "chestboostedgold") || (!lskin && chestType.includes("chestboostedskin")) || (!lskin && chestType.includes("chestboostedbeastlands")) || (!lskin && chestType.includes("chestboostedskinalternate")) || (!lscroll && chestType == "chestboostedscroll") || (!ltoken && chestType == "chestboostedtoken") || (!lboss && chestType == "chestboss") || (!lsuperboss && chestType == "chestbosssuper")) {
								captainLoyalty = true;
							} else if (chestType == "bonechest" || chestType == "dungeonchest" || chestType == "chestbronze" || chestType == "chestsilver" || chestType == "chestgold") {
								captainLoyalty = false;
							} else {
								captainLoyalty = false;
							}

console.log("LOG-check loyalty3");
							if (captainLoyalty) {
								if (loyaltyRadioInt == 0 || captainLoyaltyLevel >= loyaltyRadioInt) {
									notAcceptableLoyalty = false;
									captainFlag = false;
								}
								else {
									notAcceptableLoyalty = true;
									captainFlag = true;
								}
							}
						}
					} catch (error) {
						console.log(error);
						notAcceptableLoyalty = true;
						captainFlag = true;

					}
				} else {
					notAcceptableLoyalty = false;
					captainFlag = false;
				}
				//If captain has any flags, change color and move to the next slot

console.log("LOG-check max unit");
				if (await retrieveMaxUnit(captainNameFromDOM)) continue;
				if (notAcceptableLoyalty || captainFlag) {
					if (notAcceptableLoyalty) captainSlot.style.backgroundColor = blue;
					continue;
				} else {
					captainSlot.style.backgroundColor = gameBlue;
				}

				placeUnit = button;

console.log("LOG-click place unit");
				//If place unit exists, click it and call the openBattlefield function
				if (placeUnit) {
					placeUnit.click();
console.log("LOG-open battlefield");
					await delay(1000);
					await openBattlefield(captainNameFromDOM, raidId, slotOption, notAcceptableLoyalty, captainLoyaltyLevel, battleType);
					break;
				} else {
console.log("LOG-make false");
					isContentRunning = false;
					return;
				}
				await performCollectionInterval();
			} else {
console.log("LOG-continue to next slot");
				await performCollectionInterval();
				continue;
			}
		}
	}
console.log("LOG-done with start");
	closeAll();
	await performCollectionInterval();
console.log("LOG-make false");
	isContentRunning = false;
}

async function performCollectionInterval() {
	if (await retrieveFromStorage("paused_checkbox") || (new Date().getTime() - collectLastTime.getTime()) / 1000 < 10) return;
	if (collectRunning) return;
	collectRunning = true;
	await collectQuests();
	await buyScrolls();
	await collectBattlePass();
	await buyChests();
	if (await checkEventCurrencyActive()) {
		await collectEventChests();
		collectLastTime = new Date();
		collectRunning = false;
		isContentRunning = false;
		await collectFreeDaily();
	}
	collectLastTime = new Date();
	collectRunning = false;
}

// This function checks if the battlefield is present, the current chest type, then zooms into it.
async function openBattlefield(captainNameFromDOM, raidId, slotOption, notAcceptableLoyalty, captainLoyaltyLevel, battleType) {
	let chestKeysArray = ['lgoldSwitch', 'lskinSwitch', 'lscrollSwitch', 'ltokenSwitch', 'lbossSwitch', 'lsuperbossSwitch'];
	let chestKeys = await retrieveMultipleFromStorage(chestKeysArray);
	let lgold = chestKeys.lgoldSwitch;
	let lskin = chestKeys.lskinSwitch;
	let lscroll = chestKeys.lscrollSwitch;
	let ltoken = chestKeys.ltokenSwitch;
	let lboss = chestKeys.lbossSwitch;
	let lsuperboss = chestKeys.lsuperbossSwitch;

	arrayOfMarkers = null;
	unitDrawer = null;
	await delay(3000);

	// Attempts to check if battlefield is open
	let battleInfo;
	try {
		battleInfo = document.querySelector(".battleInfo").innerText;
	} catch (error) {
		return;
	}

	//Current mode is campaign
	if (battleType == "Campaign") {
console.log("LOG-check chest");
		//Opens battle info and checks chest type.
		battleInfo = document.querySelector(".battleInfoMapTitle");
		if (battleInfo == null) {
			goHome();
			return;
		}
		battleInfo.click();

console.log("LOG-get unit amount");
		//Check how many units user wants
		const unitQtt = await getUnitAmountData();
		hasPlacedSkin = false;
		let commaCount = 0;

console.log("LOG-get unit amount2");
		try {
			while (logRunning == true) await delay(10);
			logRunning = true;
console.log("LOG-get unit amount3");
			let battleLog = await retrieveFromStorage("logData");
console.log("LOG-get unit amount4");
			logRunning = false;
			battleLog = battleLog.slice(-4);
			for (let i = battleLog.length - 1; i >= 0; i--) {
				const battleOfInterest = battleLog[i];
				if (battleOfInterest.raidId.trim() === raidId) {
					const unitsPlaced = battleOfInterest.units2.toLowerCase();
					commaCount = unitsPlaced.split(",").length - 1;
					if (unitsPlaced.includes(captainNameFromDOM.toLowerCase().trim())) hasPlacedSkin = true;
					break;
				}
			}
		} catch (error) { }

console.log("LOG-setMaxUnit "+commaCount+" "+unitQtt);
		if (commaCount >= unitQtt) {
			await setMaxUnit(captainNameFromDOM);
			closeAll();
			goHome();
			return;
		}

console.log("LOG-chest double check");
		await delay(1000);
		let chest;
		try {
			chest = document.querySelector(".mapInfoRewardsName").innerText;
			closeAll();
		} catch (error) {
			goHome();
			return;
		}

console.log("LOG-setLogInitialChest2");
		await setLogInitialChest2(captainNameFromDOM, raidId, chest);

console.log("LOG-" + chest);
		if (notAcceptableLoyalty && ((!lgold && chest == "Loyalty Gold Chest") || (!lskin && chest == "Loyalty Skin Chest") || (!lskin && chest == "Loyalty Beastlands Chest") || (!lscroll && chest == "Loyalty Scroll Chest") || (!ltoken && chest == "Loyalty Token Chest") || (!lboss && chest == "Loyalty Boss Chest") || (!lsuperboss && chest == "Loyalty Super Boss Chest"))) {
			//Flag the captain loyalty since the current map is to be skipped
			await flagCaptain('captainLoyalty');
			//Close the chest info popup and return to main menu
			closeAll();
			goHome();
			return;
		} else {
			//Current chest is not special, close chest info and zoom
			closeAll();
console.log("LOG-get valid units 1");
			await getValidUnits(captainNameFromDOM, raidId, slotOption, notAcceptableLoyalty, captainLoyaltyLevel, battleType);
		}
	} else {
		//User doesn't want to preserve diamond loyalty
		closeAll();
console.log("LOG-get valid units 2");
		await getValidUnits(captainNameFromDOM, raidId, slotOption, notAcceptableLoyalty, captainLoyaltyLevel, battleType);
	}
}

async function getValidUnits(captainNameFromDOM, raidId, slotOption, notAcceptableLoyalty, captainLoyaltyLevel, battleType) {
	currentMarker = null;
	unitDrawer = null;
	//Function to check for a frozen state
	await reloadRoot();
	await delay(1000);

console.log("LOG-clock");
	// If the timer is +28:30 or above (+4:00 for dungeons), go back to the main menu as the captain may still be placing markers.
	const clockElement = document.querySelector('.battlePhaseTextClock .clock');
	if (clockElement == null) {
		goHome();
		return;
	} else {
		//Initializes a variable with battle clock
		const timeText = clockElement.innerText.replace(':', '');
		const time = parseInt(timeText, 10);

		if (time > await getUserWaitTime(battleType)) {
			goHome();
			return;
		}
	}

console.log("LOG-zoom");
	zoom();

	// This sorts the markers and adds imaginary markers if there aren't any
console.log("LOG-make markers");
	if ((1 == 2 && battleType == "Dungeons") || captainNameFromDOM == "ImmerBock") {
		setUpMarkers(Array.from(document.querySelectorAll(".planIcon")));
	} else {
		makeMarkers();
	}
console.log("LOG-arrayOfMarkers1");
	let arrayOfMarkers = Array.of(document.querySelectorAll(".planIcon"));
console.log("LOG-arrayOfMarkers2");
	arrayOfMarkers = getMapMatrix(arrayOfMarkers);
console.log("LOG-arrayOfMarkers3");
	arrayOfMarkers = bumpVibeMarkers(arrayOfMarkers);
	let isEnemyPresent = [];
	for (let i = 0; i < isEnemyPresentNameArray.length; i++) {
		isEnemyPresent[i] = document.querySelector('img[alt="' + isEnemyPresentNameArray[i] + '"]');
	}

console.log("LOG-unit drawer");
	// Open unit drawer and set the filter to ALL units
	const placeUnitBtn = document.querySelector(".actionButton.actionButtonPrimary.placeUnitButton");
	if (placeUnitBtn) {
		placeUnitBtn.click();
		await delay(1000);
		document.querySelector('.unitFilterButton')?.click();
	} else {
		goHome();
		return;
	}

console.log("LOG-equip skins");
	let equipSwitch = false;
	//Check if user wants to auto equip skins and equip them
	if (battleType == "Campaign") equipSwitch = await retrieveFromStorage("equipSwitch");
	//Get the unit switcher container
	const unitSwitcher = document.querySelector('.settingsSwitchCont');
	if (equipSwitch !== undefined && unitSwitcher) {
		//Get the unit switch check box, doing it inside the if garantees the the checkbox exists.
		const checkbox = unitSwitcher.querySelector('input[type="checkbox"]');
		//Assign true or false to the checkbox
		if (checkbox) checkbox.checked = equipSwitch;
	} else if (unitSwitcher) {
		//Value from storage couldn't be retrieved, assign false to the unit checkbox
		const checkbox = unitSwitcher.querySelector('input[type="checkbox"]');
		if (checkbox) checkbox.checked = false;
	}

	let dungeonLevelSwitch, dungeonLevel, userUnitLevel = 0, userDunLevel;
	if (battleType == "Dungeons") {
		console.log("LOG-check dungeon");
		// Check dungeon
		let dungeonKeysArray = ['dungeonLevelSwitch', 'maxDungeonLvlInput', 'maxUnitLvlDungInput'];
		let dungeonKeys = await retrieveMultipleFromStorage(dungeonKeysArray);
		dungeonLevelSwitch = dungeonKeys.dungeonLevelSwitch;
		try {
			userDunLevel = parseFloat(dungeonKeys.maxDungeonLvlInput, 10);
			userUnitLevel = parseFloat(dungeonKeys.maxUnitLvlDungInput, 10);
		} catch (error) { }

		let battleInfo = "";
		try {
			battleInfo = document.querySelector(".battleInfo").innerText;
			if (battleInfo.includes("Level")) dungeonLevel = parseInt(battleInfo.substr(battleInfo.length - 3).replace(":", ""));
		} catch (error) { }
	}

console.log("LOG-unit drawer again");
	//Get all units from the drawer
	let canCompleteQuests = await retrieveFromStorage("completeQuests");
	unitDrawer = [...document.querySelectorAll(".unitSelectionCont")];
	let unitsToRemove = [];

	// Remove cooldown units, unavailable units and rarity check units
	if (!unitDrawer || !unitDrawer[0] || unitDrawer[0].children == null) return;

console.log("LOG-unit name and type in unit");
	//Add unit name and type to unit itself
	for (const unit of unitDrawer[0].children) {
		const unitClassImg = unit.querySelector('.unitClass img');
		const unitType = unitClassImg.getAttribute('alt').toUpperCase();
		const unitName = unitClassImg.getAttribute('src').slice(-50).toUpperCase();
		const unit1 = arrayOfUnits.find(unit1 => unitName.includes(unit1.icon.toUpperCase()));
		if (unit1) unit.id = unit1.key + "#" + unitType;
	}

console.log("LOG-begin unit drawer processing");
	let unitKeysArray = ['legendarySwitch', 'rareSwitch', 'uncommonSwitch', 'commonSwitch', 'pvpSpecSwitch'];
	let unitKeys = await retrieveMultipleFromStorage(unitKeysArray);
	let legendaryAllowed = unitKeys.legendarySwitch;
	let rareAllowed = unitKeys.rareSwitch;
	let uncommonAllowed = unitKeys.uncommonSwitch;
	let commonAllowed = unitKeys.commonSwitch;
	let pvpSpecAllowed = unitKeys.pvpSpecSwitch;

	try {
		if (unitDrawer[0] == null) return;
	} catch (error) {
		return;
	}
	for (let i = 0; i < unitDrawer[0].children.length; i++) {
		let unit = unitDrawer[0].children[i];

		//Get unit rarity
		let commonCheck = unit.querySelector('.unitRarityCommon');
		let uncommonCheck = unit.querySelector('.unitRarityUncommon');
		let rareCheck = unit.querySelector('.unitRarityRare');
		let legendaryCheck = unit.querySelector('.unitRarityLegendary');

		//Check if unit has a spec
		let specCheck = unit.querySelector('.unitSpecialized');

		//Get unit status: cooldown, defeated
		let coolDownCheck = unit.querySelector('.unitItemCooldown');
		let defeatedCheck = unit.querySelector('.defeatedVeil');
		//If unit has this class it's enabled, if it doesn't have it's not enabled.
		let unitDisabled = unit.querySelector('.unitItemDisabledOff');
		let unitName, unitLevel;
		try {
			unitName = unit.querySelector('.unitClass img').getAttribute('src').slice(-50).toUpperCase();
			unitLevel = parseInt(unit.querySelector('.unitLevel').innerText);
		} catch (error) {
			continue;
		}
		if (coolDownCheck || defeatedCheck || !unitDisabled) {
			unitsToRemove.push(unit);
			continue;
		}
		if (legendaryCheck && !legendaryAllowed && !canCompleteQuests) {
			unitsToRemove.push(unit);
			continue;
		} else if (rareCheck && !rareAllowed && !canCompleteQuests) {
			unitsToRemove.push(unit);
			continue;
		} else if (uncommonCheck && !uncommonAllowed && !canCompleteQuests) {
			unitsToRemove.push(unit);
			continue;
		} else if (commonCheck && !commonAllowed && !canCompleteQuests) {
			unitsToRemove.push(unit);
			continue;
		} else if ((battleType == "Clash" || battleType == "Duel") && specCheck == null && pvpSpecAllowed) {
			unitsToRemove.push(unit);
			continue;
		}

		//If campaign and specified enemy is present, remove the associated units
		if (battleType == "Campaign") {
			for (let j = 0; j < isEnemyPresent.length; j++) {
				if (isEnemyPresent[j] && unit.id.includes(ifPresentAvoidUnitArray[j].toUpperCase())) {
					unitsToRemove.push(unit);
					continue;
				}
			}
		}

		// Remove units based on unit level
		if (battleType == "Dungeons") {
			if ((userDunLevel == null || userDunLevel == undefined || userUnitLevel == null || userUnitLevel == undefined) && !unit.id.includes("AMAZON")) {
				continue;
			} else if ((dungeonLevelSwitch && dungeonLevel <= userDunLevel && unitLevel > userUnitLevel) || unit.id.includes("AMAZON")) {
				unitsToRemove.push(unit);
				continue;
			}
		}
	}
console.log("LOG-done with processing units");

	unitsToRemove.forEach(unit => unit.remove());
	unitsToRemove = undefined;
	unitDrawer = [...document.querySelectorAll(".unitSelectionCont")];

console.log("LOG-slot user priority list");
	let slotNum;
	if (battleType == "Dungeons" && await retrieveFromStorage("priorityListSwitch5")) {
		slotNum = '5';
	} else if (battleType == "Clash" && await retrieveFromStorage("priorityListSwitch6")) {
		slotNum = '6';
	} else if (battleType == "Duel" && await retrieveFromStorage("priorityListSwitch7")) {
		slotNum = '7';
	} else {
		slotNum = slotOption;
	}
	console.log("LOG-priority and shuffle switches");
	let switchKeysArray = ['priorityListSwitch' + slotNum, 'priorityListSwitch0', 'shuffleSwitch' + slotNum, 'shuffleSwitch0', 'soulSwitch' + slotNum, 'soulSwitch0'];
	let switchKeys = await retrieveMultipleFromStorage(switchKeysArray);
	let priorityListSwitchSlot = switchKeys['priorityListSwitch' + slotNum];
	let priorityListSwitchAll = switchKeys.priorityListSwitch0;
	let shuffleSwitchSlot = switchKeys['shuffleSwitch' + slotNum];
	let shuffleSwitchSlotAll = switchKeys.shuffleSwitch0;
	let soulSwitchSlot = switchKeys['soulSwitch' + slotNum];
	let soulSwitchSlotAll = switchKeys.soulSwitch0;

console.log("LOG-priority and shuffle switches end");
	let shuffleSwitch = false;
	if (shuffleSwitchSlot || shuffleSwitchSlotAll) shuffleSwitch = true;
	let soulSwitch = false;
	if (soulSwitchSlot || soulSwitchSlotAll) soulSwitch = true;
	if (!canCompleteQuests) {
		//If unit priority list for the slot is selected, use the list for the slot
		if (priorityListSwitchSlot) {
			unitDrawer = await sortPriorityUnits(unitDrawer, slotNum, shuffleSwitch);
			//If unit priority list for the slot is not selected and unit priority list for all slots is selected, use the list for all slots
		} else if (!priorityListSwitchSlot && priorityListSwitchAll) {
			unitDrawer = await sortPriorityUnits(unitDrawer, "0", shuffleSwitch);
		} else if (shuffleSwitch) {
			const children = [...document.querySelectorAll(".unitSelectionCont")[0].children];
			children.sort(() => Math.random() - 0.5);
			children.forEach(child => document.querySelector(".unitSelectionCont").appendChild(child));
		}
	}

console.log("LOG-unit qty");
	//Initializes a node list with all units
	let unitsQuantity;
	//Attempts to get amount of units in the units drawers
	try {
		unitsQuantity = unitDrawer[0].children.length;
	} catch (error) {
		goHome();
		return;
	}

	//Sort the array so units with souls are put on the front.
	if (soulSwitch && !canCompleteQuests) {
		const soulSwitcher = document.querySelector('.unitFilterSoulSwitch input[type="checkbox"]');
		soulSwitcher.click();
		for (let i = 1; i <= unitsQuantity; i++) {
			const unit = unitDrawer[0].querySelector(".unitSelectionItemCont:nth-child(" + i + ") .unitItem:nth-child(1)");
			// Check if unit has a soul
			let soulCheck = unit.querySelector('img[alt="UnitSoulIcon"]');
			if (soulCheck) {
				const unitIndex = Array.from(unitDrawer[0].children).findIndex(item => item === unit.parentElement);
				if (unitIndex === -1) {
					continue;
				} else {
					unitDrawer[0].insertBefore(unitDrawer[0].children[unitIndex], unitDrawer[0].children[0]);
				}
			}
		}
	}

console.log("LOG-shift units");
	//Sort the array so units that match the captain skin are put on the front.
	async function shiftUnits(captainNameFromDOM) {
		for (let i = 1; i <= unitsQuantity; i++) {
			const unit = unitDrawer[0].querySelector(".unitSelectionItemCont:nth-child(" + i + ") .unitItem:nth-child(1)");
			if (unit.innerHTML.includes(captainNameFromDOM)) {
				const unitIndex = Array.from(unitDrawer[0].children).findIndex(item => item === unit.parentElement);
				if (unitIndex === -1) {
					continue;
				} else {
					unitDrawer[0].insertBefore(unitDrawer[0].children[unitIndex], unitDrawer[0].children[0]);
				}
			}
		}
	}

console.log("LOG-more skins switch1");
	let skinKeysArray = ['moreSkinsSwitch', 'equipNoDiamondSwitch'];
	let skinKeys = await retrieveMultipleFromStorage(skinKeysArray);
	let moreSkinsSwitch = skinKeys.moreSkinsSwitch;
	let equipNoDiamondSwitch = skinKeys.equipNoDiamondSwitch;

console.log("LOG-more skins switch2");
	//Put skinned units at the front if quest completer is not enabled.
	if (hasPlacedSkin) {
		moreSkinsSwitch = false;
	} else {
		moreSkinsSwitch = true;
	}

console.log("LOG-more skins switch logic");
	if (!soulSwitch && moreSkinsSwitch && equipSwitch && !canCompleteQuests) {
		if (!equipNoDiamondSwitch || (equipNoDiamondSwitch && captainLoyaltyLevel != 4)) {
			try {
				await shiftUnits(captainNameFromDOM);
			} catch (error) {
				unitDrawer = [...document.querySelectorAll(".unitSelectionCont")];
				console.log("log" + error);
			}
		}
	}

console.log("LOG-unit drawer and can complete quest");
	if (canCompleteQuests) {
		try {
			unitDrawer = await completeQuests(unitDrawer, unfinishedQuests);
		} catch (error) {
			unitDrawer = [...document.querySelectorAll(".unitSelectionCont")];
		}
	}

	if (!arrayOfMarkers || arrayOfMarkers.length == 0) {
		await flagCaptain('flaggedCaptains');
		goHome();
		return;
	}

console.log("LOG-set marker switch");
	if (await retrieveFromStorage("setMarkerSwitch")) {
		const arrayOfVibeMarkers = arrayOfMarkers.filter(marker => marker.id === "VIBE");
		const notVibeMarkers = arrayOfMarkers.filter(marker => marker.id !== "VIBE");

		arrayOfMarkers = notVibeMarkers.concat(arrayOfVibeMarkers);
	}

	let potionState = 0;
	let favoriteSwitch = false;
	let dungeonBossPotionSwitch;
	let isBossLevel = false;
	if (battleType == "Campaign") {
		potionState = await getRadioButton("selectedOption");
		favoriteSwitch = await getSwitchState("favoriteSwitch");
	} else if (battleType == "Dungeons") {
		dungeonBossPotionSwitch = await getSwitchState("dungeonBossPotionSwitch");
		if (dungeonLevel % 3 === 0) isBossLevel = true;
	}
console.log("LOG-loop for placement");
	let counter = 0;
	try {
		if (unitDrawer[0] == null) return;
	} catch (error) {
		return;
	}
	outer_loop: for (const unit of unitDrawer[0].children) {
		const unitId = unit.id;
		for (const marker of arrayOfMarkers) {
			if (placementOver == true) break;
			if (marker.offsetLeft == 0 && marker.offsetTop == 0) continue;
			const markerId = marker.id;
			let hasPlaced;
			if (markerId === "VIBE" || markerId.includes(unitId.split("#")[0]) || markerId.includes(unitId.split("#")[1])) {
console.log("LOG-potions");
				if (potionState != 0 || dungeonBossPotionSwitch) await doPotions(battleType, favoriteSwitch, isBossLevel, captainNameFromDOM);
				hasPlaced = await attemptPlacement(unit, marker);
				if (hasPlaced == undefined || hasPlaced) {
console.log("LOG-has placed, return home "+markerId+" "+unitId);
					goHome();
					closeAll();
					return;
				} else {
					await cancelPlacement();
					continue;
				}
			}
			counter++;
		}
console.log("LOG-out of markers, next unit");
	}
console.log("LOG-out of units, return home");
	goHome();
	closeAll();
}

async function cancelPlacement() {
console.log("LOG-cancel placement");
	const cancelBtn = document.querySelector(".actionButton.actionButtonNegative.placerButton");
	if (cancelBtn) {
		cancelBtn.click();
		await delay(500);
	}

	const unitDrawer = document.querySelector(".actionButton.actionButtonPrimary.placeUnitButton");
	if (unitDrawer) unitDrawer.click();
}

async function attemptPlacement(unit, marker) {
console.log("LOG-attempt placement");
	if (!await moveScreen(marker)) {
		closeAll();
		goHome();
		return true;
	}
	await delay(500);
	unit.querySelector(".unitItem").click();
	await delay(500);
	if (!tapUnit()) return true;
	await delay(500);
	await placeTheUnit();
	await delay(500);
	await reloadRoot();
	await delay(500);
	return checkPlacement();
}

function checkPlacement() {
console.log("LOG-check placement");
	const hasPlaced = document.querySelector(".actionButton.actionButtonDisabled.placeUnitButton");
	const menu = document.querySelector(".captainSlots");

	if (menu || (hasPlaced && hasPlaced.innerText.includes("UNIT READY TO PLACE IN"))) {
		return true;
	} else {
		return false;
	}
}

//Places unit or asks for a new valid marker
async function placeTheUnit() {
console.log("LOG-place the unit");
	try {
		const clockText = document.querySelector('.battlePhaseTextClock .clock').innerText;

console.log("LOG-check battle timer");
		if (clockText === "00:00") {
			const placerButton = document.querySelector(cancelButtonSelector);
			const selectorBack = document.querySelector(".selectorBack");

			if (placerButton && selectorBack) {
				placerButton.click();
				selectorBack.click();
console.log("LOG-test");
				return true;
			}
		}
	} catch (error) {
console.log("LOG-error with clocktext, go home");
		goHome();
		return true;
	}

	//Attemps to place the selected unit and go back to menu, if the marker is valid, but in use, get a new marker.
	const placeModal = document.querySelector(".placerConfirmButtonsCont");
	let confirmPlacement = placeModal?.querySelector(".actionButton.actionButtonPrimary.placerButton");


console.log("LOG-confirm placement");
	if (confirmPlacement) {
		//Placement is blocked by invalid unit location.
		const blockedMarker = document.querySelector(".placerRangeIsBlocked");
		if (blockedMarker) {
			const cancelButton = document.querySelector(cancelButtonSelector);
			if (cancelButton) {
console.log("LOG-blocked marker, click cancel");
				cancelButton.click();
				return false;
			}
			else {
console.log("LOG-blocked marker, no cancel, go home");
				goHome();
				return true;
			}
		} else {
			if (confirmPlacement) {
				confirmPlacement.click();
				await delay(1000);
console.log("LOG-confirm placement");
				//Rarely, it attempts to place incorrectly. If the Place Anyway pop up appears, click BACK
				let allPlaceAnywayBackButtons = document.querySelectorAll('.actionButton.actionButtonPrimary');
				let placeAnywayBackButton;
				allPlaceAnywayBackButtons.forEach(button => {
					if (button.innerText === "BACK") placeAnywayBackButton = button;
				});
				if (placeAnywayBackButton) {
console.log("LOG-place anyway popup, click back");
					placeAnywayBackButton.click();
					return true;
				}
			}
		}
	} else {
console.log("LOG-no confirm placement button, go home");
		goHome();
		return true;
	}

	//Unit was placed successfully, returns to main menu and the process restarts.
	setTimeout(() => {
		const placementSuccessful = document.querySelector(".actionButton.actionButtonDisabled.placeUnitButton");
		if (placementSuccessful) {
console.log("LOG-successful placement, go home");
			goHome();
			return true;
		}
	}, 3000);

	setTimeout(() => {
		const disabledButton = document.querySelector(".actionButton.actionButtonDisabled.placerButton");
		const negativeButton = document.querySelector(cancelButtonSelector);
		if (disabledButton || negativeButton) {
console.log("LOG-disabled/negative buttons");
			disabledButton?.click();
			negativeButton?.click();
console.log("LOG-make false");
			isContentRunning = false;
			goHome();
			return false;
		}
	}, 5000);
}

const obsv = new MutationObserver(async function (mutations) {

	if (await retrieveFromStorage("paused_checkbox")) return;

	mutations.forEach(async function (mutation) {
		if (mutation.type === 'childList') {
			// Check if the added nodes contain an element with the desired class
			const addedNodes = mutation.addedNodes;
			for (const node of addedNodes) {
				if (node.classList && node.classList.contains('mainNavItemText')) start();
			}
		}

		// const placeAnywayBtns = document.querySelectorAll(".actionButton.actionButtonSecondary");
        // placeAnywayBtns.forEach(btn => {
            // if (btn.innerText.trim() === "PLACE ANYWAY") {
                // btn.click();
            // }
        // });
		
		//Get captain slots or returns if they don't exist
		const captainSlots = document.querySelectorAll(".capSlots");
		if (captainSlots.length == 0) return;

		//Set offline button states after load.
		const allCapSlots = document.querySelectorAll(".capSlot");
		for (const slot of allCapSlots) {
			//Iterate through every button
			try {
				const btnOff = slot.querySelector(".capSlotStatus .offlineButton");
				if (btnOff == null) return;
				const btnId = btnOff.getAttribute('id');
				//Retrieve button state from storage
				let offstate = await getIdleState(btnId);
				//Obtained inner text and color for the user to visually identify
				if (offstate == 1) {
					btnOff.textContent = "ENABLED";
					btnOff.style.backgroundColor = "#5fa695";
				} else if (offstate == 2) {
					btnOff.textContent = "LEAVE AFTER";
					btnOff.style.backgroundColor = "green";
				} else {
					btnOff.textContent = "DISABLED";
					btnOff.style.backgroundColor = "red";
				}
			} catch (error) {
				return;
			}
		}

		//Using the game mode key retrieves captainName from storage
		const firstCapSlot = captainSlots[0];
		const capSlotChildren = firstCapSlot.querySelectorAll('.capSlot');

		let captKeysArray = ['dungeonCaptain', 'clashCaptain', 'duelCaptain', 'campaignCaptain', 'clashSwitch', 'dungeonSwitch', 'duelSwitch', 'campaignSwitch', 'modeChangeSwitch', 'multiClashSwitch'];
		let captKeys = await retrieveMultipleFromStorage(captKeysArray);
		let dungeonCaptainNameFromStorage = captKeys.dungeonCaptain?.toLowerCase() ?? "";
		let clashCaptainNameFromStorage = captKeys.clashCaptain?.toLowerCase() ?? "";
		let duelsCaptainNameFromStorage = captKeys.duelCaptain?.toLowerCase() ?? "";
		let campaignCaptainNameFromStorage = captKeys.campaignCaptain?.toLowerCase() ?? "";
		let modeChangeSwitch = captKeys.modeChangeSwitch;
		let capNameDOM;
		let multiClashSwitch = captKeys.multiClashSwitch;

		//Gets captain name from the dom
		for (const capSlot of capSlotChildren) {
			let battleType;
			if (!capSlot.innerText.includes("Dungeons") && !capSlot.innerText.includes("Clash") && !capSlot.innerText.includes("Duel")) {
				battleType = "Campaign";
			} else if (capSlot.innerText.includes("Dungeons")) {
				battleType = "Dungeons";
			} else if (capSlot.innerText.includes("Clash")) {
				battleType = "Clash";
			} else if (capSlot.innerText.includes("Duel")) {
				battleType = "Duel";
			}
			//Attemps to get the captain name from the current slot
			try {
				capNameDOM = capSlot.querySelector('.capSlotName').innerText;
			} catch (error) {
				continue;
			}

			//Get flag states
			let purpleFlag = await getCaptainFlag(capNameDOM, 'flaggedCaptains');
			if (!purpleFlag) purpleFlag = await retrieveMaxUnit(capNameDOM);

			const blueFlag = await getCaptainFlag(capNameDOM, 'captainLoyalty');

			/*If the current captain is running a special mode and is not the one with the current flag OR
			if the currently flagged captain is not running their assigned special mode they get colored red
			for visual identification */
			if (blueFlag) {
				capSlot.style.backgroundColor = blue;
			}
			else if (purpleFlag) {
				capSlot.style.backgroundColor = purple;
			}
			else if (!modeChangeSwitch &&
				(((campaignCaptainNameFromStorage.includes("," + capNameDOM.toLowerCase() + ",")) && battleType != "Campaign") ||
					((dungeonCaptainNameFromStorage != "," + capNameDOM.toLowerCase() + ",") && battleType == "Dungeons") ||
					(!multiClashSwitch && (!clashCaptainNameFromStorage.includes("," + capNameDOM.toLowerCase() + ",")) && battleType == "Clash") ||
					((duelsCaptainNameFromStorage != "," + capNameDOM.toLowerCase() + ",") && battleType == "Duel") ||
					((dungeonCaptainNameFromStorage == "," + capNameDOM.toLowerCase() + ",") && battleType != "Dungeons") ||
					((clashCaptainNameFromStorage.includes("," + capNameDOM.toLowerCase() + ",")) && battleType != "Clash") ||
					((duelsCaptainNameFromStorage == "," + capNameDOM.toLowerCase() + ",") && battleType != "Duel"))) {
				capSlot.style.backgroundColor = red;
			}
			else {
				capSlot.style.backgroundColor = gameBlue;
			}
		}
	});
});

const tgtNode = document.documentElement;
const conf = { childList: true, subtree: true };
obsv.observe(tgtNode, conf);

//This function resets the running state and closes the battlefield back to home.
function goHome() {
console.log("LOG-goHome-make false");
	isContentRunning = false;
	placementOver = false;
	const backHome = document.querySelector(".selectorBack");
	if (backHome) {
		backHome.click();
		const menuElements = document.querySelectorAll(".slideMenuCont.slideLeft.slideLeftOpen");
		const leaderboard = Array.from(menuElements).find(element => element.innerText.includes('Leaderboard'));
		if (leaderboard) {
			leaderboard.classList.remove('slideLeftOpen');
			leaderboard.classList.add('slideLeftClosed');
		}
	}
}

async function doPotions(battleType, favoriteSwitch, isBossLevel, captainNameFromDOM) {
	let favoritePotion = !favoriteSwitch;

	if (battleType == "Campaign" && favoriteSwitch) {
		try {
			const potionCaptainsList = await new Promise((resolve) => {
				chrome.storage.local.get({ 'potionlist': [] }, function (result) {
					resolve(result.potionlist);
				});
			});

			if (Array.isArray(potionCaptainsList) && potionCaptainsList.length > 0) {
				favoritePotion = potionCaptainsList.some(item => item.toUpperCase() === captainNameFromDOM.toUpperCase());
			}
		} catch (error) { }
	}

	if (battleType == "Campaign" && favoritePotion) {
		try {
			const potions = document.querySelector("img[alt='Potion']").closest(".quantityItem");
			const potionQuantity = parseInt(potions.querySelector(".quantityText").textContent.substring(0, 3));

			if (potionQuantity >= 45 || potionQuantity === 100) {
				const epicButton = document.querySelector(".actionButton.actionButtonPrimary.epicButton");
				if (epicButton) epicButton.click();
			}
		} catch (error) {
			goHome();
		}
	}

	if (battleType == "Dungeons" && isBossLevel) {
		try {
			const epicButton = document.querySelector(".actionButton.actionButtonPrimary.epicButton");
			if (epicButton) epicButton.click();
		} catch (error) {
			goHome();
		}
	}
}

async function moveScreen(marker) {

	//Set marker dimensions to zero so the unit can fit in its place
	try {
		marker.style.width = '0';
		marker.style.height = '0';
		marker.style.backgroundSize = '0';

		//Move screen so the current marker gets centered
		await delay(1000);
		if (marker && marker !== undefined && marker !== null) {
			scrollToMarker(marker);
			return true;
		} else {
			goHome();
			return false;
		}
	} catch (error) {
		goHome();
		return false;
	}
}

function zoom() {
	const zoomButton = document.querySelector(".fas.fa-plus");
	if (zoomButton) {
		for (let i = 0; i < 7; i++) {
			zoomButton.click();
		}
	}
}

async function getUserWaitTime(battleType) {
	try {
		if (battleType == "Clash" || battleType == "Duel") battleType = "PVP";
		let userWaitTime = await retrieveNumberFromStorage("userWaitTimeInput" + battleType);
		let secondsToMin = userWaitTime / 60;
		let min = "0" + (60 - ((secondsToMin - parseInt(secondsToMin)) * 60));
		if (min == "060") min = "00";
		min = min.substr(min.length - 2);

		if (battleType == "Campaign") {
			if (userWaitTime == -100 || userWaitTime >= (30 * 60)) {
				return 2830;
			} else {
				if (userWaitTime == 0) return 30;
				return parseInt("".concat(parseInt((30 - secondsToMin)), min));
			}
		} else if (battleType == "Dungeons") {
			if (userWaitTime == -100 || userWaitTime >= (5 * 60)) {
				return 500;
			} else {
				if (userWaitTime == 0) return 500;
				return parseInt("".concat(parseInt((5 - secondsToMin)), min));
			}
		} else if (battleType == "PVP") {
			if (userWaitTime == -100 || userWaitTime >= (6 * 60)) {
				return 600;
			} else {
				if (userWaitTime == 0) return 600;
				return parseInt("".concat(parseInt((6 - secondsToMin)), min));
			}
		}
	} catch (error) {
		return 2830;
	}
}

function isInView(element) {
	const rect = element.getBoundingClientRect();
	return (
		rect.top >= 0 &&
		rect.left >= 0 &&
		rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
		rect.right <= (window.innerWidth || document.documentElement.clientWidth)
	);
}

async function scrollToMarker(marker) {
	marker.scrollIntoView({ block: 'center', inline: 'center' });
	await delay(100);
	if (!isInView(marker)) {
		marker.scrollIntoView({ block: 'center', inline: 'center' });
		setTimeout(() => {
			scrollToMarker(marker);
		}, 100);
	}
}

async function updateChestContainer() {
	const chestContainer = document.querySelector(".chestContainer");

	if (chestContainer) {
		let chestString = "";
		for (let i = 0; i < activeRaidsArray.length; i++) {
			let activeRaid = activeRaidsArray[i];
			if (activeRaid.chestType) {
				if (activeRaid.chestType == "dungeonchest") {
					let dungeonInfo = await retrieveFromStorage("dungeonRaidInfo");
					try {
						let dungeonLevel = parseInt(dungeonInfo[8]) + 1;
						chestString += `| ${activeRaid.twitchDisplayName} - Lv${dungeonLevel} |`
					} catch (error) { }
				} else if (activeRaid.chestType == "bonechest") {
					chestString += `| ${activeRaid.twitchDisplayName} - VS ${activeRaid.opponentTwitchDisplayName} |`
				} else {
					let chestType = activeRaid.chestType.replace(/chest|_maps\d+to\d+/g, "").replace("boosted", "L ").replace("bosssuper", "Super Boss");
					let words = chestType.split(" ");
					for (let j = 0; j < words.length; j++) {
						words[j] = words[j][0].toUpperCase() + words[j].substr(1);
						chestType = words.join(" ");
					}
					chestString += `| ${activeRaid.twitchDisplayName} - ${chestType} |`
				}
			}
		}
		chestContainer.innerHTML = `${chestString.replaceAll("||", "|")}`;
		chestContainer.style.backgroundColor = gameBlue;
	}
}