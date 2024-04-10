//This file handles shopping and collection of scrolls, quests and rewards.

//Triggers the collectQuests function every 10-15 seconds
(function loopCollectQuests() {
    setTimeout(() => {
        collectQuests();
        loopCollectQuests();
    }, getRandNum(10, 15) * 1000);
}());

//Declare variables for initialization later
const collectDelay = (ms) => new Promise((res) => setTimeout(res, ms));
let navItems;

//Function to buy scrolls
async function buyScrolls() {
    //Checks if user wants to buy scrolls, returns if not
    let scrollState = await getSwitchState("scrollSwitch");
    if (!scrollState) {
        return;
    }
    //Checks if the user wants to buy additional scrolls
    let extraState = await getSwitchState("extraSwitch");
    let storeItems = await getCurrentStoreItems();
    if (storeItems == undefined) {
        return;
    }

    //loop through and purchase scrolls, then purchase store refresh and loop/purchase scrolls again
    for (let j = 0; j < 2; j++) {
        for (let i = 0; i < storeItems.length; i++) {
            const storeItem = storeItems[i];
            if (storeItem.section == "Scrolls") {
                //add logic to buy specific scrolls?
                if (storeItem.purchased == "0") {
                    await purchaseStoreItem(storeItem.itemId);
                }
            }
        }
        if (extraState) {
            let storeRefreshCount = await getStoreRefreshCount();
            if (storeRefreshCount == 0) {
                storeItems = await purchaseStoreRefresh();
            }
        } else {
            break;
        }
    }

}

//Function to collect the free daily reward given during events
async function collectFreeDaily() {
    //Checks if the user wants the freebies to be collected, returns if not.
    let dailySwitch = await getSwitchState("dailySwitch");
    if (!dailySwitch) {
        return;
    }

    await grantDailyDrop();
}

//Function to collect the event chests given during events
async function collectEventChests() {
    //Checks if the user wants the event chests to be collected, returns if not.
    let eventChestSwitch = await getSwitchState("eventChestSwitch");
    if (!eventChestSwitch) {
        return;
    }
    //Get event currency strings so the string can be trimmed and converted to int for validation
    let eventCurrency = null;
    let eventCurrencyImg = null;
    let eventCurrencyAlt = null;

    //Check if an event currency exists
    currencies = document.querySelectorAll(".quantityItem");
    for (var i = 0; i < currencies.length; i++) {
        var currentCurrency = currencies[i];
        var imgElement = currentCurrency.querySelector("img[alt='Gold'], img[alt='Meat'], img[alt='Keys'], img[alt='Potion'], img[alt='Bones']");
        if (imgElement) {
            continue;
        } else {
            eventCurrency = currentCurrency;
            evImg = currentCurrency.querySelector(".quantityImage")
            eventCurrencyImg = evImg.src
            eventCurrencyAlt = evImg.alt
            break;
        }
    }
    if (eventCurrency == null || eventCurrency == undefined || eventCurrencyImg == null || eventCurrencyImg == undefined || eventCurrencyAlt == null || eventCurrencyAlt == undefined) {
        returnToMainScreen()
    }

    let eventCurrencyQuantity;
    let number;
    // Always error check when converting a string to an integer because the chances of failing is very high since the string might have letters and symbols.
    try {
        eventCurrencyQuantity = eventCurrency.querySelector(".quantityText").textContent;
        number = parseInt(eventCurrencyQuantity.substring(0, 4));
    } catch (error) {
        returnToMainScreen()
    }

    // Get minimum value set by the user or default to 1500.
    const minimumCurrency = await getMinimumCurrency();

    if (number >= minimumCurrency) {
        //Initializes node list with nav bar items and open the store.
        navItems = document.querySelectorAll(".mainNavItemText");
        navItems.forEach((navItem) => {
            if (navItem.innerText === "Store") {
                navItem.click();
            }
        });
        await collectDelay(4000);
        //Initiliazes the freebie button and if it exists and is the claim button, clicks it and goes back to the main menu.

        const storeButtons = document.querySelectorAll(".actionButton.actionButtonBones.storeCardButton.storeCardButtonBuy");
        for (var i = 0; i < storeButtons.length; i++) {
            stButton = storeButtons[i]
            stButtonImg = stButton.querySelector("img")
            if (stButtonImg != null && stButtonImg.src == eventCurrencyImg) {
                for (var y = 0; y < 5; y++) {
                    stButton.click();
                    await collectDelay(1000);
                }
                //stButton.submit();
                //returnToMainScreen();
                //break;
            }
        }
        returnToMainScreen();
    }
}

