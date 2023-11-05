
let collectDelay;
let navItems;
let inRange;

async function buyScrolls() {
    let scrollState = await getSwitchState("scrollSwitch");
    let extraState = await getSwitchState("extraSwitch");
    if (!scrollState) {
        return;
    }
    collectDelay = (ms) => new Promise((res) => setTimeout(res, ms));
    //Get navMenuItems
    navItems = document.querySelectorAll(".mainNavItemText");

    //Gets the current UTC time as the scroll store is only available at the following times: 00:00, 06:00, 12:00 and 18:00
    const now = new Date();
    const minutes = now.getMinutes();
    inRange = false;

    if ((minutes >= 0 && minutes < 7) || (minutes >= 15 && minutes < 22) || (minutes >= 30 && minutes < 37) || (minutes >= 45 && minutes < 52)) {
        inRange = true;
    }
    if (inRange) {
        navItems.forEach((navItem) => {
            if (navItem.innerText === "Store") {
                navItem.click();
            }
        });

        //Click on scroll shop buttons if it hasnt been done already
        await collectDelay(4000);
        let buyScrollButtons = document.querySelectorAll(".actionButton.actionButtonGolden.actionButtonShiny.userStoreItemButton");
        const freebieButton = document.querySelector(".actionButton.actionButtonBones.storeCardButton.storeCardButtonBuy");
        if (buyScrollButtons.length > 0) {
            buyScrollButtons.forEach((buyButton) => {
                buyButton.click();
            });
            returnToMainScreen();
        } else if (freebieButton && freebieButton.innerText.includes("CLAIM")) {
            freebieButton.click();
            freebieButton.submit();
            returnToMainScreen();
        }
        else if (extraState) {
            //Refresh store one time for 100 coins after the first purchases
            let buyMoreButton = document.querySelector(".actionButton.actionButtonGolden.storeScrollsButton");
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
        returnToMainScreen();
    }

}

async function collectQuests() {
    let questState = await getSwitchState("questSwitch");
    if (!questState) {
        return;
    }
    collectDelay = (ms) => new Promise((res) => setTimeout(res, ms));
    navItems = document.querySelectorAll(".mainNavItemText");

    navItems.forEach((navItem) => {
        if (navItem.innerText === "Quests") {
            navItem.click();
        }
    });
    await collectDelay(4000);
    const questItems = document.querySelectorAll(".questItemCont");

    questItems.forEach((questItem) => {
        const collectQuestButton = questItem.querySelector(".actionButton.actionButtonPrimary.questItemCollect");
        const isDisabled = questItem.querySelector(".questItemDisabled");
        if (collectQuestButton && !isDisabled) {
            collectQuestButton.click();
            collectQuestButton.submit();
        }
    });
    returnToMainScreen();
}

//Collect battlepass
async function collectBattlePass() {
    let questState = await getSwitchState("battlepassSwitch");
    if (!questState) {
        return;
    }
    //Get header buttons and click on Reward button
    const headerButtons = document.querySelectorAll(".actionButton.actionButtonGift");
    headerButtons.forEach((rewardButton) => {
        if (rewardButton.innerText.includes("REWARDS")) {
            rewardButton.click();
            //collect rewards if there are any
            const collectButtons = document.querySelectorAll(".actionButton.actionButtonCollect.rewardActionButton");
            for (button of collectButtons) {
                button.click();

                const confirmButtons = document.querySelectorAll(".actionButton.actionButtonPrimary");
                confirmButtons.forEach((confirm) => {
                    if (confirm.innerText.includes("CONFIRM AND COLLECT")) {
                        confirm.click();
                        confirm.submit();
                    }
                });
            }
            close();
        }
    });
}

function close() {
    const closeButton = document.querySelectorAll(".far.fa-times");
    if (closeButton.length > 0) {
        closeButton.forEach(button => {
            button.click();
        })
    }
}

//Sales and quests done, return to main screen
function returnToMainScreen() {
    navItems = document.querySelectorAll(".mainNavItemText");
    navItems.forEach(navItem => {
        if (navItem.innerText === "Battle") {
            navItem.click();
        }
    })
}