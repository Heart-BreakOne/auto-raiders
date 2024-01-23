const questDelay = (ms) => new Promise((res) => setTimeout(res, ms));

let arrayOfUnitsQuest = [
    { key: "amazon", rarity: 3, icon: "8AAAAASUVORK5CYII=", mustPlace: false, points: 0, easyKill: false, bestKill: false, killEpic: false, killType: "armored", easyAssist: false, bestAssist: false, assistType: "" },
    { key: "archer", rarity: 0, icon: "FBPKAZY", mustPlace: false, points: 0, easyKill: true, bestKill: false, killEpic: false, killType: "melee,suppport,flying", easyAssist: false, bestAssist: false, assistType: "" },
    { key: "artillery", rarity: 3, icon: "3GY1DLAQ", mustPlace: false, points: 0, easyKill: true, bestKill: false, killEpic: true, killType: "melee,suppport,flying", easyAssist: false, bestAssist: false, assistType: "" },
    { key: "balloon", rarity: 3, icon: "FOPPA6G", mustPlace: false, points: 0, easyKill: false, bestKill: false, killEpic: true, killType: "melee", easyAssist: false, bestAssist: false, assistType: "" },
    { key: "barbarian", rarity: 1, icon: "Y2AZRA3G", mustPlace: false, points: 0, easyKill: true, bestKill: false, killEpic: false, killType: "armored,support", easyAssist: false, bestAssist: false, assistType: "" },
    { key: "berserker", rarity: 2, icon: "BCIAAA", mustPlace: false, points: 0, easyKill: true, bestKill: false, killEpic: false, killType: "armored", easyAssist: false, bestAssist: false, assistType: "buffing" },
    { key: "blob", rarity: 3, icon: "LXTAAA", mustPlace: false, points: 0, easyKill: false, bestKill: false, killEpic: false, killType: "ranged", easyAssist: false, bestAssist: false, assistType: "tanking" },
    { key: "bomber", rarity: 1, icon: "QWP8WBK", mustPlace: false, points: 0, easyKill: true, bestKill: false, killEpic: false, killType: "melee,suppport,flying", easyAssist: false, bestAssist: false, assistType: "" },
    { key: "buster", rarity: 1, icon: "PCCPYIHW", mustPlace: false, points: 0, easyKill: false, bestKill: false, killEpic: false, killType: "melee,armored", easyAssist: false, bestAssist: false, assistType: "" },
    { key: "centurion", rarity: 2, icon: "DUWAAA", mustPlace: false, points: 0, easyKill: false, bestKill: false, killEpic: false, killType: "armored", easyAssist: false, bestAssist: false, assistType: "tanking,buffing" },
    { key: "fairy", rarity: 2, icon: "FNJQA", mustPlace: false, points: 0, easyKill: false, bestKill: false, killEpic: false, killType: "", easyAssist: true, bestAssist: true, assistType: "healing" },
    { key: "flag", rarity: 0, icon: "KF7A", mustPlace: false, points: 0, easyKill: false, bestKill: false, killEpic: false, killType: "", easyAssist: true, bestAssist: false, assistType: "buffing" },
    { key: "flying", rarity: 2, icon: "GSGE2MI", mustPlace: false, points: 0, easyKill: true, bestKill: false, killEpic: false, killType: "flying", easyAssist: false, bestAssist: false, assistType: "" },
    { key: "gladiator", rarity: 2, icon: "EMWA84U", mustPlace: false, points: 0, easyKill: true, bestKill: false, killEpic: false, killType: "armored,support", easyAssist: false, bestAssist: false, assistType: "" },
    { key: "healer", rarity: 1, icon: "UY3N8", mustPlace: false, points: 0, easyKill: false, bestKill: false, killEpic: false, killType: "", easyAssist: true, bestAssist: false, assistType: "healing" },
    { key: "lancer", rarity: 1, icon: "PU+OGW", mustPlace: false, points: 0, easyKill: true, bestKill: false, killEpic: false, killType: "armored,melee,flying", easyAssist: false, bestAssist: false, assistType: "" },
    { key: "mage", rarity: 3, icon: "4Q+BQML8", mustPlace: false, points: 0, easyKill: true, bestKill: false, killEpic: false, killType: "melee,suppport,flying", easyAssist: false, bestAssist: false, assistType: "" },
    { key: "monk", rarity: 2, icon: "D46EKXW", mustPlace: false, points: 0, easyKill: false, bestKill: false, killEpic: false, killType: "armored", easyAssist: false, bestAssist: false, assistType: "healing" },
    { key: "musketeer", rarity: 2, icon: "DL9SBC7G", mustPlace: false, points: 0, easyKill: true, bestKill: false, killEpic: false, killType: "ranged,melee,suppport,flying", easyAssist: false, bestAssist: false, assistType: "buffing" },
    { key: "necromancer", rarity: 3, icon: "85VI", mustPlace: false, points: 0, easyKill: false, bestKill: false, killEpic: false, killType: "", easyAssist: false, bestAssist: false, assistType: "generic" },
    { key: "orc", rarity: 3, icon: "VPAASGY8", mustPlace: false, points: 0, easyKill: false, bestKill: false, killEpic: false, killType: "", easyAssist: false, bestAssist: false, assistType: "tanking" },
    { key: "paladin", rarity: 1, icon: "IYUEO", mustPlace: false, points: 0, easyKill: false, bestKill: false, killEpic: false, killType: "armored", easyAssist: false, bestAssist: false, assistType: "tanking" },
    { key: "rogue", rarity: 0, icon: "GRJLD", mustPlace: false, points: 0, easyKill: false, bestKill: false, killEpic: false, killType: "melee,support,ranged", easyAssist: false, bestAssist: false, assistType: "" },
    { key: "saint", rarity: 1, icon: "PBUHPCG", mustPlace: false, points: 0, easyKill: false, bestKill: false, killEpic: false, killType: "", easyAssist: true, bestAssist: false, assistType: "generic" },
    { key: "shinobi", rarity: 2, icon: "XSCZQ", mustPlace: false, points: 0, easyKill: false, bestKill: false, killEpic: false, killType: "ranged,support", easyAssist: false, bestAssist: false, assistType: "" },
    { key: "spy", rarity: 3, icon: "FJBDFFQ", mustPlace: false, points: 0, easyKill: false, bestKill: false, killEpic: false, killType: "", easyAssist: false, bestAssist: false, assistType: "" },
    { key: "tank", rarity: 0, icon: "XEK7HQU", mustPlace: false, points: 0, easyKill: false, bestKill: false, killEpic: false, killType: "", easyAssist: false, bestAssist: false, assistType: "tanking" },
    { key: "templar", rarity: 3, icon: "CYNUL", mustPlace: false, points: 0, easyKill: false, bestKill: false, killEpic: false, killType: "", easyAssist: false, bestAssist: false, assistType: "buffing" },
    { key: "vampire", rarity: 1, icon: "BL5378", mustPlace: false, points: 0, easyKill: false, bestKill: false, killEpic: false, killType: "flying", easyAssist: false, bestAssist: false, assistType: "tanking" },
    { key: "warbeast", rarity: 3, icon: "SRJSYO", mustPlace: false, points: 0, easyKill: true, bestKill: false, killEpic: false, killType: "armored,support,assassin", easyAssist: false, bestAssist: false, assistType: "tanking" },
    { key: "warrior", rarity: 0, icon: "YTUUAHQ", mustPlace: false, points: 0, easyKill: true, bestKill: false, killEpic: false, killType: "armored,support,assassin", easyAssist: false, bestAssist: false, assistType: "" },
];


