//This file handles shopping and collection of scrolls, quests and rewards.

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
    let storeItems = await retrieveFromStorage("currentStoreItems");
    if (storeItems == undefined) {
        return;
    } else {
      storeItems = storeItems.data;
    }

    //loop through and purchase scrolls, then purchase store refresh and loop/purchase scrolls again
    for (let j = 0; j < 2; j++) {
        for (let i = 0; i < storeItems.length; i++) {
            const storeItem = storeItems[i];
            if (storeItem.section == "Scrolls") {
                //add logic to buy specific scrolls?
                if (storeItem.purchased == "0") {
                    //If there are scrolls to purchase, purchase them using the dom
                    
                    //Initializes node list with nav bar items.
                    navItems = document.querySelectorAll(".mainNavItemText");

                    //Opens the store via the navbar
                    navItems.forEach((navItem) => {
                        if (navItem.innerText === "Store") {
                            navItem.click();
                        }
                    });

                    await collectDelay(4000);
                    //Initializes a node list with the buy buttons
                    let buyScrollButtons = document.querySelectorAll(".actionButton.actionButtonGolden.actionButtonShiny.userStoreItemButton");

                    //If they buy buttons exists, click all of them and go back to the main menu.
                    if (buyScrollButtons.length > 0) {
                        buyScrollButtons.forEach((buyButton) => {
                            buyButton.click();
                        });
                        await returnToMainScreen();
                    }
                }
            }
        }
        if (extraState) {
            let storeRefreshCount = await retrieveFromStorage("storeRefreshCount");
            if (storeRefreshCount == 0) {
                //Initializes the refresh button
                let buyMoreButton = document.querySelector(".actionButton.actionButtonGolden.storeScrollsButton");
                //If it exists check if the button is the refresh button for 100 coins, clicks it and returns to the main menu.
                if (buyMoreButton) {
                    const buttonText = buyMoreButton.innerText;
                    if (buttonText.includes("REFRESH NOW") && buttonText.includes("100")) {
                        buyMoreButton = document.querySelector(".actionButton.actionButtonGolden.storeScrollsButton");
                        buyMoreButton.click();
                        buyMoreButton.submit();
                    }
                }
                await returnToMainScreen();
            }
        } else {
            await returnToMainScreen();
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
    //Initializes node list with nav bar items and open the store.
    navItems = document.querySelectorAll(".mainNavItemText");
    navItems.forEach((navItem) => {
        if (navItem.innerText === "Store") {
            navItem.click();
        }
    });
    await collectDelay(4000);
    //Initiliazes the freebie button and if it exists and is the claim button, clicks it and goes back to the main menu.
    const freebieButton = document.querySelector(".actionButton.actionButtonBones.storeCardButton.storeCardButtonBuy");
    if (freebieButton && freebieButton.innerText.includes("CLAIM")) {
        freebieButton.click();
        freebieButton.submit();
        await returnToMainScreen();
    }
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
        await returnToMainScreen()
    }

    let eventCurrencyQuantity;
    let number;
    // Always error check when converting a string to an integer because the chances of failing is very high since the string might have letters and symbols.
    try {
        eventCurrencyQuantity = eventCurrency.querySelector(".quantityText").textContent;
        number = parseInt(eventCurrencyQuantity.substring(0, 4));
    } catch (error) {
        await returnToMainScreen()
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
        await returnToMainScreen();
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

    //Initializes node list with nav bar items.
    navItems = document.querySelectorAll(".mainNavItemText");

    //Clicks the Quests button on the nav bar
    navItems.forEach((navItem) => {
        if (navItem.innerText === "Quests") {
            navItem.click();
            return;
        }
    });
    await collectDelay(1000);

    //Initializes a node list with collect quest buttons
    const questItems = document.querySelectorAll(".questItemCont");
    
    let questsCollected = 0;
    //Get the quest buttons from the quest items and checks if they aren't disabled. Clicks them.
    questItems.forEach(async (questItem) => {
        const collectQuestButton = questItem.querySelector(".actionButton.actionButtonPrimary.questItemCollect");
        const isDisabled = questItem.querySelector(".questItemDisabled");
        try {
            if (collectQuestButton && !isDisabled) {
              questsCollected++;
              collectQuestButton.click();
              collectQuestButton.submit();
              clickHoldAndScroll(collectQuestButton, 0, 0);
            }
        } catch (error) {}
    });
    //Returns to main menu.
    if (questsCollected > 0) await collectDelay(1000);
    await returnToMainScreen();
}

//Function to collect the battlepass during events
async function collectBattlePass() {
    //Checks if user wants to collect the battlepass, returns if not.
    let questState = await getSwitchState("battlepassSwitch");
    if (!questState) {
        return;
    }
    await returnToMainScreen();
    //Get the header buttons to click on the rewards
    const headerButtons = document.querySelectorAll(".actionButton.actionButtonGift");
    headerButtons.forEach(async (rewardButton) => {
        //If the rewards button exist in the header, clicks it.
        if (rewardButton.innerText.includes("REWARDS")) {
            rewardButton.click();
            await collectDelay(1000);
            //Initializes a node list with collect buttons
            const collectButtons = document.querySelectorAll(".actionButton.actionButtonCollect.rewardActionButton");
            //Clicks any buttons that may exist
            for (button of collectButtons) {
                button.click();
                await collectDelay(1000);
                //After clicking the collect button a confirmation popup loads.
                const confirmButtons = document.querySelectorAll(".actionButton.actionButtonPrimary");
                confirmButtons.forEach(async (confirm) => {
                    //Clicks on correct confirm button.
                    if (confirm.innerText.includes("CONFIRM AND COLLECT")) {
                        confirm.click();
                        confirm.submit();
                        await collectDelay(1000);
                    }
                });
            }
            closeAll();
        }
    });
}

//This function is called after all tasks are completed in order to return to the main menu.
async function returnToMainScreen() {
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

    let currentUserCurrencies = await retrieveFromStorage("availableCurrencies")
    if (!currentUserCurrencies || !currentUserCurrencies.data || currentUserCurrencies.data == undefined) {
        return
    }

    let bones = currentUserCurrencies.data.bones;
    let keys = currentUserCurrencies.data.keys;

    let buyCheapestFirst = await retrieveFromStorage("chestPurchaseOrder");

    async function buyChestsWithCurrency(currencyType, minCurrency, chestData) {

        let userChestData = await retrieveFromStorage("userChests");

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
                let chestName = chest["DisplayName"];
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

                await buySpecificChest(chestName, basePrice);
            }
        }
    }

    let buyAllSkins = await retrieveFromStorage("buyAllSkins")
    if (buyAllSkins) {
        await buyChestsWithSkins(keys, await retrieveFromStorage("buyThisKeyChest"), await retrieveNumberFromStorage("minKeyCurrency"), "dungeonChestsData")
        await buyChestsWithSkins(bones, await retrieveFromStorage("buyThisBoneChest"), await retrieveNumberFromStorage("minBoneCurrency"), "boneChestsData")
    } else {
        await buyChestsWithCurrency(keys, await retrieveNumberFromStorage("minKeyCurrency"), "dungeonChestsData");
        await buyChestsWithCurrency(bones, await retrieveNumberFromStorage("minBoneCurrency"), "boneChestsData");
    }

}

