/* This file is the heart of the extension, it performs the auto playing, invokes functions to set and get values as well as
functions to perform tasks such as replacing idle captains or buying scrolls
*/

//Triggers the start function every 20 seconds
setInterval(start, 10000);
setInterval(performCollectionInterval, 60000);

//Declares/initializes variables
let currentMarkerKey = "";
let currentMarker;
let arrayOfMarkers;
let sortedArrMrks;
let computedStyle;
let backgroundImageValue;
let mode;
let diamondLoyalty;
let firstReload;
//let captainNameFromDOM;
let reload = 0;
let isContentRunning;
let isContentRunning2;
let unfinishedQuests = null;
const blue = 'rgb(185, 242, 255)';
const red = 'rgb(255, 204, 203)';
const purple = 'rgb(203, 195, 227)';
const gameBlue = 'rgb(42, 96, 132)';
const cancelButtonSelector = ".actionButton.actionButtonNegative.placerButton";
const delay = ms => new Promise(res => setTimeout(res, ms));
let isDungeon = false;
let dungeonPlaceAnywaySwitch;
let battleResult;
let captainName;
let chestStringAlt;
let unitDrawer;
let hasPlacedSkin;

//Battlefield markers.
const arrayOfBattleFieldMarkers = [
  { key: "NO", icon: "VYAAAAASUVORK5CYII=" },
  { key: "VIBE", icon: "1EPFWIYQTQRB9OWOGAAAABJRU5ERKJGGG" },
  { key: "ARMORED", icon: "XLAAAAAELFTKSUQMCC" },
  { key: "ASSASSIN", icon: "EGAAAABJRU5ERKJGGG==" },
  { key: "MELEE", icon: "TAAAAAASUVORK5CYII=" },
  { key: "RANGED", icon: "+IAAAAAELFTKSUQMCC" },
  { key: "SUPPORT", icon: "YFQAAAABJRU5ERKJGGG" },
  { key: "AMAZON", type: "MELEE", icon: "CRKB" },
  { key: "ARCHER", type: "RANGED", icon: "6QAAAABJRU5ERKJGGG==" },
  { key: "ARTILLERY", type: "RANGED", icon: "+YAAAAASUVORK5CYII=" },
  { key: "BALLOON", type: "ASSASSIN", icon: "BAAAAAASUVORK5CYII=" },
  { key: "BARBARIAN", type: "MELEE", icon: "GIAAAAAASUVORK5CYII=" },
  { key: "BERSERKER", type: "MELEE", icon: "JAAAAAAELFTKSUQMCC" },
  { key: "BLOB", type: "ARMORED", icon: "KAAAAAELFTKSUQMCC" },
  { key: "BOMBER", type: "RANGED", icon: "TWAAAAASUVORK5CYII=" },
  { key: "BUSTER", type: "ASSASSIN", icon: "OWAAAABJRU5ERKJGGG==" },
  { key: "CENTURION", type: "ARMORED", icon: "0WAAAABJRU5ERKJGGG==" },
  { key: "FAIRY", type: "SUPPORT", icon: "AUWAAAABJRU5ERKJGGG==" },
  { key: "FLAG", type: "SUPPORT", icon: "HAAAAABJRU5ERKJGGG==" },
  { key: "FLYING", type: "ASSASSIN", icon: "0AAAAASUVORK5CYII=" },
  { key: "GLADIATOR", type: "MELEE", icon: "NWAAAAASUVORK5CYII=" },
  { key: "HEALER", type: "SUPPORT", icon: "IGAAAAASUVORK5CYII=" },
  { key: "LANCER", type: "MELEE", icon: "XQAAAABJRU5ERKJGGG==" },
  { key: "MAGE", type: "RANGED", icon: "3QAAAABJRU5ERKJGGG==" },
  { key: "MONK", type: "SUPPORT", icon: "RAAAAAELFTKSUQMCC" },
  { key: "MUSKETEER", type: "RANGED", icon: "MAAAAASUVORK5CYII=" },
  { key: "NECROMANCER", type: "SUPPORT", icon: "QMAAAAAELFTKSUQMCC" },
  { key: "ORC", type: "ARMORED", icon: "OQAAAABJRU5ERKJGGG==" },
  { key: "PALADIN", type: "ARMORED", icon: "EAAAAAELFTKSUQMCC" },
  { key: "PHANTOM", type: "ASSASSIN", icon: "MLAAAAAELFTKSUQMCC" },
  { key: "ROGUE", type: "ASSASSIN", icon: "VIAAAAAELFTKSUQMCC" },
  { key: "SAINT", type: "SUPPORT", icon: "SAAAAAASUVORK5CYII=" },
  { key: "SHINOBI", type: "ASSASSIN", icon: "WAAAAABJRU5ERKJGGG==" },
  { key: "SPY", type: "ASSASSIN", icon: "N6GAAAAASUVORK5CYII=" },
  { key: "TANK", type: "ARMORED", icon: "FAAAAAELFTKSUQMCC" },
  { key: "TEMPLAR", type: "SUPPORT", icon: "VGAAAABJRU5ERKJGGG==" },
  { key: "VAMPIRE", type: "ARMORED", icon: "BAAAAAELFTKSUQMCC" },
  { key: "WARBEAST", type: "MELEE", icon: "4WAAAABJRU5ERKJGGG==" },
  { key: "WARRIOR", type: "MELEE", icon: "YIAAAAASUVORK5CYII=" },
];

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
  { key: "TEMPLAR", type: "SUPPORT", icon: "CYNUL", name: "tamplar" },
  { key: "VAMPIRE", type: "ARMORED", icon: "BL5378", name: "vampire" },
  { key: "WARBEAST", type: "MELEE", icon: "SRJSYO", name: "warbeast" },
  { key: "WARRIOR", type: "MELEE", icon: "YTUUAHQ", name: "warrior" },
];
const loyaltyArray = [{ key: 1, value: "Wood" },
{ key: 2, value: "Blue" },
{ key: 3, value: "Gold" },
{ key: 4, value: "Diamond" }]

