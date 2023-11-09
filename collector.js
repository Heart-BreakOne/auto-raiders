//This file handles shopping and collection of scrolls, quests and rewards.

//Declare variables for initialization later
const collectDelay = (ms) => new Promise((res) => setTimeout(res, ms));;
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

    //Initializes node list with nav bar items.
    navItems = document.querySelectorAll(".mainNavItemText");

    //Gets the current UTC time as the scroll store is only available at the following times: 00:00, 06:00, 12:00 and 18:00
    const now = new Date();
    const minutes = now.getMinutes();
    //Check if it is time to buy scrolls
    if ((minutes >= 0 && minutes < 7) || (minutes >= 15 && minutes < 22) || (minutes >= 30 && minutes < 37) || (minutes >= 45 && minutes < 52)) {
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
            returnToMainScreen();
        }
        //If the user wants to buy extra scrolls, clicks the store refresh button once for 100 coins.
        else if (extraState) {
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
            returnToMainScreen();
        }
    } else {
        //Returns to main menu if it is not time to buy scrolls.
        returnToMainScreen();
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
        returnToMainScreen();
    }
}

//Function to collect quests
async function collectQuests() {
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
        }
    });
    await collectDelay(4000);

    //Initializes a node list with collect quest buttons
    const questItems = document.querySelectorAll(".questItemCont");

    //Get the quest buttons from the quest items and checks if they aren't disabled. Clicks them.
    questItems.forEach((questItem) => {
        const collectQuestButton = questItem.querySelector(".actionButton.actionButtonPrimary.questItemCollect");
        const isDisabled = questItem.querySelector(".questItemDisabled");
        if (collectQuestButton && !isDisabled) {
            collectQuestButton.click();
            collectQuestButton.submit();
        }
    });
    //Returns to main menu.
    returnToMainScreen();
}

//Function to collect the battlepass during events
async function collectBattlePass() {
    //Checks if user wants to collect the battlepass, returns if not.
    let questState = await getSwitchState("battlepassSwitch");
    if (!questState) {
        return;
    }
    //Get the header buttons to click on the rewards
    const headerButtons = document.querySelectorAll(".actionButton.actionButtonGift");
    headerButtons.forEach((rewardButton) => {
        //If the rewards button exist in the header, clicks it.
        if (rewardButton.innerText.includes("REWARDS")) {
            rewardButton.click();
            //Initiliazes a node list with collect buttons
            const collectButtons = document.querySelectorAll(".actionButton.actionButtonCollect.rewardActionButton");
            //Clicks any buttons that may exist
            for (button of collectButtons) {
                button.click();

                //After clicking the collect button a confirmation popup loads.
                const confirmButtons = document.querySelectorAll(".actionButton.actionButtonPrimary");
                confirmButtons.forEach((confirm) => {
                    //Clicks on correct confirm button.
                    if (confirm.innerText.includes("CONFIRM AND COLLECT")) {
                        confirm.click();
                        confirm.submit();
                    }
                });
            }
            closeAll();
        }
    });
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