//Function to collect quests
async function collectQuests() {
    if (await retrieveFromStorage("paused_checkbox")) {
        return
    }
    //Checks if user wants to collect quests, returns if not.
    let questState = await getSwitchState("questSwitch");
    if (!questState) {
        return;
    }
    let questsData = await getUserQuests();
    for (const questData in questsData) {
        if (questsData[questData].currentQuestId != null) {
            await collectQuestReward(questsData[questData].questSlotId);
        }
    }
}

//Function to collect the battlepass during events
async function collectBattlePass() {
    //Checks if user wants to collect the battlepass, returns if not.
    let questState = await getSwitchState("battlepassSwitch");
    if (!questState) {
        return;
    }
    const dataArray = ['clientVersion', 'dataVersion'];
    const dataKeys = await retrieveMultipleFromStorage(dataArray);
    const clientVersion = dataKeys.clientVersion;
    const gameDataVersion = dataKeys.dataVersion;

    try {
        const url = `https://www.streamraiders.com/api/game/?cn=getEventProgressionLite&clientVersion=${clientVersion}&clientPlatform=MobileLite&gameDataVersion=${gameDataVersion}&command=getEventProgressionLite&isCaptain=0`
        const response = await makeRequest(url, 0);
        if (response == undefined) {
            return;
        }
        const eventProgressionData = await response.json();
        const eventProgress = eventProgressionData.data;
        let currentTier = eventProgress.currentTier;
        let tiers = [];
        const rows = currentTier - 1;
        const columns = 3;

        for (let i = 0; i < rows; i++) {
            tiers[i] = [];
            for (let j = 0; j < columns; j++) {
                tiers[i][j] = j;
            }
        }

        let hasBattlePass = eventProgress.hasBattlePass;

        //get current list of collected tiers, split into array, sort as numerical values
        let basicRewardsCollected = [];
        let battlePassRewardsCollected = [];
        if (eventProgress.basicRewardsCollected != null) {
            basicRewardsCollected = splitAndSort(eventProgress.basicRewardsCollected);
        }
        if (hasBattlePass == "1") {
            if (eventProgress.battlePassRewardsCollected != null) {
                battlePassRewardsCollected = splitAndSort(eventProgress.battlePassRewardsCollected);
            }
        }

        //set up tiers array to determine which tiers need to be collected
        for (let j = 0; j < currentTier - 1; j++) {
            tiers[j][0] = j + 1;
            tiers[j][1] = 0;
            tiers[j][2] = 0;
            basic_loop: for (let m = 0; m < basicRewardsCollected.length; m++) {
                if (basicRewardsCollected[m] == tiers[j][0]) {
                    tiers[j][1] = 1;
                    break basic_loop;
                }
            }
            if (hasBattlePass == "1") {
                battlePass_loop: for (let m = 0; m < battlePassRewardsCollected.length; m++) {
                    if (battlePassRewardsCollected[m] == tiers[j][0]) {
                        tiers[j][2] = 1;
                        break battlePass_loop;
                    }
                }
            }
        }
        //Basic (free) rewards
        await loopTiersAndCollect(tiers, "False");

        //BattlePass (paid) rewards
        if (hasBattlePass == "1") {
            await loopTiersAndCollect(tiers, "True");
        }
    } catch (error) {
        console.error('Error collecting event/battlepass rewards:', error.message);
        return;
    }
}

function splitAndSort(arr) {
    let splitAndSortArray = arr.split(",");
    splitAndSortArray = splitAndSortArray.sort(function (a, b) { return a - b; });;
    return splitAndSortArray;
}

async function loopTiersAndCollect(tiers, battlePass) {
    let eventUid = await getEventProgressionLite();
    let eventTiers = await retrieveFromStorage("eventTiers");
    for (let j = 0; j < tiers.length; j++) {
        if ((battlePass == "False" && tiers[j][1] == 0) || (battlePass == "True" && tiers[j][2] == 0)) {
            let missingTier = j + 1;
            tier_loop: for (const eventTier in eventTiers) {
                if (eventTiers[eventTier].Tier == missingTier) {
                    if ((battlePass == "True" && eventTiers[eventTier].BattlePassRewards == "epicpotion") || (battlePass == "False" && eventTiers[eventTier].BasicRewards == "epicpotion")) {
                        let epicProgression = await getPotionQuantity();
                        //if the capacity for new potions is >= the reward amount, collect the reward
                        if ((battlePass == "True" && (100 - epicProgression) >= eventTiers.BattlePassAmount) || (battlePass == "False" && (100 - epicProgression) >= eventTiers.BasicAmount)) {
                            await collectEventReward(eventUid, missingTier, battlePass);
                            break tier_loop;
                        } else {
                            break tier_loop;
                        }
                    } else {
                        await collectEventReward(eventUid, missingTier, battlePass);
                        break tier_loop;
                    }
                }
            }
        }
    }
}