// This is the start, it selects a captain placement as well as collect any rewards to proceed
async function start() {

  if(await retrieveFromStorage("paused_checkbox")) {
    return
  }

  //Reload tracker
  if (firstReload === undefined) {
    firstReload = new Date();
  }
  //Keep track of time and reload after 1hr15min to avoid the browser crashing due to low memory.
  const elapsedMinutes = Math.floor((new Date() - firstReload.getTime()) / (1000 * 60));
  const timeContainer = document.querySelector(".elapsedTimeContainer");
  let battleMessages = ""

  if (timeContainer && (elapsedMinutes !== null || elapsedMinutes !== undefined)) {
    battleMessages = await displayMessage();
    timeContainer.innerHTML = `Refresh: ${elapsedMinutes} mins ago. <span style="color: white; font-weight: bold">${battleMessages}</span>`;
  }

  if (reload == 0) {
    chrome.storage.local.get(['reloaderInput'], function (result) {
      const reloaderInputValue = result.reloaderInput;

      if (reloaderInputValue !== undefined) {
        reload = reloaderInputValue;
      }
    })
  }
  if (chestsRunning == false && ((reload != undefined && elapsedMinutes >= reload && reload >= 5) || ((reload != undefined || reload != 0) && elapsedMinutes >= 60))) {
    locationReload();
    return;
  }

  //Initialized nav items, if they don't exist it means the extension is already executing.
  if (isContentRunning) {
    return
  }
  isContentRunning = true;
  const navItems = document.querySelectorAll('.mainNavItemText');
  let storeButton;
  let battleButton;
  if (navItems.length === 0 || navItems === undefined) {
    isContentRunning = false;
    return;
  } else {
    //If navItem exists, open main menu
    for (let i = navItems.length - 1; i >= 0; i--) {
      let navItem = navItems[i];
      if (navItem.innerText === "Store") {
        storeButton = navItem;
      }
      if (navItem.innerText === "Battle") {
        battleButton = navItem;
        navItem.click();
        await delay(2000);
      }
    }
  }

  unfinishedQuests = null
  if (await retrieveFromStorage("completeQuests")) {
    try {
      isContentRunning = true
      unfinishedQuests = await getUnfinishedQuests()
    } catch (error) {
      unfinishedQuests = undefined
    }
  }

  //await manageDungeonSlot()

  const capSlots = document.querySelectorAll(".capSlot")
  for (i in capSlots) {
    try {
      const st = capSlots[i]
      //Check if captain has a code
      if (st.innerHTML.includes("ENTER_CODE")) {
        const cpId = parseInt(i, 10) + 1;
        const cpNmSt = st.querySelector(".capSlotName").innerText
        const cB = st.querySelector(".fal.fa-times-square")
        if (cB) {
          cB.click();
        }
        //Flag captain into memory
        await flagCaptainRed(cpId, cpNmSt)
        continue;
      }
    } catch (error) {
      continue
    }
  }
  isContentRunning = false;

  //Checks masterlist to switch
  const forceMaster = await getSwitchState("liveMasterSwitch");
  const replaceMaster = await getSwitchState("priorityMasterSwitch");
  if (forceMaster || replaceMaster) {
    await switchToMasterList(forceMaster, replaceMaster);
    await delay(10000);
    storeButton.click();
    battleButton.click();
    await delay(5000);
  }

  //Checks if the user wants to replace idle captains and invoke the function to check and replace them.
  const offline = await retrieveFromStorage("offlineSwitch")
  if (offline) {
    await checkIdleCaptains()
  }

  // Collects rewards if there are any
  // const rewardButton = document.querySelector(".actionButton.actionButtonPrimary.rewardsButton");

  // if (rewardButton) {
  // rewardButton.click();
  // }

  let captainNameFromDOM = "";

  //Initialized a node list with placeable buttons
  const placeUnitButtons = document.querySelectorAll(".actionButton.actionButtonPrimary.capSlotButton.capSlotButtonAction");
  let placeUnit = null;
  //If there are no place unit buttons, invoke the collection function then return.
  if (placeUnitButtons.length == 0 || (placeUnitButtons.length == 1 && placeUnitButtons[0].innerText === "SUBMIT")) {
    await performCollection();
    return;
  }
  //If placement buttons exist, validate them
  else if (placeUnitButtons.length != 0) {
    //Iterate through every button
    for (var button of placeUnitButtons) {
      //If the button has the inner text PLACE UNIT it's a valid button
      if (button.innerText.includes("PLACE UNIT")) {
        //Get captain name from the slot

        var captainSlot = button.closest('.capSlot');
        captainNameFromDOM = captainSlot.querySelector('.capSlotName').innerText;
        //Retrieve the slot pause state
        const btn = captainSlot.querySelector(".capSlotStatus .offlineButton");
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

        //If slot state is disabled, move to the next slot
        if (slotState == 0) {
          continue
        }
        try {
          const batClock = captainSlot.querySelector(".capSlotTimer").lastChild.innerText.replace(':', '')
          const batTime = parseInt(batClock, 10);
          if (batTime > await getUserWaitTime(battleType)) {
            continue
          }
        } catch (error) {
          console.log("")
        }

        // Calculate placements odds
        const bSlot = button.closest('.capSlot')
        const closeBtn = bSlot.querySelector(".capSlotClose")
        const oddKey = "oddId" + bSlot.querySelector(".offlineButton").id
        let canPlace = false
        const currentTime = new Date();
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
        if (!canPlace) {
          continue
        }
        let placementOdds = await retrieveNumberFromStorage("placementOddsInput")
        if (placementOdds == -100 || placementOdds == undefined || placementOdds > 100) {
          placementOdds = 100
        }
        else if (placementOdds <= 0) {
          continue
        }

        if (placementOdds != 100 && button.innerText.includes("PLACE UNIT") && !closeBtn) {
          if (!((Math.floor(Math.random() * 100) + 1) <= placementOdds)) {
            const minutes = Math.floor(Math.random() * 5) + 7;
            const eT = new Date(currentTime.getTime() + minutes * 60000);
            const eTString = eT.toISOString();
            await chrome.storage.local.set({ [oddKey]: eTString });
            continue
          }
        }

        //Check if the captain is the one running a game mode
        const dungeonCaptainNameFromStorage = await retrieveFromStorage('dungeonCaptain');
        const clashCaptainNameFromStorage = await retrieveFromStorage('clashCaptain');
        const duelsCaptainNameFromStorage = await retrieveFromStorage('duelCaptain');
        //Check if the user wants multiple units to be placed on special modes
        const clashSwitch = await retrieveFromStorage('clashSwitch');
        const dungeonSwitch = await retrieveFromStorage('dungeonSwitch');
        const duelSwitch = await retrieveFromStorage('duelSwitch');
        const campaignSwitch = await retrieveFromStorage('campaignSwitch');
        diamondLoyalty = null;
        let captainFlag
        let captainLoyalty

        //Pass captain name and check if the captain is flagged
        try {
          if (!captainNameFromDOM) {
            captainNameFromDOM = ""
          }
          captainFlag = await getCaptainFlag(captainNameFromDOM, 'flaggedCaptains');
          //Make a second attempt to set loyalty flag
        } catch (error) {
          captainFlag = false
        }
        //Pass captain name and check if the captain has a loyalty flag.
        const loyaltyRadio = await getRadioButton("loyalty");
        let loyaltyRadioInt = 0
        try {
          loyaltyRadioInt = parseInt(loyaltyRadio)
        } catch (error) {
          loyaltyRadioInt = 0
        }
        if (loyaltyRadioInt != 0 && loyaltyRadio != undefined) {
          try {
            captainLoyalty = await getCaptainFlag(captainNameFromDOM, 'captainLoyalty');
            if (!captainLoyalty || captainLoyalty == undefined) {

              const lgold = await retrieveFromStorage("lgoldSwitch")
              const lskin = await retrieveFromStorage("lskinSwitch")
              const lscroll = await retrieveFromStorage("lscrollSwitch")
              const ltoken = await retrieveFromStorage("ltokenSwitch")
              const lboss = await retrieveFromStorage("lbossSwitch")
              const lsuperboss = await retrieveFromStorage("lsuperbossSwitch")

              let lResults = await getCaptainLoyalty(captainNameFromDOM);
              let chestType = lResults[1]
              if ((!lgold && chestType.includes("chestboostedgold")) || (!lskin && chestType.includes("chestboostedskin")) || (!lscroll && chestType.includes("chestboostedscroll")) || (!ltoken && chestType.includes("chestboostedtoken")) || (!lboss && chestType.includes("chestboss") && !chestType.includes("chestbosssuper")) || (!lsuperboss && chestType.includes("chestbosssuper"))) {
                captainLoyalty = true;
              } else if (chestType.includes("bonechest") || chestType.includes("dungeonchest") || chestType.includes("chestbronze") || chestType.includes("chestsilver") || chestType.includes("chestgold")) {
                captainLoyalty = false;
              } else {
                captainLoyalty = false;
              }

              if (captainLoyalty) {
                let lBadgeElement = null
                let lBadge = ""
                try {
                  lBadgeElement = captainSlot.querySelector('.capSlotLoyalty img');
                  if (lBadgeElement != null) {
                    lBadge = lBadgeElement.getAttribute('src')
                  }
                  if ((lBadge == null || lBadge == undefined) && loyaltyRadioInt == 0) {
                    captainLoyalty = false;
                    captainFlag = false;
                    lBadge = ""
                  }
                  if (lBadge == null || lBadge == undefined) {
                    lBadge = ""
                  }
                  else if (lBadge.includes("Wood") && loyaltyRadioInt == 1) {
                    // Bronze check
                    captainLoyalty = false;
                    captainFlag = false;
                  }
                  else if (lBadge.includes("Blue") && loyaltyRadioInt <= 2) {
                    // Silver Check
                    captainLoyalty = false;
                    captainFlag = false;
                  }
                  else if (lBadge.includes("Gold") && loyaltyRadioInt <= 3) {
                    // Gold check
                    captainLoyalty = false;
                    captainFlag = false;
                  }
                  else if (lBadge.includes("Diamond") && loyaltyRadioInt <= 4) {
                    // Diamond check
                    captainLoyalty = false;
                    captainFlag = false;
                  }
                  else {
                    captainLoyalty = true;
                    captainFlag = true;
                  }
                } catch (error) {
                  console.log(error)
                  captainLoyalty = true;
                  captainFlag = true;
                }
              }
            }
          } catch (error) {
            console.log(error)
            captainLoyalty = true;
            captainFlag = true;

          }
        } else {
          captainLoyalty = false;
          captainFlag = false;
        }
        //If captain has any flags, change color and move to the next slot

        if (await retrieveMaxUnit(captainNameFromDOM)) {
          continue
        }
        if (captainLoyalty || captainFlag) {
          if (captainLoyalty) {
            captainSlot.style.backgroundColor = blue;
          }
          continue;
        } else {
          captainSlot.style.backgroundColor = gameBlue;
        }

        /* Check if the captain is running a special game mode and if the same captain is the one in storage.
        So if the dungeon captain on storage is Mike and there is another captain name John also running a dungeon
        the captain John will be skipped, this is done so only one captain runs a special mode at any given time and keys don't get reset.  */
        let multiClashSwitch;
        if (battleType == "Clash") {
          multiClashSwitch = await getSwitchState("multiClashSwitch");
        }
        if (((dungeonCaptainNameFromStorage != captainNameFromDOM) && battleType == "Dungeons") ||
          (!multiClashSwitch && (clashCaptainNameFromStorage != captainNameFromDOM) && battleType == "Clash") ||
          ((duelsCaptainNameFromStorage != captainNameFromDOM) && battleType == "Duel")) {
          continue
        }
        /* Checks if the captain saved on storage running a special mode is still running the same mode, if they change they might lock
        the slot for 30 minutes so if a captain switches to campaign they are skipped and colored red */
        else if ((dungeonCaptainNameFromStorage == captainNameFromDOM && battleType != "Dungeons") ||
          (!multiClashSwitch && clashCaptainNameFromStorage == captainNameFromDOM && battleType != "Clash") ||
          (duelsCaptainNameFromStorage == captainNameFromDOM && battleType != "Duel")) {
          captainSlot.style.backgroundColor = red;
          continue
        }
        /* Checks if the slot is a special game mode and if a unit has already been placed it check if the user wants to place
        multiple units on special modes */
        else if (((battleType == "Dungeons" && !dungeonSwitch) || (battleType == "Clash" && !clashSwitch) ||
          ((battleType == "Duel" && !duelSwitch)) || !campaignSwitch) &&
          captainSlot.querySelector('.capSlotClose') == null) {
          continue
        }
        //If all is clear, it checks if the captain is diamond loyalty for future comparison.
        //Assigns the placeUnit button and breaks.
        else {
          diamondLoyalty = null;
          diamondLoyalty = captainSlot.outerHTML;
          placeUnit = button
          //break;
        }

        //If place unit exists, click it and call the openBattlefield function
        if (placeUnit) {
          if (isContentRunning2) {
            return
          }
          isContentRunning2 = true;
          placeUnit.click();
          await delay(1000);
          await openBattlefield(captainNameFromDOM, slotOption, diamondLoyalty, battleType);
          isContentRunning2 = false;
        } else {
          await performCollection();
          return;
        }
      } else {
        continue;
      }
    }
  }

  // Change captains using a different device without the script freezing trying to select a captain.
  closeAll();
  isContentRunning2 = false;
}

