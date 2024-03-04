/* This file is the heart of the extension, it performs the auto playing, invokes functions to set and get values as well as
functions to perform tasks such as replacing idle captains or buying scrolls
*/

//Triggers the start function every 20 seconds
setInterval(start, 15000);

//Declares/initializes variables
let currentMarkerKey = "";
let currentMarker;
let arrayOfMarkers;
let sortedArrMrks;
let markerAttempt;
let computedStyle;
let backgroundImageValue;
let mode;
let diamondLoyalty;
let arrayOfAllyPlacement;
let firstReload;
let captainNameFromDOM;
let arrayOfSkinUnits;
let reload = 0;
let isContentRunning = false;
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
let captainName
let chestStringAlt;

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
  { key: "", type: "", icon: "" },
  { key: "VIBE", type: "VIBE", icon: "VIBE" },
  { key: "AMAZON", type: "MELEE", icon: "5GHK8AAAAASUVORK5CYII=" },
  { key: "ARCHER", type: "RANGED", icon: "FBPKAZY" },
  { key: "ARTILLERY", type: "RANGED", icon: "3GY1DLAQ" },
  { key: "BALLOON", type: "ASSASSIN", icon: "FOPPA6G" },
  { key: "BARBARIAN", type: "MELEE", icon: "Y2AZRA3G" },
  { key: "BERSERKER", type: "MELEE", icon: "BCIAAA" },
  { key: "BLOB", type: "ARMORED", icon: "LXTAAA" },
  { key: "BOMBER", type: "RANGED", icon: "QWP8WBK" },
  { key: "BUSTER", type: "ASSASSIN", icon: "PCCPYIHW" },
  { key: "CENTURION", type: "ARMORED", icon: "DUWAAA" },
  { key: "FAIRY", type: "SUPPORT", icon: "FNJQA" },
  { key: "FLAG", type: "SUPPORT", icon: "KF7A" },
  { key: "FLYING", type: "ASSASSIN", icon: "GSGE2MI" },
  { key: "GLADIATOR", type: "MELEE", icon: "EMWA84U" },
  { key: "HEALER", type: "SUPPORT", icon: "UY3N8" },
  { key: "LANCER", type: "MELEE", icon: "PU+OGW" },
  { key: "MAGE", type: "RANGED", icon: "4Q+BQML8" },
  { key: "MONK", type: "SUPPORT", icon: "D46EKXW" },
  { key: "MUSKETEER", type: "RANGED", icon: "DL9SBC7G" },
  { key: "NECROMANCER", type: "SUPPORT", icon: "85VI" },
  { key: "ORC", type: "ARMORED", icon: "VPAASGY8" },
  { key: "PALADIN", type: "ARMORED", icon: "IYUEO" },
  { key: "ROGUE", type: "ASSASSIN", icon: "GRJLD" },
  { key: "SAINT", type: "SUPPORT", icon: "PBUHPCG" },
  { key: "SHINOBI", type: "ASSASSIN", icon: "XSCZQ" },
  { key: "SPY", type: "ASSASSIN", icon: "FJBDFFQ" },
  { key: "TANK", type: "ARMORED", icon: "XEK7HQU" },
  { key: "TEMPLAR", type: "SUPPORT", icon: "CYNUL" },
  { key: "VAMPIRE", type: "ARMORED", icon: "BL5378" },
  { key: "WARBEAST", type: "MELEE", icon: "SRJSYO" },
  { key: "WARRIOR", type: "MELEE", icon: "YTUUAHQ" },
];
const loyaltyArray = [{ key: 1, value: "Wood" },
{ key: 2, value: "Blue" },
{ key: 3, value: "Gold" },
{ key: 4, value: "Diamond" }]

