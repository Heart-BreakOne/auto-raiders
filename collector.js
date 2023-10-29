//Buy scrolls from the store and quest collection.
//To disable both features comment   buyScrolls()     at the main script.js. See below how to disable them individually

async function collect() {
    const collectDelay = ms => new Promise(res => setTimeout(res, ms));
    //Get navMenuItems
    let navItems = document.querySelectorAll('.mainNavItemText');

    //Gets the current UTC time as the scroll store is only available at the following times: 00:00, 06:00, 12:00 and 18:00
    const now = new Date();
    const timeString = now.getUTCHours().toString().padStart(2, '0') + now.getUTCMinutes().toString().padStart(2, '0');
    const currentTime = parseInt(timeString, 10);

    //Check if the scroll store is available
    const timeRanges = [
        { start: 1, end: 130 },
        { start: 601, end: 730 },
        { start: 1201, end: 1330 },
        { start: 1801, end: 1930 }
    ];
    let inRange = false;
    for (const range of timeRanges) {
        if (currentTime >= range.start && currentTime < range.end) {
            inRange = true;
            break;
        }
    }

    //Uncomment the following to disable the scroll shop -> Sets inRange time to always be false and never triggers the store 
    //inRange = false

    //Check time to buy scroll
    if (inRange) {
        navItems.forEach(navItem => {
            if (navItem.innerText === "Store") {
                navItem.click();
            }
        })
        //Click on scroll shop buttons if it hasnt been done already
        await collectDelay(4000)
        let buyScrollButtons = document.querySelectorAll(".actionButton.actionButtonGolden.actionButtonShiny.userStoreItemButton")
        if (buyScrollButtons.length > 0) {
            buyScrollButtons.forEach(buyButton => {
                buyButton.click();
            })
            returnToMainScreen()
        }
        else {
            //Refresh store one time for 100 coins after the first purchases 
            /*
            const buyMoreButton = document.querySelector(".actionButton.actionButtonGolden.storeScrollsButton");
            if (buyMoreButton) {
                const buttonText = buyMoreButton.innerText;
                if (buttonText.includes("REFRESH NOW") && buttonText.includes("100")) {
                    buyMoreButton.click();
                    buyMoreButton.submit();
                }
            } */
            returnToMainScreen()
        }
    } else {
        returnToMainScreen()
    }

    //Uncomment the following line to disable quest collection
    //return;


    //Constantly checks for quests are there can be a quest at any moment.
    //Click quests for collection
    navItems.forEach(navItem => {
        if (navItem.innerText === "Quests") {
            navItem.click();
        }
    })
    //Collect quests here
    await collectDelay(4000)
    const questItems = document.querySelectorAll('.questItemCont');

    questItems.forEach(questItem => {
        const collectQuestButton = questItem.querySelector('.actionButton.actionButtonPrimary.questItemCollect');
        const isDisabled = questItem.querySelector('.questItemDisabled');
        if (collectQuestButton && !isDisabled) {
            collectQuestButton.click();
            collectQuestButton.submit();
        }
    });
    returnToMainScreen()

    //Get header buttons and click on Reward button
    const headerButtons = document.querySelectorAll(".actionButton.actionButtonGift");
    headerButtons.forEach(rewardButton => {
        if (rewardButton.innerText.includes("REWARDS")) {
            rewardButton.click
            //collect rewards if there are any
            const collectButtons = document.querySelectorAll(".actionButton.actionButtonCollect.rewardActionButton");
            for (button of collectButtons) {
                button.click();

                const confirmButtons = document.querySelectorAll(".actionButton.actionButtonPrimary");
                confirmButtons.forEach(confirm => {
                    if (confirm.innerText.includes("CONFIRM AND COLLECT")) {
                        confirm.click();
                        confirm.submit();
                    }
                });

            }
            const closeButton = document.querySelector(".far.fa-times");
            if (closeButton) {
                closeButton.click();
                const event = new Event('mouseup', { bubbles: true, cancelable: true });
                closeButton.dispatchEvent(event);
            }
        }
    });
}

//Sales and quests done, return to main screen
function returnToMainScreen() {
    navItems = document.querySelectorAll('.mainNavItemText');
    navItems.forEach(navItem => {
        if (navItem.innerText === "Battle") {
            navItem.click();
        }
    })
}