//This function is called after all tasks are completed in order to return to the main menu.
function returnToMainScreen() {
    navItems = document.querySelectorAll(".mainNavItemText");
    navItems.forEach(navItem => {
        if (navItem.innerText === "Battle") {
            navItem.click();
        }
    })
}

function getMinimumCurrency() {
    return new Promise(resolve => {
        chrome.storage.local.get(['minimumCurrencyInput'], function (result) {
            const reloaderInputValue = parseInt(result.minimumCurrencyInput);
            if (!isNaN(reloaderInputValue)) {
                resolve(reloaderInputValue);
            } else {
                resolve(1500);
            }
        });
    });
}



async function buyChests() {

    let currentUserCurrencies = await getAvailableCurrencies()
    if (!currentUserCurrencies || !currentUserCurrencies.data || currentUserCurrencies.data == undefined) {
        return
    }

    let bones = currentUserCurrencies.data.bones;
    let keys = currentUserCurrencies.data.keys;

    let buyCheapestFirst = await retrieveFromStorage("chestPurchaseOrder");


    async function buyChestsWithCurrency(currencyType, minCurrency, chestData) {

        let userChestData = await retrieveFromStorage("userChests");
        let userChestLogData = await retrieveFromStorage("userChestsLog") || [];
        let eventUid = await getEventProgressionLite();

        if (!userChestData) {
            return;
        }

        if (minCurrency > 0 && currencyType > minCurrency) {
            let chestsData = await retrieveFromStorage(chestData);

            for (let i = 0; i < chestsData.length; i++) {
                let chest = chestsData[i];
                const LiveEndTime = new Date(chest["LiveEndTime"] + ' UTC');
                const LiveStartTime = new Date(chest["LiveStartTime"] + ' UTC');
                const currentTime = new Date();

                if (LiveEndTime.getTime() < currentTime.getTime() || LiveStartTime.getTime() > currentTime.getTime()) {
                    chestsData.splice(i, 1);
                    i--;
                }
            }

            if (buyCheapestFirst) {
                chestsData.sort((a, b) => a.BasePrice - b.BasePrice);
            } else {
                chestsData.sort((a, b) => b.BasePrice - a.BasePrice);
            }

            for (let i = 0; i < chestsData.length; i++) {
                let chest = chestsData[i];
                let uid = chest["Uid"];
                let basePrice = chest["BasePrice"];

                if ((currencyType - basePrice) < minCurrency) {
                    continue;
                }

                let purchaseLimit = chest["PurchaseLimit"];

                if (purchaseLimit !== -1) {
                    let userChest = userChestData[uid];

                    if (!userChest || userChest.amountBought >= purchaseLimit) {
                        continue;
                    }
                }

                if (!userChestData.hasOwnProperty(uid)) {
                    continue;
                }

                currencyType -= basePrice;

                const dataArray = ['clientVersion', 'dataVersion'];
                const dataKeys = await retrieveMultipleFromStorage(dataArray);
                const clientVersion = dataKeys.clientVersion;
                const gameDataVersion = dataKeys.dataVersion;
                let url = `https://www.streamraiders.com/api/game/?cn=purchaseChestItem&itemId=${uid}&clientVersion=${clientVersion}&clientPlatform=WebLite&gameDataVersion=${gameDataVersion}&command=purchaseChestItem&isCaptain=0`;
                let response = await makeRequest(url, 0);
                let purchaseResponse = await response.json();

                if (purchaseResponse.status == "success") {
                    if (userChestData.hasOwnProperty(uid)) {
                        userChestData[uid].amountBought++;
                    } else {
                        console.log(`Chest with uid ${uid} not found in userChestData.`);
                    }
                    userChestLogData.push({
                        dateTime: new Date().toString(),
                        chestId: purchaseResponse.data.chestId,
                        rewards: purchaseResponse.data.rewards,
                        eventUid: eventUid
                    })
                } else {
                    console.log(`Failed to purchase chest with uid ${uid}.`);
                }
            }
            await saveToStorage("userChests", userChestData);
            await saveToStorage("userChestsLog", userChestLogData);
        }
    }

    //if (buy skins) {
    //    call logic to buy skin
    //} else {
    await buyChestsWithCurrency(keys, await retrieveNumberFromStorage("minKeyCurrency"), "dungeonChestsData");
    await buyChestsWithCurrency(bones, await retrieveNumberFromStorage("minBoneCurrency"), "boneChestsData");
    // }

}