async function getUnfinishedQuests() {
    navItems = document.querySelectorAll(".mainNavItemText");

    //Clicks the Quests button on the nav bar
    navItems.forEach((navItem) => {
        if (navItem.innerText === "Quests") {
            navItem.click();
        }
    });
    await questDelay(4000);

    const quests = document.querySelectorAll(".questItem")
    const questsDescriptionsArray = []
    quests.forEach(quest => {
        const disabledElement = quest.querySelector(".questItemDisabled");

        if (disabledElement) {
            disabledElement.parentElement.remove();
        } else {
            const questDescriptionElement = quest.querySelector(".questItemDesc");
            const questDescription = questDescriptionElement ? questDescriptionElement.innerText : '';
            const lowerCaseDescription = questDescription.toLowerCase();

            // Filter quests that are unrelated to campaign
            if (!lowerCaseDescription.includes("pvp") && !lowerCaseDescription.includes("duels") && !lowerCaseDescription.includes("clash")) {
                questsDescriptionsArray.push(questDescription);
            }
        }
    });
    returnToMainScreen()
    if (questsDescriptionsArray.length == 0) {
        return undefined
    } else {
        return questsDescriptionsArray
    }
}


async function completeQuests(unitDrawer, unfinishedQuests) {
    if (unfinishedQuests == null || unfinishedQuests == undefined) {

        return unitDrawer
    }

    const validQuests = ["kill", "assist", "place", "get", "earn", "earning", "Take down", "destroy"];

    let filteredQuests = unfinishedQuests
        .filter((quest) => validQuests.some((keyword) => quest.toLowerCase().includes(keyword.toLowerCase())))
        .map((quest) => {
            //Replace "Help take down" "Destroy" "Take down" and "Get X kills" full strings with "generic kill"
            quest = quest.replace(/Help take down|Destroy|Take down|Get \d+ kills/gi, 'generic kill');

            //Replace words 'Earn' and "Earning" with "Get"
            quest = quest.replace(/Earn|Earning/gi, 'Get');

            //Normalize some of the units names
            quest = quest.replace(/Flying Rogue/gi, 'flying');
            quest = quest.replace(/Balloon Buster/gi, 'balloon');

            //Replace "Get X assists" with "generic assist"
            quest = quest.replace(/Get \d+ assists/gi, 'generic assist');

            //Remove the S from the words assists and kills.
            quest = quest.replace(/\bassists\b/g, 'assist').replace(/\bkills\b/g, 'kill');

            //Remove any numbers
            quest = quest.replace(/\d+/g, '');

            return quest.trim(); // Trim any leading or trailing spaces
        });

    //Give points to units
    //Uncomment for testing
    //filteredQuests = ["Kill epic units", "Get 10 assists from buffing", "Get 2 assists", "Place 3 warriors", "Kill 3 armored units" ]
    arrayOfUnitsQuest.forEach(unit => {
        filteredQuests.forEach(quest => {
            const lowerCaseQuest = quest.toLowerCase();
            const lowerCaseKey = unit.key.toLowerCase();
            const pLowerCaseKey = unit.key.toLowerCase() + "s";

            if (lowerCaseQuest.includes("place") && (lowerCaseQuest.includes(lowerCaseKey) || lowerCaseQuest.includes(pLowerCaseKey))) {
                unit.mustPlace = true;
            }
            if (lowerCaseQuest.includes("kill") && unit.easyKill) {
                unit.points += 1;
            }
            if (lowerCaseQuest.includes("kill") && unit.bestKill) {
                unit.points += 1;
            }

            if (lowerCaseQuest.includes("kill") && lowerCaseQuest.includes("epic") && unit.killEpic) {
                unit.mustPlace = true;
            }
            if (lowerCaseQuest.includes("assist") && unit.easyAssist) {
                unit.points += 1;
            }
            if (lowerCaseQuest.includes("assist") && unit.bestAssist) {
                unit.points += 1;
            }
            if (lowerCaseQuest.includes("assist") && unit.easyAssist) {
                unit.points += 1;
            }
            if (unit.points !== 0 && unit.rarity === 0) {
                unit.points += 1;
            }
            if (lowerCaseQuest.includes("kill") && unit.killType !== "" && lowerCaseQuest.includes(unit.killType.toLowerCase())) {
                unit.points += 2;
            }
            if (lowerCaseQuest.includes("assist") && unit.assistType !== "" && lowerCaseQuest.includes(unit.assistType.toLowerCase())) {
                unit.points += 3;
            }
        });
    });


    //Remove units that aren't useful
    arrayOfUnitsQuest = arrayOfUnitsQuest.filter(unit => unit.mustPlace || unit.points !== 0);

    // Sort units based on mustPlace and points
    arrayOfUnitsQuest.sort((a, b) => {
        if (a.mustPlace !== b.mustPlace) {
            return b.mustPlace - a.mustPlace;
        }
        return b.points - a.points;
    });

    if (arrayOfUnitsQuest.length == 0 || arrayOfUnitsQuest == null || arrayOfUnitsQuest == undefined) {
        return unitDrawer
    }


    // Filter and sort the unitDrawer
    const bkpD = unitDrawer
    let usableUnits = []
    for (var i = 0; i < unitDrawer[0].children.length; i++) {
        child = unitDrawer[0].children[i]
        let coolDownCheck = child.querySelector('.unitItemCooldown');
        let defeatedCheck = child.querySelector('.defeatedVeil');
        let unitDisabled = child.querySelector('.unitItemDisabledOff');

        if (coolDownCheck || defeatedCheck || !unitDisabled) {
            i -= 1
            child.remove()
            continue;
        } else {
            //Check if img.src includes the icon in arrayOfUnitsQuest
            for (var y = 0; y < arrayOfUnitsQuest.length; y++) {
                let icon = arrayOfUnitsQuest[y].icon;
                let unitClassImg = child.querySelector('.unitClass img');
                let uSrc = unitClassImg.src.toUpperCase()
                if (unitClassImg && uSrc.includes(icon)) {
                    usableUnits.push(child)
                }
            }
        }
    }

    if (usableUnits.length == 0) {
        return bkpD
    } else {
        for (var i = unitDrawer[0].children.length - 1; i >= 0; i--) {
            if (!usableUnits.includes(unitDrawer[0].children[i])) {
                unitDrawer[0].children[i].remove();
            }
        }
    }

    if (unitDrawer[0].children.length == 0 || unitDrawer[0].children == null || unitDrawer[0].children == undefined) {
        return bkpD
    } else {
        // Activate common, uncommon, rare and legendary units based on the needs.
        await setSwitchState("priorityListSwitch", false);
        for (var i = 0; i < unitDrawer[0].children.length; i++) {
            const child = unitDrawer[0].children[i];
                let rCom = child.querySelector(".unitRarityCommon")
                let rUnc = child.querySelector(".unitRarityUncommon")
                let rRar = child.querySelector(".unitRarityRare")
                let rLen = child.querySelector(".unitRarityLegendary")

            if (rCom) {
                await setSwitchState("commonSwitch", true);
            } else if (rUnc) {
                await setSwitchState("uncommonSwitch", true);
            } else if (rRar) {
                await setSwitchState("rareSwitch", true);
            } else if (rLen) {
                await setSwitchState("legendarySwitch", true);
            } else {
                await setSwitchState("legendarySwitch", false);
            }
        }
        return unitDrawer
    }
}

// Enable switches so the unit can be placed.
async function setSwitchState(switchKey, state) {
    chrome.storage.local.set({ [switchKey]: state });
    return new Promise((resolve) => {
        resolve();
    });
}

/*  List of possible quests

Place X unit_name

generic kill
Kill X flying units
Kill X armored units
Kill X support units
Kill X ranged units
Kill X epic units
Kill X event Unit

generic assist
Get X assist from buffing
Get X assist from healing
Get X assist from tanking
Get X Assist with Armored Units
if (legendaryCheck) {
    legendarySwitch = await getSwitchState("legendarySwitch");
  } else if (rareCheck) {
    rareSwitch = await getSwitchState("rareSwitch");
  } else if (uncommonCheck) {
    uncommonSwitch = await getSwitchState("uncommonSwitch");
  } else if (commonCheck) {
    commonSwitch = await getSwitchState("commonSwitch");
  }


*/