// This is the start, it selects a captain placement as well as collect any rewards to proceed
async function start() {

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
  if ((reload != undefined && elapsedMinutes >= reload && reload >= 5) || ((reload != undefined || reload != 0) && elapsedMinutes >= 60)) {
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

  //Leave before checks
  const capSlots = document.querySelectorAll(".capSlot")
  for (i in capSlots) {
    try {
      const st = capSlots[i]
      //Check if captain has a code
      if (st.innerHTML.includes("ENTER_CODE")) {
        const cpId = parseInt(i, 10) + 1;
        const cpNmSt = st.querySelector(".capSlotName").innerText
        const curTime = new Date().toISOString();
        const cB = st.querySelector(".fal.fa-times-square")
        if (cB) {
          cB.click();
        }
        //Flag captain into memory
        chrome.storage.local.get("flaggedCaptains", function (data) {
          let flaggedCpts = data.flaggedCaptains || [];

          flaggedCpts.push({
            captainId: cpId,
            captainName: cpNmSt,
            currentTime: curTime,
          });

          chrome.storage.local.set({ "flaggedCaptains": flaggedCpts }, function () {
          });
        });
        continue;
      }
      const btn = st.querySelector(".offlineButton").id
      const slotState = await getIdleState(btn);
      if (slotState == 3) {
        const close = st.querySelector(".capSlotClose");
        //Remove captains with LEAVE BEFORE
        if (close && (st.innerText.includes("Battle in progress") || st.innerText.includes("start battle"))) {
          close.click();
          await delay(2000);
          const confBtn = document.querySelector(".actionButton.actionButtonPrimary")
          if (confBtn.innerText.includes("CONFIRM")) {
            confBtn.click()
          }
          const beforeSwitch = await retrieveFromStorage('beforeSwitch');
          if (beforeSwitch) {
            setIdleState(btn, 1)
          } else {
            setIdleState(btn, 0)
          }
          continue
        }
      }
    } catch (error) {
      continue
    }
  }
  isContentRunning = false;

  //Checks masterlist to switch
  await switchToMasterList();
  await delay(10000);
  storeButton.click();
  battleButton.click();
  await delay(5000);

  //Checks if the user wants to replace idle captains and invoke the function to check and replace them.
  const offline = await retrieveFromStorage("offlineSwitch")
  if (offline) {
    await checkIdleCaptains()
  }

  // Collects chests and savages rewards
  await collectChests();

  // Collects rewards if there are any
  const rewardButton = document.querySelector(".actionButton.actionButtonPrimary.rewardsButton");

  if (rewardButton) {
    rewardButton.click();
  }

  captainNameFromDOM = "";

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
        let chestType;
        chestType = await requestLoyalty(captainNameFromDOM);
        let mapName;
        mapName = await requestMapName(captainNameFromDOM);
        await setLogInitialChest(captainNameFromDOM, chestType);
        await setLogMapName(captainNameFromDOM, mapName);
        //Retrieve the slot pause state
        const btn = captainSlot.querySelector(".capSlotStatus .offlineButton");
        const buttonId = btn.getAttribute('id');
        const slotState = await getIdleState(buttonId);

        //If slot state is disabled, move to the next slot
        if (slotState == 0) {
          continue
        }
        try {
          const batClock = captainSlot.querySelector(".capSlotTimer").lastChild.innerText.replace(':', '')
          const batTime = parseInt(batClock, 10);
          if (batTime > 2830) {
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
        if (placementOdds == undefined || placementOdds > 100) {
          placementOdds = 100
        }
        else if (placementOdds < 0) {
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
        if ((dungeonCaptainNameFromStorage != captainNameFromDOM) && captainSlot.innerText.includes("Dungeons") ||
          (clashCaptainNameFromStorage != captainNameFromDOM) && captainSlot.innerText.includes("Clash") ||
          (duelsCaptainNameFromStorage != captainNameFromDOM) && captainSlot.innerText.includes("Duel")) {
          continue
        }
        /* Checks if the captain saved on storage running a special mode is still running the same mode, if they change they might lock
        the slot for 30 minutes so if a captain switches to campaign they are skipped and colored red */
        else if ((dungeonCaptainNameFromStorage == captainNameFromDOM) && !captainSlot.innerText.includes("Dungeons") ||
          (clashCaptainNameFromStorage == captainNameFromDOM) && !captainSlot.innerText.includes("Clash") ||
          (duelsCaptainNameFromStorage == captainNameFromDOM) && !captainSlot.innerText.includes("Duel")) {
          captainSlot.style.backgroundColor = red;
          continue
        }
        /* Checks if the slot is a special game mode and if a unit has already been placed it check if the user wants to place
        multiple units on special modes */
        else if (((captainSlot.innerText.includes("Dungeons") && !dungeonSwitch) || (captainSlot.innerText.includes("Clash") && !clashSwitch) ||
          ((captainSlot.innerText.includes("Duel") && !duelSwitch)) || !campaignSwitch) &&
          captainSlot.querySelector('.capSlotClose') == null) {
          continue
        }
        //If all is clear, it checks if the captain is diamond loyalty for future comparison.
        //Assigns the placeUnit button and breaks.
        else {
          diamondLoyalty = null;
          diamondLoyalty = captainSlot.outerHTML;
          placeUnit = button
          break;
        }
      } else {
        continue;
      }
    }
  }

  //If place unit exists, click it and call the openBattlefield function
  if (placeUnit) {
    placeUnit.click();
    await delay(1000);
    openBattlefield();
  } else {
    await performCollection();
    return;
  }

  // Change captains using a different device without the script freezing trying to select a captain.
  closeAll();
  isContentRunning = false;
}

async function performCollection() {
  await collectEventChests();
  await collectQuests();
  await buyScrolls();
  await collectFreeDaily();
  await collectBattlePass();
}

// This function checks if the battlefield is present, the current chest type, then zooms into it.
async function openBattlefield() {

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

  let acceptableLoyalty = false;
  const matchingEntry = loyaltyArray.find(item => diamondLoyalty.includes(item.value));
  const matchingKey = matchingEntry ? matchingEntry.key : null;

  if (radioLoyalty === 0) {
    acceptableLoyalty = true;
  } else if (matchingKey >= radioLoyalty) {
    acceptableLoyalty = true;
  }

  //User wants to preserve diamond loyalty and current captain is not diamond and current mode is campaign
  if (mode == false) { //!acceptableLoyalty && ) {
    //Opens battle info and checks chest type.
    battleInfo = document.querySelector(".battleInfoMapTitle")
    battleInfo.click();

    /*
    let mapDifficulty = document.querySelector(".mapInfoDifficulty").innerText
    mapDifficulty = mapDifficulty.split(":")[1].trim();
    if (mapDifficulty == "Very Easy") {

    } else if (mapDifficulty == "Easy") {

    } else if (mapDifficulty == "Moderate") {

    } else if (mapDifficulty == "Hard") {

    } else if (mapDifficulty == "Very Hard") {

    } else if (mapDifficulty == "Insane") {

    } */
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

    await setLogInitialChest2(captainNameFromDOM, chest);

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
      zoom();
    }
    //diamondLoyalty = null;
  } else {
    //User doesn't want to preserve diamond loyalty
    zoom();
  }
}