async function buySpecificChest(chestName, basePrice) {
    //Initializes node list with nav bar items.
    let navItems = document.querySelectorAll(".mainNavItemText");

    //Opens the store via the navbar
    navItems.forEach((navItem) => {
        if (navItem.innerText === "Store") {
            navItem.click();
        }
    });

    await collectDelay(2000);
    //Initializes a node list with the store options
    let storeOptions = document.querySelectorAll(".storeCard.storeCardHighlighted");

    //If they buy buttons exists, click all of them and go back to the main menu.
    if (storeOptions.length > 0) {
        storeOptions.forEach((storeOption) => {
            let itemName = storeOption.querySelector(".storeCardNameNotif");
            if (itemName.innerText == chestName) {
                const buyButton = storeOption.querySelector(".actionButton.actionButtonBones.storeCardButton.storeCardButtonBuy");
                if (buyButton && buyButton.innerText.includes(basePrice)) {
                    buyButton.click();
                    clickHoldAndScroll(buyButton, 0, 0);
                    //After clicking the collect button a confirmation popup loads.
                    const confirmButtons = document.querySelectorAll(".actionButton.actionButtonPrimary");
                    confirmButtons.forEach((confirm) => {
                        //Clicks on correct confirm button.
                        if (confirm.innerText.includes("OK")) {
                            confirm.click();
                        }
                    });
                }
            }
        });
        await collectDelay(1000);
        await returnToMainScreen();
    }
}

async function cleanChestLogData() {
    let userChestLogData = await retrieveFromStorage("userChestsLog") || [];
    let newUserChestLogData;
    //If there's more than 5000 entries, delete oldest.
    if (userChestLogData.length > 5000) {
        newUserChestLogData = userChestLogData.slice(userChestLogData.length - 5000, userChestLogData.length + 1);
    }
    await saveToStorage("userChestsLog", newUserChestLogData);
}

async function buyChestsWithSkins(currencyType, chestFallBack, minCurrency, chestData) {
    console.log("We are here")
}