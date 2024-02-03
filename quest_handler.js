const questDelay = (ms) => new Promise((res) => setTimeout(res, ms));

let arrayOfUnitsQuest = [
    { key: "amazon", rarity: 3, icon: "5GHK8AAAAASUVORK5CYII=", mustPlace: false, points: 0, easyKill: false, bestKill: false, killEpic: false, killType: "armored", easyAssist: false, bestAssist: false, assistType: null },
    { key: "archer", rarity: 0, icon: "FBPKAZY", mustPlace: false, points: 0, easyKill: true, bestKill: false, killEpic: false, killType: "melee,suppport,flying", easyAssist: false, bestAssist: false, assistType: null },
    { key: "artillery", rarity: 3, icon: "3GY1DLAQ", mustPlace: false, points: 0, easyKill: true, bestKill: false, killEpic: true, killType: "melee,suppport,flying", easyAssist: false, bestAssist: false, assistType: null },
    { key: "balloon", rarity: 3, icon: "FOPPA6G", mustPlace: false, points: 0, easyKill: false, bestKill: false, killEpic: true, killType: "melee", easyAssist: false, bestAssist: false, assistType: null },
    { key: "barbarian", rarity: 1, icon: "Y2AZRA3G", mustPlace: false, points: 0, easyKill: true, bestKill: false, killEpic: false, killType: "armored,support", easyAssist: false, bestAssist: false, assistType: null },
    { key: "berserker", rarity: 2, icon: "BCIAAA", mustPlace: false, points: 0, easyKill: true, bestKill: false, killEpic: false, killType: "armored", easyAssist: false, bestAssist: false, assistType: "buffing" },
    { key: "blob", rarity: 3, icon: "LXTAAA", mustPlace: false, points: 0, easyKill: false, bestKill: false, killEpic: false, killType: "ranged", easyAssist: false, bestAssist: false, assistType: "armored,tanking" },
    { key: "bomber", rarity: 1, icon: "QWP8WBK", mustPlace: false, points: 0, easyKill: true, bestKill: false, killEpic: false, killType: "melee,suppport,flying", easyAssist: false, bestAssist: false, assistType: null },
    { key: "buster", rarity: 1, icon: "PCCPYIHW", mustPlace: false, points: 0, easyKill: false, bestKill: false, killEpic: false, killType: "melee,armored", easyAssist: false, bestAssist: false, assistType: null },
    { key: "centurion", rarity: 2, icon: "DUWAAA", mustPlace: false, points: 0, easyKill: false, bestKill: false, killEpic: false, killType: "armored", easyAssist: false, bestAssist: false, assistType: "armored,tanking,buffing" },
    { key: "fairy", rarity: 2, icon: "FNJQA", mustPlace: false, points: 0, easyKill: false, bestKill: false, killEpic: false, killType: null, easyAssist: true, bestAssist: true, assistType: "generic,healing" },
    { key: "flag", rarity: 0, icon: "KF7A", mustPlace: false, points: 0, easyKill: false, bestKill: false, killEpic: false, killType: null, easyAssist: true, bestAssist: false, assistType: "generic,buffing" },
    { key: "flying", rarity: 2, icon: "GSGE2MI", mustPlace: false, points: 0, easyKill: true, bestKill: false, killEpic: false, killType: "flying", easyAssist: false, bestAssist: false, assistType: null },
    { key: "gladiator", rarity: 2, icon: "EMWA84U", mustPlace: false, points: 0, easyKill: true, bestKill: false, killEpic: false, killType: "armored,support", easyAssist: false, bestAssist: false, assistType: null },
    { key: "healer", rarity: 1, icon: "UY3N8", mustPlace: false, points: 0, easyKill: false, bestKill: false, killEpic: false, killType: null, easyAssist: true, bestAssist: false, assistType: "generic,healing" },
    { key: "lancer", rarity: 1, icon: "PU+OGW", mustPlace: false, points: 0, easyKill: true, bestKill: false, killEpic: false, killType: "armored,melee,flying", easyAssist: false, bestAssist: false, assistType: null },
    { key: "mage", rarity: 3, icon: "4Q+BQML8", mustPlace: false, points: 0, easyKill: true, bestKill: false, killEpic: false, killType: "melee,suppport,flying", easyAssist: false, bestAssist: false, assistType: null },
    { key: "monk", rarity: 2, icon: "D46EKXW", mustPlace: false, points: 0, easyKill: false, bestKill: false, killEpic: false, killType: "armored", easyAssist: false, bestAssist: false, assistType: "generic,healing" },
    { key: "musketeer", rarity: 2, icon: "DL9SBC7G", mustPlace: false, points: 0, easyKill: true, bestKill: false, killEpic: false, killType: "ranged,melee,suppport,flying", easyAssist: false, bestAssist: false, assistType: "buffing" },
    { key: "necromancer", rarity: 3, icon: "85VI", mustPlace: false, points: 0, easyKill: false, bestKill: false, killEpic: false, killType: null, easyAssist: false, bestAssist: false, assistType: "generic" },
    { key: "orc", rarity: 3, icon: "VPAASGY8", mustPlace: false, points: 0, easyKill: false, bestKill: false, killEpic: false, killType: null, easyAssist: false, bestAssist: false, assistType: "armored,tanking" },
    { key: "paladin", rarity: 1, icon: "IYUEO", mustPlace: false, points: 0, easyKill: false, bestKill: false, killEpic: false, killType: "armored", easyAssist: false, bestAssist: false, assistType: "armored,tanking" },
    { key: "rogue", rarity: 0, icon: "GRJLD", mustPlace: false, points: 0, easyKill: false, bestKill: false, killEpic: false, killType: "melee,support,ranged", easyAssist: false, bestAssist: false, assistType: null },
    { key: "saint", rarity: 1, icon: "PBUHPCG", mustPlace: false, points: 0, easyKill: false, bestKill: false, killEpic: false, killType: null, easyAssist: true, bestAssist: false, assistType: "generic" },
    { key: "shinobi", rarity: 2, icon: "XSCZQ", mustPlace: false, points: 0, easyKill: false, bestKill: false, killEpic: false, killType: "ranged,support", easyAssist: false, bestAssist: false, assistType: null },
    { key: "spy", rarity: 3, icon: "FJBDFFQ", mustPlace: false, points: 0, easyKill: false, bestKill: false, killEpic: false, killType: null, easyAssist: false, bestAssist: false, assistType: null },
    { key: "tank", rarity: 0, icon: "XEK7HQU", mustPlace: false, points: 0, easyKill: false, bestKill: false, killEpic: false, killType: null, easyAssist: false, bestAssist: false, assistType: "armored,tanking" },
    { key: "templar", rarity: 3, icon: "CYNUL", mustPlace: false, points: 0, easyKill: false, bestKill: false, killEpic: false, killType: null, easyAssist: false, bestAssist: false, assistType: "generic,buffing" },
    { key: "vampire", rarity: 1, icon: "BL5378", mustPlace: false, points: 0, easyKill: false, bestKill: false, killEpic: false, killType: "flying", easyAssist: false, bestAssist: false, assistType: "armored,tanking" },
    { key: "warbeast", rarity: 3, icon: "SRJSYO", mustPlace: false, points: 0, easyKill: true, bestKill: false, killEpic: false, killType: "armored,support,assassin", easyAssist: false, bestAssist: false, assistType: "armored,tanking" },
    { key: "warrior", rarity: 0, icon: "YTUUAHQ", mustPlace: false, points: 0, easyKill: true, bestKill: false, killEpic: false, killType: "armored,support,assassin", easyAssist: false, bestAssist: false, assistType: null },
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
        .filter((quest) =>
            validQuests.some((keyword) => quest.toLowerCase().includes(keyword.toLowerCase())) &&
            !(quest.toLowerCase().includes("level") && quest.toLowerCase().includes("unit")) &&
            !(quest.toLowerCase().includes("purchase") && quest.toLowerCase().includes("scroll"))
        )
        .map((quest) => {
            // Replace specific quest patterns
            let modifiedQuest = quest
                .replace(/Help take down|Destroy|Take down|Get \d+ kills/gi, 'generic kill')
                .replace(/Earn|Earning/gi, '')
                .replace(/Flying Rogue/gi, 'flying')
                .replace(/Balloon Buster/gi, 'balloon')
                .replace(/Get \d+ assists/gi, 'generic assist')
                .replace(/\bassists\b/g, 'assist')
                .replace(/\bkills\b/g, 'kill')
                .replace(/\d+/g, '')
                .trim();

            return modifiedQuest;
        });

    //Give points to units
    //Uncomment for testing
    //filteredQuests = ["Kill epic units", "Get 10 assists from buffing", "Get 2 assists", "Place 3 warriors", "Kill 3 armored units" ]
    arrayOfUnitsQuest.forEach(unit => {
        filteredQuests.forEach(quest => {
            const lowerCaseQuest = quest.toLowerCase();
            const lowerCaseKey = unit.key.toLowerCase();
            const pLowerCaseKey = unit.key.toLowerCase() + "s";

            // Must place units
            if (lowerCaseQuest.includes("place") && (lowerCaseQuest.includes(lowerCaseKey) || lowerCaseQuest.includes(pLowerCaseKey))) {
                unit.mustPlace = true;
                unit.points = 20;
            }
            if (lowerCaseQuest.includes("kill") && lowerCaseQuest.includes("epic") && unit.killEpic) {
                unit.mustPlace = true;
                unit.points = 20
            }

            // Kill quests
            if (unit.killType != null) {
                const killTypes = unit.killType.split(',');

                if (lowerCaseQuest.includes("kill") && killTypes.some(type => lowerCaseQuest.includes(type.trim()))) {
                    unit.points += 2;
                }
            }
            if (lowerCaseQuest.includes("kill") && unit.easyKill && unit.points != 0) {
                unit.points += 1;
            }
            if (lowerCaseQuest.includes("kill") && unit.bestKill && unit.points != 0) {
                unit.points += 1;
            }

            // Assist quests
            if (unit.assistType != null) {
                // Split unit.assistType into an array of values
                const assistTypes = unit.assistType.split(',');

                // Check if any of the assistTypes are present in lowerCaseQuest
                if (lowerCaseQuest.includes("assist") && assistTypes.some(type => lowerCaseQuest.includes(type.trim()))) {
                    unit.points += 2;
                }
            }
            if (lowerCaseQuest.includes("assist") && unit.easyAssist && unit.points != 0) {
                unit.points += 1;
            }
            if (lowerCaseQuest.includes("assist") && unit.bestAssist && unit.points != 0) {
                unit.points += 1;
            }

            // Extra point for common units.
            if (unit.points !== 0 && unit.rarity === 0) {
                unit.points += 1;
            }

        });
    });

    //Remove units that aren't useful
    arrayOfUnitsQuest = arrayOfUnitsQuest.filter(unit => unit.mustPlace || unit.points !== 0);

    //Remove legendary units that aren't useful
    arrayOfUnitsQuest = arrayOfUnitsQuest.filter(unit => !(unit.rarity === 3 && (!unit.mustPlace || unit.points === 0)));

    // Sort units based on points
    arrayOfUnitsQuest.sort((a, b) => b.points - a.points);

    // Sort units based on mustPlace = true
    arrayOfUnitsQuest.sort((a, b) => (b.mustPlace ? 1 : 0) - (a.mustPlace ? 1 : 0));

    if (arrayOfUnitsQuest.length == 0 || arrayOfUnitsQuest == null || arrayOfUnitsQuest == undefined) {
        return unitDrawer
    }


    // Filter the unit drawer
    const bkpD = unitDrawer
    let usableUnits = []

    for (var i = 0; i < unitDrawer[0].children.length; i++) {
        let child = unitDrawer[0].children[i];
        let coolDownCheck = child.querySelector('.unitItemCooldown');
        let defeatedCheck = child.querySelector('.defeatedVeil');
        let unitDisabled = child.querySelector('.unitItemDisabledOff');

        if (coolDownCheck || defeatedCheck || !unitDisabled) {
            i -= 1;
            child.remove();
            continue;
        } else {
            // Check if img.src includes the icon in arrayOfUnitsQuest
            for (var y = 0; y < arrayOfUnitsQuest.length; y++) {
                let icon = arrayOfUnitsQuest[y].icon;
                let unitClassImg = child.querySelector('.unitClass img');
                let uSrc = unitClassImg.src.toUpperCase();
                if (unitClassImg && uSrc.includes(icon)) {
                    usableUnits.push(child);
                }
            }
        }
    }

    // Sort the unit drawer
    usableUnits.sort((a, b) => {
        const iconA = arrayOfUnitsQuest.find(unit => a.querySelector('.unitClass img').src.toUpperCase().includes(unit.icon));
        const iconB = arrayOfUnitsQuest.find(unit => b.querySelector('.unitClass img').src.toUpperCase().includes(unit.icon));

        if (iconA && iconB) {
            return arrayOfUnitsQuest.indexOf(iconA) - arrayOfUnitsQuest.indexOf(iconB);
        } else {
            return 0;
        }
    });

    if (usableUnits.length == 0) {
        return bkpD
    } else {
        while (unitDrawer[0].children.length > 0) {
            unitDrawer[0].children[0].remove();
        }
        usableUnits.forEach((item) => {
            unitDrawer[0].appendChild(item);
        });
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