//Zooms into the battlefield
function zoom() {
  const zoomButton = document.querySelector(".fas.fa-plus");
  if (zoomButton) {
    for (let i = 0; i < 7; i++) {
      zoomButton.click();
    };
    //Resets tracking variables
    markerAttempt = 0;
    arrayOfMarkers = null;
    sortedArrMrks = null;
    currentMarker = null;
    //Invoke getValidMarkers function
    getValidUnits();
  }
}

async function getValidUnits() {

  //Function to check for a frozen state
  reloadRoot();
  await delay(1000);

  // If the timer is +28:30 or above, go back to the main menu as the captain may still be placing markers.
  const clockElement = document.querySelector('.battlePhaseTextClock .clock');
  if (clockElement == null) {
    goHome();
    return;
  } else {
    //Initializes a variable with battle clock
    const timeText = clockElement.innerText.replace(':', '');
    const time = parseInt(timeText, 10);

    if (time > 2830) {
      goHome();
      return;
    }
  }

  const captainUnit = getCaptainUnit()

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
  let unitDrawer = [...document.querySelectorAll(".unitSelectionCont")];
  let unitsToRemove = []

  // Check dungeon
  const dungeonLevelSwitch = await retrieveFromStorage("dungeonLevelSwitch");
  const dungeonPlaceAnywaySwitch = await retrieveFromStorage("dungeonPlaceAnywaySwitch");
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
  for (let i = 0; i < unitDrawer[0].children.length; i++) {
    let unit = unitDrawer[0].children[i];
    //Get unit rarity

    let commonCheck = unit.querySelector('.unitRarityCommon');
    let uncommonCheck = unit.querySelector('.unitRarityUncommon');
    let rareCheck = unit.querySelector('.unitRarityRare');
    let legendaryCheck = unit.querySelector('.unitRarityLegendary');

    //Get unit status: cooldown, defeated and exhausted
    let coolDownCheck = unit.querySelector('.unitItemCooldown');
    let defeatedCheck = unit.querySelector('.defeatedVeil');
    //If unit has this class it's enabled, if it doesn't have it's not enabled.
    let unitDisabled = unit.querySelector('.unitItemDisabledOff');
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
    }

    // Remove units based on unit level
    if (isDungeon) {
      let unitLevel;
      try {
        const unitName = unit.querySelector('.unitClass img').getAttribute('src').slice(-50).toUpperCase();
        unitLevel = parseInt(unit.querySelector('.unitLevel').innerText);
        if (userDunLevel == null || userDunLevel == undefined || userUnitLevel == null || userUnitLevel == undefined) {
          continue;
        } else if (dungeonLevel <= userDunLevel && unitLevel > userUnitLevel || unitName == "AMAZON") {// && unitName != "FLAG") {
          unitsToRemove.push(unit)
          continue
        }

      } catch (error) {
        continue;
      }
    }

  }

  unitsToRemove.forEach(unit => unit.remove());
  unitDrawer = [...document.querySelectorAll(".unitSelectionCont")];

  if (await retrieveFromStorage("priorityListSwitch") && !canCompleteQuests) {
    unitDrawer = await sortPriorityUnits(unitDrawer);
  }

  //Initializes a node list with all units
  let unitsQuantity;
  //Attempts to get ammount of units in the units drawers
  try {
    unitsQuantity = unitDrawer[0].children.length;
  } catch (error) {
    goHome();
    return;
  }

  //Sort the array so units that match the captain skin are put on the front.
  async function shiftUnits() {
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
  if (await retrieveFromStorage("equipSwitch") && !canCompleteQuests) {
    //Only equip if not diamond
    if (await retrieveFromStorage("equipNoDiamondSwitch") && !diamondLoyalty.toString().includes("LoyaltyDiamond")) {
      try {
        await shiftUnits();
      } catch (error) {
        unitDrawer = [...document.querySelectorAll(".unitSelectionCont")];
        console.log("log" + error);
      }
    } else if (!await retrieveFromStorage("equipNoDiamondSwitch")) {
      try {
        await shiftUnits();
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
  }

  // This sorts the markers and adds imaginary markers if there aren't any
  let arrayOfMarkers = await prepareMarkers(captainUnit)
  if (arrayOfMarkers.length == 0) {
    // Map full of block markers, flag the captain.
    goHome()
    return
  }
  // Add unit type and name in the marker
  for (let i = 0; i < arrayOfMarkers.length; i++) {
    let mrkr = arrayOfMarkers[i];
    computedStyle = getComputedStyle(mrkr);
    let backgroundImageValue = computedStyle.getPropertyValue('background-image').toUpperCase();

    arrayOfBattleFieldMarkers.some(marker => {
      // If the current marker matches the items on the array of markers, it's a valid marker
      if (backgroundImageValue.includes(marker.icon)) {
        let currentMarkerKey = marker.key;
        let associatedUnits = [];

        for (let j = 0; j < arrayOfUnits.length; j++) {
          const element = arrayOfUnits[j];
          if (currentMarkerKey === element.type) {
            associatedUnits.push(element.type);
            if (!mrkr.id) {
              mrkr.id = associatedUnits;
              continue
            }
          }
          if (currentMarkerKey === element.key) {
            associatedUnits.push(element.key);
            if (!mrkr.id) {
              mrkr.id = associatedUnits;
              continue
            }
          }
        }
      }
    });
  }

  //Add unit name and type to unit itself
  for (let i = 0; i < unitDrawer[0].children.length; i++) {
    let unit = unitDrawer[0].children[i];
    let unitType = unit.querySelector('.unitClass img').getAttribute('alt').toUpperCase();
    let unitName = unit.querySelector('.unitClass img').getAttribute('src').slice(-50).toUpperCase();
    const unit1 = arrayOfUnits.filter(unit1 => unitName.includes(unit1.icon.toUpperCase()))[1];
    if (unit1) {
      unit.id = unit1.key + "#" + unitType
      continue
    }
  }

  for (let i = 0; i < unitDrawer[0].children.length; i++) {
    let unit = unitDrawer[0].children[i];
    let unitId = unit.id
    for (let j = 0; j < arrayOfMarkers.length; j++) {
      let marker = arrayOfMarkers[j]
      let markerId = marker.id
      let hasPlaced;
      if (markerId == "VIBE") {
        hasPlaced = await attempPlacement(unit, marker)
        if (hasPlaced) {
          return
        }
        else {
          await cancelPlacement()
          continue
        }

      } else if (unitId.includes(markerId)) {
        hasPlaced = await attempPlacement(unit, marker)
        if (hasPlaced) {
          return
        } else {
          await cancelPlacement()
          continue
        }
      }
    }
  }

}

async function cancelPlacement() {
  //Close unit, recalculate drawer, recalculate markers
  const cancelBtn = document.querySelector(".actionButton.actionButtonNegative.placerButton")
  if (cancelBtn) {
    cancelBtn.click()
  }
  await delay(1000)
  const unitDrawer = document.querySelector(".actionButton.actionButtonPrimary.placeUnitButton")
  if (unitDrawer) {
    unitDrawer.click()
  }
}


async function attempPlacement(unit, marker) {

  moveScreenCenter(marker)
  await delay(2000);
  let unitItem = unit.querySelector(".unitItem")
  unitItem.click();
  await delay(1000);
  tapUnit();
  await delay(500);
  const isPlaced = placeTheUnit();
  await delay(1000);
  reloadRoot();
  await delay(1000);
  if (isPlaced || checkPlacement()) {
    return true
  } else {
    return false
  }
}

function checkPlacement() {
  const hasPlaced = document.querySelector(".actionButton.actionButtonDisabled.placeUnitButton");
  const menu = document.querySelector(".captainSlots")
  if (menu || hasPlaced.innerText.includes("UNIT READY TO PLACE IN")) {
    return true
  } else {
    return false
  }
}

//Looks and selects a valid marker for placement
async function prepareMarkers(captainUnit) {

  //Initializes a node list with placement markers
  let arrMrks = Array.from(document.querySelectorAll(".planIcon"));

  async function sort() {
    arrMrks = Array.from(document.querySelectorAll(".planIcon"));
    try {
      //Attempt to sort the markers based on how close they are to the captain
      sortedArrMrks = getMapMatrix(captainUnit, arrMrks);
      return sortedArrMrks
    } catch (error) {
      return arrMrks
    }
  }

  //Captain is on open map only
  if (arrMrks.length == 0) {
    //Place imaginary markers to use instead and restart the function to get valid markers
    setImaginaryMarkers(document.querySelectorAll(".placementAlly"));
    return await sort()
  } else {
    //Treat the markers to remove block markers
    let blockMarkers = []
    for (let i = arrMrks.length - 1; i >= 0; i--) {
      let planIcon = arrMrks[i];
      let backgroundImageValue = getComputedStyle(planIcon).getPropertyValue('background-image').toUpperCase();
      if (backgroundImageValue.includes("VYAAAAASUVORK5CYII=")) {
        blockMarkers.push(planIcon);
      }
    }
    blockMarkers.forEach(marker => { marker.remove(); });
    
    //Check what is inside new array.
    if (arrMrks.length == 0 && (arrayOfAllyPlacement == undefined || arrayOfAllyPlacement.length == 0)) {
      //Captain is using a mix of block markers and open zones.
      //Place imaginary markers to use instead
      arrMrks = setImaginaryMarkers(document.querySelectorAll(".placementAlly"))
      return await sort()
    } else {
      //There are vibe or set markers that can be used.
      return await sort()
    }
  }
}

//Scroll into view the center of the currentMark
async function moveScreenCenter(marker) {

  //Set marker dimensions to zero so the unit can fit in its place
  try {
    marker.style.width = '0';
    marker.style.height = '0';
    marker.style.backgroundSize = '0';

    //Move screen so the current marker gets centered
    await delay(1000);
    if (marker && marker !== undefined && marker !== null) {
      marker.scrollIntoView({ block: 'center', inline: 'center' });
    } else {
      goHome();
      return;
    }
    await delay(1000);
  } catch (error) {
    goHome();
    return;
  }
}

//If the unit is in a valid marker that is in use, by taping the unit container it forces a button recheck on mouseup/touchend
function tapUnit() {
  //Check for frozen state
  reloadRoot()
  //Attemps to tap the selected unit to force a valid placement check
  try {
    const placerUnitCont = document.querySelector('.placerUnitCont');
    const event = new Event('mouseup', { bubbles: true, cancelable: true });
    placerUnitCont.dispatchEvent(event);
  } catch (error) {
    goHome();
    return true;
  }
}

//Places unit or asks for a new valid marker
async function placeTheUnit() {
  const dungeonPlaceAnywaySwitch = await retrieveFromStorage("dungeonPlaceAnywaySwitch");
  //Gets timer, if it doesn't exist return to main menu.
  let clockText
  //Attempts to get the clock text
  try {
    clockText = document.querySelector('.battlePhaseTextClock .clock').innerText;
  } catch (error) {
    goHome();
    return true;
  }

  //If timer has reached 00:00 it means the battle has already started, return to main menu.
  if (clockText === "00:00") {
    let placerButton = document.querySelector(cancelButtonSelector);
    let selectorBack = document.querySelector(".selectorBack");

    if (placerButton && selectorBack) {
      placerButton.click();
      selectorBack.click();
      return true;
    }
  }

  //Attemps to place the selected unit and go back to menu, if the marker is valid, but in use, get a new marker.
  const placeModal = document.querySelector(".placerConfirmButtonsCont")
  const confirmPlacement = placeModal.querySelector(".actionButton.actionButtonPrimary.placerButton");
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
  }

  //Unit was placed successfully, returns to main menu and the process restarts.
  setTimeout(() => {
    // Unit was successfully placed, exit battlefield and so the cycle can be restarted.
    const placementSuccessful = document.querySelector(".actionButton.actionButtonDisabled.placeUnitButton");
    if (placementSuccessful) {
      goHome();
      return true;
    }
  }, 3000);

  setTimeout(() => {
    const disabledButton = document.querySelector(".actionButton.actionButtonDisabled.placerButton");
    const negativeButton = document.querySelector(cancelButtonSelector);
    if (disabledButton) {
      disabledButton.click();
      return false;
    }
    if (negativeButton) {
      negativeButton.click();
      return false;
    }
  }, 5000);
}

const obsv = new MutationObserver(function (mutations) {

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

    //Gets captain name from the dom
    for (const capSlot of capSlotChildren) {
      //Attemps to get the captain name from the current slot
      try {
        capNameDOM = capSlot.querySelector('.capSlotName').innerText;
      } catch (error) {
        continue;
      }

      //Get flag states
      const purpleFlag = await getCaptainFlag(capNameDOM, 'flaggedCaptains');
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
      else if ((dungeonCaptainNameFromStorage != capNameDOM) && capSlot.innerText.includes("Dungeons") ||
        (clashCaptainNameFromStorage != capNameDOM) && capSlot.innerText.includes("Clash") ||
        (duelsCaptainNameFromStorage != capNameDOM) && capSlot.innerText.includes("Duel") ||
        (dungeonCaptainNameFromStorage == capNameDOM) && !capSlot.innerText.includes("Dungeons") ||
        (clashCaptainNameFromStorage == capNameDOM) && !capSlot.innerText.includes("Clash") ||
        (duelsCaptainNameFromStorage == capNameDOM) && !capSlot.innerText.includes("Duel")) {
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
        } else if (offstate == 3) {
          btnOff.textContent = "LEAVE BEFORE";
          btnOff.style.backgroundColor = "purple";
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

//Collect rewards and savages chests
async function collectChests() {
  let collecRewardButtons = document.querySelectorAll(".actionButton.capSlotButton.capSlotButtonAction");
  const buttonLabels = ["SEE RESULTS", "OPEN CHEST", "COLLECT KEYS", "COLLECT BONES"];

  for (let i = 0; i < collecRewardButtons.length; i++) {
    const button = collecRewardButtons[i];
    const buttonText = button.innerText;
    if (buttonLabels.includes(buttonText)) {
      const offSetSlot = button.offsetParent;
      let captainName = offSetSlot.querySelector(".capSlotName").innerText;

      //Get battle result and chest type to add to storage log
      let battleResult = offSetSlot.querySelector(".capSlotStatus").innerText;
      let chestString;
      let chestStringAlt;
      if (battleResult.includes("Defeat")) {
        chestStringAlt = "chestsalvage";
      } else {
        try {
          chestString = button.querySelector('img');
          try {
            chestStringAlt = chestString.alt;
            if (chestStringAlt === "") {
              if (chestString.getAttribute('src').toLowerCase().includes("bone")) {
                chestStringAlt = "bones";
              } else if (chestString.getAttribute('src').toLowerCase().includes("key")) {
                chestStringAlt = "keys";
              }
            }
          } catch (error) {
          }
        } catch (error) {
        };
      }

      const capSlot = button.parentElement.parentElement
      const stBtn = capSlot.querySelector(".offlineButton").id
      const slotState = await getIdleState(stBtn);
      const cNm = capSlot.querySelector(".capSlotName").innerText
      button.click();
      await delay(2000);
      let rewards;
      let leaderboardRank;
      let kills;
      let assists;
      let unitIconList;
      //Check if user wants to log rewards and leaderboard results
      const logSwitch = await retrieveFromStorage("logSwitch");
      if (logSwitch) {
        let userName = document.querySelector(".userInfoImage").alt;
        let rewardAmt;
        rewards = "";
        let rewardScrim = document.querySelectorAll(".rewardsScrim");
        if (rewardScrim.length > 0) {
          let rewardsTab = document.querySelector(".rewardsTab");
          rewardsTab.click();
          await delay(500);
          let allRewards;
          allRewards = rewardScrim[0].querySelectorAll(".rewardMainImage");
          let allRewardAmts = rewardScrim[0].querySelectorAll(".rewardListItemAmt");
          for (let i = 0; i < allRewards.length; i++) {
            const reward = allRewards[i];
            if (i < allRewardAmts.length) {
              rewardAmt = allRewardAmts[i].innerText;
            } else {
              rewardAmt = "";
            }
            rewards = reward.src + " " + reward.alt + rewardAmt + "," + rewards;
          }
          if (rewards === "") {
            let rewardGridFooter = rewardScrim[0].querySelector(".rewardGridFooter");
            if (rewardGridFooter.innerText.includes("alvage")) {
              rewards = "None";
            }
          }
          let leaderboardTab = document.querySelector(".rewardsLeaderboardTab");
          leaderboardTab.click();
          await delay(500);

          let rows2 = document.querySelectorAll(".rewardsLeaderboardRowCont")
          let lastRow2 = rows2[rows2.length - 1];

          let leaderboardRows;
          for (let k = 0; k < 30; k++) {
            leaderboardRows = document.querySelectorAll(".rewardsLeaderboardRowCont");

            for (let i = 0; i < leaderboardRows.length; i++) {
              const leaderboardRow = leaderboardRows[i];
              const leaderboardRowUser = leaderboardRow.querySelector(".rewardsLeaderboardRowText.rewardsLeaderboardRowDisplayName");
              leaderboardRank = leaderboardRow.querySelector(".rewardsLeaderboardRowText.rewardsLeaderboardRowRank").innerText;
              if (leaderboardRowUser.innerText == userName) {
                leaderboardRank = leaderboardRow.querySelector(".rewardsLeaderboardRowText.rewardsLeaderboardRowRank").innerText;
                kills = leaderboardRow.querySelector(".rewardsLeaderboardRowText.rewardsLeaderboardRowKills").innerText;
                assists = leaderboardRow.querySelector(".rewardsLeaderboardRowText.rewardsLeaderboardRowAssists").innerText;
                let unitIconsAll = leaderboardRow.querySelector(".rewardsLeaderboardRowUnitIconsCont");
                let unitIcons = unitIconsAll.querySelectorAll(".rewardsLeaderboardRowUnitIconWrapper");
                unitIconList = "";
                for (let j = 0; j < unitIcons.length; j++) {
                  const unitIconWrapper = unitIcons[j];
                  let unitIcon = unitIconWrapper.querySelector(".rewardsLeaderboardRowUnitIcon");
                  unitIconList = unitIcon.src + " " + unitIcon.alt + "," + unitIconList
                }
                if (kills !== undefined) {
                  await delay(500);//+(500*k));
                }
                break;
              }
            }
            if (kills !== undefined && kills !== null) {
              break;
            }
            clickHoldAndScroll(lastRow2, -1000, 100);
            await delay(500);
            rows2 = document.querySelectorAll(".rewardsLeaderboardRowCont");
            lastRow2 = rows2[rows2.length - 1];
          }

        }
        await delay(500);
      }
      await setLogResults(battleResult, captainName, chestStringAlt, leaderboardRank, kills, assists, unitIconList, rewards);
      battleResult = null;
      captainName = null;
      chestStringAlt = null;
      leaderboardRank = null;
      kills = null;
      assists = null;
      unitIconList = null;
      rewards = null;
      await delay(250);

      const rewardContinueButton = document.querySelector(".actionButton.actionButtonPrimary.rewardsButton");

      if (rewardContinueButton) {
        if (rewardContinueButton.innerText === "CONTINUE") {
          rewardContinueButton.click();
        }
      }
      await delay(250);
      if (slotState == 2) {
        const allCapSlots = document.querySelectorAll(".capSlot")
        for (const i in allCapSlots) {
          const capSlot = allCapSlots[i]
          if (capSlot.innerText.includes(cNm)) {
            const close = capSlot.querySelector(".capSlotClose")
            if (close) {
              const afterSwitch = await retrieveFromStorage('afterSwitch');
              if (afterSwitch) {
                setIdleState(stBtn, 1)
              } else {
                setIdleState(stBtn, 0)
              }
              close.click()
            }
            break
          }
        }
        await delay(1000);
      }

      break;
    }
  }
}

//This function resets the running state and closes the battlefield back to home.
function goHome() {
  const backHome = document.querySelector(".selectorBack");
  if (backHome) {
    backHome.click();
    //await delay(1000);
    const menuElements = document.querySelectorAll(".slideMenuCont.slideLeft.slideLeftOpen");
    const leaderboard = Array.from(menuElements).find(element => element.innerText.includes('Leaderboard'));
    if (leaderboard) {
      leaderboard.classList.remove('slideLeftOpen');
      leaderboard.classList.add('slideLeftClosed');
    }
  }
}

async function requestLoyalty(captainNameFromDOM) {
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

    contentScriptPort.postMessage({ action: "getLoyalty", captainNameFromDOM });
  });
}

async function requestMapName(captainNameFromDOM) {
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

    contentScriptPort.postMessage({ action: "getMapName", captainNameFromDOM });
  });
}

function simulateMouseEvent(element, eventName, clientX, clientY) {
  const event = new MouseEvent(eventName, {
    bubbles: true,
    cancelable: true,
    clientX: clientX,
    clientY: clientY
  });
  element.dispatchEvent(event);
}

function clickHoldAndScroll(element, deltaY, duration) {
  try {
    const rect = element.getBoundingClientRect();
    const clientX = rect.left + rect.width / 2;
    const clientY = rect.top + rect.height / 2;

    simulateMouseEvent(element, "mousedown", clientX, clientY);

    const interval = 10;
    const steps = Math.ceil(duration / interval);
    const stepSize = deltaY / steps;
    let cumulativeDeltaY = 0;
    let step = 0;
    const scrollInterval = setInterval(() => {
      if (step < steps) {
        cumulativeDeltaY += stepSize;
        simulateMouseEvent(element, "mousemove", clientX, clientY + cumulativeDeltaY);
        step++;
      } else {
        clearInterval(scrollInterval);
        simulateMouseEvent(element, "mouseup", clientX, clientY + cumulativeDeltaY);
      }
    }, interval);
  } catch (error) {
    console.log(error)
  }

}

async function doPotions() {
  //Checks if user wants to use potions.
  let potionState = await getRadioButton("selectedOption");
  //CHeck if user wants to use potions only with specific captains
  const favoriteSwitch = await getSwitchState("favoriteSwitch");
  let favoritePotion = false;
  let number;
  let epicButton;

  if (!favoriteSwitch) {
    favoritePotion = true;
  }
  //Check if current captain is a favorite potion captain
  try {
    if (potionState != 0 && !mode && favoriteSwitch) {
      const potionCaptainsList = await new Promise((resolve) => {
        chrome.storage.local.get({ ['potionlist']: [] }, function (result) {
          const potionCaptainsList = result["potionlist"];
          resolve(potionCaptainsList);
        });
      });
      // Check if the array exists and is an array with at least one element
      if (Array.isArray(potionCaptainsList) && potionCaptainsList.length > 0) {
        //Check if current captain is a favorite potion captain. If not set potion state to 0.
        if (potionCaptainsList.some(item => item.toUpperCase() === captainNameFromDOM.toUpperCase())) {
          favoritePotion = true;
        }
      }
    }
  } catch (error) { }

  //User wants to use potions
  if (potionState != 0 && !mode && favoritePotion) {
    //Get potion strings so the string can be trimmed and converted to int for validation
    let potions;
    //Attempts to get potion quantity
    try {
      potions = document.querySelector("img[alt='Potion']").closest(".quantityItem");
    } catch (error) {
      goHome();
      return;
    }
    let potionQuantity = potions.querySelector(".quantityText").textContent;
    epicButton = document.querySelector(".actionButton.actionButtonPrimary.epicButton");
    number = parseInt(potionQuantity.substring(0, 3));
  }
  //User wants to use potions as soon as there are at least 45 potions.
  if (potionState == 1 && number >= 45) {
    if (epicButton) {
      epicButton.click();
    }
    //User wants to use potions as soon as there are 100 potions.
  } else if (potionState && number == 100) {
    if (epicButton) {
      epicButton.click();
    }
  }
}