async function performCollection() {
  await collectEventChests();
  await collectFreeDaily();
}

async function performCollectionInterval() {
  if(await retrieveFromStorage("paused_checkbox")) {
    return
  }
  await buyScrolls();
  await collectBattlePass();
}

// This function checks if the battlefield is present, the current chest type, then zooms into it.
async function openBattlefield(captainNameFromDOM, slotOption, diamondLoyalty, battleType) {
  arrayOfMarkers = null;
  unitDrawer = null;
  await delay(6000)

  // Attempts to check if battlefield is open
  let battleInfo
  try {
    battleInfo = document.querySelector(".battleInfo").innerText;
  } catch (error) {
    return;
  }
  mode = false;
  //Duels and clash strings here.
  if (battleInfo.includes("Level") || battleInfo.includes("Versus")) {
    mode = true;
  }
  //Check if user wants to preserve loyalty
  let radioLoyalty = await getRadioButton("loyalty");
  let radioLoyaltyInt = 0
  try {
    radioLoyaltyInt = parseInt(radioLoyalty)
  } catch (error) {
    radioLoyaltyInt = 0
  }

  let acceptableLoyalty = false;
  if (diamondLoyalty == null) {
    return;
  }
  const matchingEntry = loyaltyArray.find(item => diamondLoyalty.includes(item.value));
  const matchingKey = matchingEntry ? matchingEntry.key : null;

  if (radioLoyaltyInt === 0) {
    acceptableLoyalty = true;
  } else if (matchingKey >= radioLoyaltyInt) {
    acceptableLoyalty = true;
  }

  //User wants to preserve diamond loyalty and current captain is not diamond and current mode is campaign
  if (mode == false) { //!acceptableLoyalty && ) {
    //Opens battle info and checks chest type.
    battleInfo = document.querySelector(".battleInfoMapTitle")
    battleInfo.click();

    //Check how many units user wants
    const unitQtt = await getUnitAmountData()
    hasPlacedSkin = false
    let commaCount = 0;

    try {
      while (logRunning == true) {
        await delay(10);
      }
      logRunning = true;
      let battleLog = await retrieveFromStorage("logData");
      logRunning = false;
      battleLog = battleLog.slice(-4);
      for (let i = battleLog.length - 1; i >= 0; i--) {
        const battleOfInterest = battleLog[i];
        const capName = battleOfInterest["logCapName"].toLowerCase().trim();
        if (captainNameFromDOM.toLowerCase().trim() === capName) {
          const unitsPlaced = battleOfInterest["units2"].toLowerCase();
          commaCount = unitsPlaced.split(",").length - 1;
          if (unitsPlaced.includes(captainNameFromDOM.toLowerCase().trim())) {
            hasPlacedSkin = true
          }
          break
        }
      }
    } catch (error) { }

    if (commaCount >= unitQtt) {
      await setMaxUnit(captainNameFromDOM)
      closeAll();
      goHome();
      return;
    }

    await delay(2000);
    let chest;
    try {
      chest = document.querySelector(".mapInfoRewardsName").innerText;
      closeAll();
    } catch (error) {
      goHome();
      return;
    }
    const lgold = await retrieveFromStorage("lgoldSwitch")
    const lskin = await retrieveFromStorage("lskinSwitch")
    const lscroll = await retrieveFromStorage("lscrollSwitch")
    const ltoken = await retrieveFromStorage("ltokenSwitch")
    const lboss = await retrieveFromStorage("lbossSwitch")
    const lsuperboss = await retrieveFromStorage("lsuperbossSwitch")

    let requestLoyaltyResults = await getCaptainLoyalty(captainNameFromDOM);
    let raidId = requestLoyaltyResults[0];
    await setLogInitialChest2(captainNameFromDOM, raidId, chest);

    if (!acceptableLoyalty && ((!lgold && chest.includes("Loyalty Gold")) || (!lskin && chest.includes("Loyalty Skin")) || (!lscroll && chest.includes("Loyalty Scroll")) || (!ltoken && chest.includes("Loyalty Token")) || (!lboss && chest.includes("Loyalty Boss")) || (!lsuperboss && chest.includes("Loyalty Super")))) {
      //if (chest.includes("Loyalty")) {
      //Flag the captain loyalty since the current map is to be skipped
      await flagCaptain('captainLoyalty');
      //Close the chest info popup and return to main menu
      closeAll();
      goHome();
      return;
    } else {
      //Current chest is not special, close chest info and zoom
      closeAll();
      getValidUnits(captainNameFromDOM, slotOption, diamondLoyalty, battleType);
    }
    //diamondLoyalty = null;
  } else {
    //User doesn't want to preserve diamond loyalty
    closeAll();
    getValidUnits(captainNameFromDOM, slotOption, diamondLoyalty, battleType);
  }
}

async function getValidUnits(captainNameFromDOM, slotOption, diamondLoyalty, battleType) {
  currentMarker = null;
  unitDrawer = null;
  //Function to check for a frozen state
  reloadRoot();
  await delay(1000);

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

  zoom()

  // This sorts the markers and adds imaginary markers if there aren't any
  makeMarkers();
  let arrayOfMarkers = Array.of(document.querySelectorAll(".planIcon"))
  arrayOfMarkers = getMapMatrix(arrayOfMarkers)



  // Open unit drawer and set the filter to ALL units
  const placeUnitBtn = document.querySelector(".actionButton.actionButtonPrimary.placeUnitButton")
  if (placeUnitBtn) {
    placeUnitBtn.click()
    await delay(1000);
    document.querySelector('.unitFilterButton')?.click();
  } else {
    goHome();
    return;
  }


  //Check if user wants to auto equip skins and equip them
  const equipSwitch = await retrieveFromStorage("equipSwitch");
  //Get the unit switcher container
  const unitSwitcher = document.querySelector('.settingsSwitchCont');
  if (equipSwitch !== undefined && unitSwitcher) {
    //Get the unit switch check box, doing it inside the if garantees the the checkbox exists.
    const checkbox = unitSwitcher.querySelector('input[type="checkbox"]');
    if (checkbox) {
      //Assign true or false to the checkbox
      checkbox.checked = equipSwitch;
    }
  } else if (unitSwitcher) {
    //Value from storage couldn't be retrieved, assign false to the unit checkbox
    const checkbox = unitSwitcher.querySelector('input[type="checkbox"]');
    if (checkbox) {
      checkbox.checked = false;
    }
  }

  await delay(500)
  await doPotions()

  //Get all units from the drawer
  let canCompleteQuests = await retrieveFromStorage("completeQuests")
  unitDrawer = [...document.querySelectorAll(".unitSelectionCont")];
  let unitsToRemove = []

  // Check dungeon
  const dungeonLevelSwitch = await retrieveFromStorage("dungeonLevelSwitch");
  //const dungeonPlaceAnywaySwitch = await retrieveFromStorage("dungeonPlaceAnywaySwitch");
  isDungeon = false;
  let dungeonLevel;
  let userDunLevel;
  let battleInfo = "";
  try {
    userDunLevel = await retrieveNumberFromStorage("maxDungeonLvlInput")
  } catch (error) { }
  let userUnitLevel = 0;
  try {
    userUnitLevel = await retrieveNumberFromStorage("maxUnitLvlDungInput")
  } catch (error) { }

  if (dungeonLevelSwitch) {
    try {
      battleInfo = document.querySelector(".battleInfo").innerText;
      if (battleInfo.includes("Level")) {
        dungeonLevel = parseInt(battleInfo.substr(battleInfo.length - 2));
        isDungeon = true;
      }
    } catch (error) { }
  }

  // Remove cooldown units, dead units, exhausted units, unavailable units and rarity check units
  if (unitDrawer[0].children == null) {
    return;
  }
  let knockedUnitInfo;
  let deadUnitInfo;
  let exhaustedUnitInfo;
  if (isDungeon) {
    let dungeonInfo = await getUserDungeonInfoForRaid(captainNameFromDOM);
    if (dungeonInfo[1] != null) {
      knockedUnitInfo = await getUnitInfo(dungeonInfo[1]);
    }
    if (dungeonInfo[3] != null) {
      deadUnitInfo = await getUnitInfo(dungeonInfo[3]);
    }
    if (dungeonInfo[4] != null) {
      exhaustedUnitInfo = await getUnitInfo(dungeonInfo[4]);
    }
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

    //Get unit status: cooldown, defeated and exhausted
    let coolDownCheck = unit.querySelector('.unitItemCooldown');
    let defeatedCheck = unit.querySelector('.defeatedVeil');
    //If unit has this class it's enabled, if it doesn't have it's not enabled.
    let unitDisabled = unit.querySelector('.unitItemDisabledOff');
    let unitName;
    let unitLevel;
    let unitDead;
    let unitExhausted;
    let unitKnocked;
    try {
      unitName = unit.querySelector('.unitClass img').getAttribute('src').slice(-50).toUpperCase();
      unitLevel = parseInt(unit.querySelector('.unitLevel').innerText);
    } catch (error) {
      continue;
    }
    const unit0 = arrayOfUnits.find(unit0 => unitName.includes(unit0.icon.toUpperCase()));
    if (isDungeon && unitLevel <= 5) {
      if (knockedUnitInfo != null) {
        if (unit0.name == knockedUnitInfo[0] && unitLevel == knockedUnitInfo[1]) {
          unitKnocked = true;
        } else {
          unitKnocked = false;
        }
      } else {
        unitKnocked = false;
      }
      if (deadUnitInfo != null) {
        if (unit0.name == deadUnitInfo[0] && unitLevel == deadUnitInfo[1]) {
          unitDead = true;
        } else {
          unitDead = false;
        }
      } else {
        unitDead = false;
      }
      if (exhaustedUnitInfo != null) {
        if (unit0.name == exhaustedUnitInfo[0] && unitLevel == exhaustedUnitInfo[1]) {
          unitExhausted = true;
        } else {
          unitExhausted = false;
        }
      } else {
        unitExhausted = false;
      }
      if (unitKnocked && getSwitchState("dungeonLowFlagMeatSwitch") && unitLevel <= 5 && unit0.key == "FLAG") {
        let useMeat = await reviveUnit("flagbearer", unitLevel, captainNameFromDOM);
        console.log("meat used");
        unitKnocked = false;
      }
    }
    if (coolDownCheck || defeatedCheck || !unitDisabled) {
      unitsToRemove.push(unit)
      continue
    }
    if (legendaryCheck && !await getSwitchState("legendarySwitch") && !canCompleteQuests) {
      unitsToRemove.push(unit)
      continue
    } else if (rareCheck && !await getSwitchState("rareSwitch") && !canCompleteQuests) {
      unitsToRemove.push(unit)
      continue
    } else if (uncommonCheck && !await getSwitchState("uncommonSwitch") && !canCompleteQuests) {
      unitsToRemove.push(unit)
      continue
    } else if (commonCheck && !await getSwitchState("commonSwitch") && !canCompleteQuests) {
      unitsToRemove.push(unit)
      continue
    } else if ((unitDead || unitExhausted || unitKnocked) && isDungeon && !canCompleteQuests) {
      unitsToRemove.push(unit)
      continue
    } else if ((battleType == "Clash" || battleType == "Duel") && specCheck == null && await getSwitchState("pvpSpecSwitch")) {
      unitsToRemove.push(unit)
      continue
    }

    // Remove units based on unit level
    if (isDungeon) {
      if (userDunLevel == null || userDunLevel == undefined || userUnitLevel == null || userUnitLevel == undefined) {
        continue;
      } else if (dungeonLevel <= userDunLevel && unitLevel > userUnitLevel || unitName == "AMAZON") {// && unitName != "FLAG") {
        unitsToRemove.push(unit)
        continue
      }
    }
  }

  unitsToRemove.forEach(unit => unit.remove());
  unitsToRemove = undefined
  unitDrawer = [...document.querySelectorAll(".unitSelectionCont")];
  
  let priorityListSwitchSlot = await retrieveFromStorage("priorityListSwitch" + slotOption);
  let priorityListSwitchAll = await retrieveFromStorage("priorityListSwitch0");
  let shuffleSwitchSlot = await retrieveFromStorage("shuffleSwitch" + slotOption);
  let shuffleSwitchSlotAll = await retrieveFromStorage("shuffleSwitch0");
  let shuffleSwitch = false;
  if (shuffleSwitchSlot || shuffleSwitchSlotAll) {
    shuffleSwitch = true;
  }
  if (!canCompleteQuests) {
    //If unit priority list for the slot is selected, use the list for the slot
    if (priorityListSwitchSlot) {
      unitDrawer = await sortPriorityUnits(unitDrawer, slotOption, shuffleSwitch);
    //If unit priority list for the slot is not selected and unit priority list for all slots is selected, use the list for all slots
    } else if (!priorityListSwitchSlot && priorityListSwitchAll) {
      unitDrawer = await sortPriorityUnits(unitDrawer, "0", shuffleSwitch);
    } else if (shuffleSwitch) {
      const children = [...document.querySelectorAll(".unitSelectionCont")[0].children];
      children.sort(() => Math.random() - 0.5);
      children.forEach(child => document.querySelector(".unitSelectionCont").appendChild(child));
    }
  }

  //Initializes a node list with all units
  let unitsQuantity;
  //Attempts to get amount of units in the units drawers
  try {
    unitsQuantity = unitDrawer[0].children.length;
  } catch (error) {
    goHome();
    return;
  }

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

  //Put skinned units at the front if quest completer is not enabled.
  let moreSkinsSwitch = await retrieveFromStorage("moreSkinsSwitch");
  if (moreSkinsSwitch && hasPlacedSkin) {
    moreSkinsSwitch = false;
  } else {
    moreSkinsSwitch = true;
  }

  if (!isDungeon && moreSkinsSwitch && await retrieveFromStorage("equipSwitch") && !canCompleteQuests) {
    const equipNoDiamondSwitch = await retrieveFromStorage("equipNoDiamondSwitch");
    if (!equipNoDiamondSwitch || (equipNoDiamondSwitch && !diamondLoyalty.toString().includes("LoyaltyDiamond"))) {
      try {
        await shiftUnits(captainNameFromDOM);
      } catch (error) {
        unitDrawer = [...document.querySelectorAll(".unitSelectionCont")];
        console.log("log" + error);
      }
    }
  }

  if (canCompleteQuests) {
    try {
      unitDrawer = await completeQuests(unitDrawer, unfinishedQuests)
    } catch (error) {
      unitDrawer = [...document.querySelectorAll(".unitSelectionCont")];
    }
  } else if (await retrieveFromStorage("shuffleSwitch")) {
    const children = [...document.querySelectorAll(".unitSelectionCont")[0].children];
    children.sort(() => Math.random() - 0.5);
    children.forEach(child => document.querySelector(".unitSelectionCont").appendChild(child));
  }

  if (!arrayOfMarkers || arrayOfMarkers.length == 0) {
    // TODO Map full of block markers, flag the captain.
    goHome();
    return;
  }

  if (await retrieveFromStorage("setMarkerSwitch")) {
    const arrayOfVibeMarkers = arrayOfMarkers.filter(marker => marker.id === "VIBE");
    const notVibeMarkers = arrayOfMarkers.filter(marker => marker.id !== "VIBE");

    arrayOfMarkers = notVibeMarkers.concat(arrayOfVibeMarkers);
  }

  //Add unit name and type to unit itself
  for (const unit of unitDrawer[0].children) {
    const unitClassImg = unit.querySelector('.unitClass img');
    const unitType = unitClassImg.getAttribute('alt').toUpperCase();
    const unitName = unitClassImg.getAttribute('src').slice(-50).toUpperCase();
    const unit1 = arrayOfUnits.find(unit1 => unitName.includes(unit1.icon.toUpperCase()));
    if (unit1) {
      unit.id = unit1.key + "#" + unitType;
    }
  }

  let counter = 0
  outer_loop: for (const unit of unitDrawer[0].children) {
    const unitId = unit.id;
    for (const marker of arrayOfMarkers) {
      //if(counter > 40) {
      //break outer_loop
      //}
      const markerId = marker.id;
      let hasPlaced;
      if (markerId === "VIBE" || markerId.includes(unitId)) {
        hasPlaced = await attemptPlacement(unit, marker);
        if (hasPlaced == undefined || hasPlaced) {
          goHome()
          closeAll()
          return
        } else {
          await cancelPlacement();
          continue;
        }
      }
      counter += 1
    }
  }
  goHome()
  closeAll
}

async function cancelPlacement() {
  const cancelBtn = document.querySelector(".actionButton.actionButtonNegative.placerButton");
  if (cancelBtn) {
    cancelBtn.click();
    await delay(1000);
  }

  const unitDrawer = document.querySelector(".actionButton.actionButtonPrimary.placeUnitButton");
  if (unitDrawer) {
    unitDrawer.click();
  }
}

async function attemptPlacement(unit, marker) {
  if (!await moveScreen(marker)) {
    closeAll();
    goHome();
    return true;
  }
  await delay(2000);
  unit.querySelector(".unitItem").click();
  await delay(1000);
  if (!tapUnit()) {
    return true
  }
  await delay(500);
  placeTheUnit();
  await delay(1000);
  reloadRoot();
  await delay(1000);
  return checkPlacement();
}

function checkPlacement() {
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
  try {
    const dungeonPlaceAnywaySwitch = await retrieveFromStorage("dungeonPlaceAnywaySwitch");
    const clockText = document.querySelector('.battlePhaseTextClock .clock').innerText;

    if (clockText === "00:00") {
      const placerButton = document.querySelector(cancelButtonSelector);
      const selectorBack = document.querySelector(".selectorBack");

      if (placerButton && selectorBack) {
        placerButton.click();
        selectorBack.click();
        return true;
      }
    }
  } catch (error) {
    goHome();
    return true;
  }

  //Attemps to place the selected unit and go back to menu, if the marker is valid, but in use, get a new marker.
  const placeModal = document.querySelector(".placerConfirmButtonsCont");
  let confirmPlacement = placeModal?.querySelector(".actionButton.actionButtonPrimary.placerButton");


  if (confirmPlacement) {
    //Placement is blocked by invalid unit location.
    const blockedMarker = document.querySelector(".placerRangeIsBlocked");
    if (blockedMarker) {
      const cancelButton = document.querySelector(cancelButtonSelector);
      if (cancelButton) {
        cancelButton.click();
        return false;
      }
      else {
        goHome();
        return true;
      }
    } else {
      if (confirmPlacement) {
        confirmPlacement.click();
        await delay(2000);
        if (isDungeon == true && currentMarkerKey == "FLAG") {
          let allPlaceAnywayButtons = document.querySelectorAll('.actionButton.actionButtonSecondary')
          let placeAnywayButton;
          allPlaceAnywayButtons.forEach(button => {
            if (button.innerText === "PLACE ANYWAY") {
              placeAnywayButton = button;
              return true;
            }
          });
          let allPlaceAnywayBackButtons = document.querySelectorAll('.actionButton.actionButtonPrimary')
          let placeAnywayBackButton;
          allPlaceAnywayBackButtons.forEach(button => {
            if (button.innerText === "BACK") {
              placeAnywayBackButton = button;
            }
          });
          if (placeAnywayButton) {
            if (dungeonPlaceAnywaySwitch) {
              placeAnywayButton.click();
              await delay(1000);
              goHome();
              return true;
            } else {
              placeAnywayBackButton.click();
              return true;
            }
          }
        }
      }
    }
  } else {
    goHome();
    return true;
  }

  await getLeaderboardUnitsData()
  //Unit was placed successfully, returns to main menu and the process restarts.
  setTimeout(() => {
    const placementSuccessful = document.querySelector(".actionButton.actionButtonDisabled.placeUnitButton");
    if (placementSuccessful) {
      goHome();
      return true;
    }
  }, 3000);

  setTimeout(() => {
    const disabledButton = document.querySelector(".actionButton.actionButtonDisabled.placerButton");
    const negativeButton = document.querySelector(cancelButtonSelector);
    if (disabledButton || negativeButton) {
      disabledButton?.click();
      negativeButton?.click();
      return false;
    }
  }, 5000);
}

const obsv = new MutationObserver(async function (mutations) {

  if(await retrieveFromStorage("paused_checkbox")) {
    return
  }
  
  mutations.forEach(async function (mutation) {
    if (mutation.type === 'childList') {
      // Check if the added nodes contain an element with the desired class
      const addedNodes = mutation.addedNodes;
      for (const node of addedNodes) {
        if (node.classList && node.classList.contains('mainNavItemText')) {
          start();
        }
      }
    }

    //Get captain slots or returns if they don't exist
    const captainSlots = document.querySelectorAll(".capSlots");
    if (captainSlots.length == 0) {
      return;
    }
    //Using the game mode key retrieves captainName from storage
    const firstCapSlot = captainSlots[0];
    const capSlotChildren = firstCapSlot.querySelectorAll('.capSlot');
    const dungeonCaptainNameFromStorage = await retrieveFromStorage('dungeonCaptain');
    const clashCaptainNameFromStorage = await retrieveFromStorage('clashCaptain');
    const duelsCaptainNameFromStorage = await retrieveFromStorage('duelCaptain');
    let capNameDOM;
    let multiClashSwitch;

    //Gets captain name from the dom
    for (const capSlot of capSlotChildren) {
      //Attemps to get the captain name from the current slot
      try {
        capNameDOM = capSlot.querySelector('.capSlotName').innerText;
        if (capSlot.innerText.includes("Clash")) {
          multiClashSwitch = await getSwitchState("multiClashSwitch");
        }
      } catch (error) {
        continue;
      }

      //Get flag states
      let purpleFlag = await getCaptainFlag(capNameDOM, 'flaggedCaptains');
      if (!purpleFlag) {
        purpleFlag = await retrieveMaxUnit(capNameDOM);
      }

      const blueFlag = await getCaptainFlag(capNameDOM, 'captainLoyalty');

      /*If the current captain is running a special mode and is not the one with the current flag OR
      if the currently flagged captain is not running their assigned special mode they get colored red
      for visual identification */
      if (blueFlag) {
        capSlot.style.backgroundColor = blue;
      }
      else if (purpleFlag) {
        capSlot.style.backgroundColor = purple
      }
      else if (((dungeonCaptainNameFromStorage != capNameDOM) && capSlot.innerText.includes("Dungeons")) ||
        (!multiClashSwitch && (clashCaptainNameFromStorage != capNameDOM) && capSlot.innerText.includes("Clash")) ||
        ((duelsCaptainNameFromStorage != capNameDOM) && capSlot.innerText.includes("Duel")) ||
        ((dungeonCaptainNameFromStorage == capNameDOM) && !capSlot.innerText.includes("Dungeons")) ||
        ((clashCaptainNameFromStorage == capNameDOM) && !capSlot.innerText.includes("Clash")) ||
        ((duelsCaptainNameFromStorage == capNameDOM) && !capSlot.innerText.includes("Duel"))) {
        capSlot.style.backgroundColor = red;
      }
      else {
        capSlot.style.backgroundColor = gameBlue;
      }
    }

    //Set offline button states after load.
    const allCapSlots = document.querySelectorAll(".capSlot");
    for (const slot of allCapSlots) {
      //Iterate through every button
      try {
        const btnOff = slot.querySelector(".capSlotStatus .offlineButton");
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
  });
});

const tgtNode = document.body;
const conf = { childList: true, subtree: true };
obsv.observe(tgtNode, conf);

//This function resets the running state and closes the battlefield back to home.
function goHome() {
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


async function doPotions() {
  const potionState = await getRadioButton("selectedOption");
  const favoriteSwitch = await getSwitchState("favoriteSwitch");

  let favoritePotion = !favoriteSwitch;

  if (potionState != 0 && !mode && favoriteSwitch) {
    try {
      const potionCaptainsList = await new Promise((resolve) => {
        chrome.storage.local.get({ 'potionlist': [] }, function (result) {
          resolve(result["potionlist"]);
        });
      });

      if (Array.isArray(potionCaptainsList) && potionCaptainsList.length > 0) {
        favoritePotion = potionCaptainsList.some(item => item.toUpperCase() === captainNameFromDOM.toUpperCase());
      }
    } catch (error) { }
  }

  if (potionState != 0 && !mode && favoritePotion) {
    try {
      const potions = document.querySelector("img[alt='Potion']").closest(".quantityItem");
      const potionQuantity = parseInt(potions.querySelector(".quantityText").textContent.substring(0, 3));

      if (potionQuantity >= 45 || potionQuantity === 100) {
        const epicButton = document.querySelector(".actionButton.actionButtonPrimary.epicButton");
        if (epicButton) {
          epicButton.click();
        }
      }
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
      marker.scrollIntoView({ block: 'center', inline: "center" });
      return true
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
    };
  }
}

async function getUserWaitTime(battleType) {
  try {
    if (battleType == "Clash" || battleType == "Duel") {
      battleType = "PVP"
    }
    let userWaitTime = await retrieveNumberFromStorage("userWaitTimeInput" + battleType);
    let secondsToMin = userWaitTime / 60;
    let min = "0" + (60 - ((secondsToMin - parseInt(secondsToMin)) * 60));
    min = min.substr(min.length - 2);

    if (battleType == "Campaign") {
      if (userWaitTime == -100 || userWaitTime >= (30 * 60)) {
        return 2830
      } else {
        if (userWaitTime == 0) {
          return 30;
        }
        return parseInt("".concat(parseInt((30 - secondsToMin)), min))
      }
    } else if (battleType == "Dungeons") {
      if (userWaitTime == -100 || userWaitTime >= (5 * 60)) {
        return 500
      } else {
        if (userWaitTime == 0) {
          return 500;
        }
        return parseInt("".concat(parseInt((5 - secondsToMin)), min))
      }
    } else if (battleType == "PVP") {
      if (userWaitTime == -100 || userWaitTime >= (6 * 60)) {
        return 600
      } else {
        if (userWaitTime == 0) {
          return 600;
        }
        return parseInt("".concat(parseInt((6 - secondsToMin)), min))
      }
    }
  } catch (error) {
    return 2830
  }
}