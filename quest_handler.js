const questDelay = (ms) => new Promise((res) => setTimeout(res, ms));;
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


function completeQuests(unitDrawer, unfinishedQuests) {
    if (unfinishedQuests == null || unfinishedQuests == undefined) {
        return unitDrawer
    }

    const arrayOfValidQuests = ["kill", "assist", "place", "get", "earn", "earning", "Take down", "destroy"];

    // Assuming unfinishedQuests is an array of quest strings
    const validQuests = unfinishedQuests.filter((quest) => {
        const lowerCaseQuest = quest.toLowerCase();
        return arrayOfValidQuests.some((validQuest) => lowerCaseQuest.includes(validQuest.toLowerCase()));
    });

    // Replace "Help take down" "Destroy" "Take down" and "Get X kills" full strings with "generic kill"

    // Replace word 'Earn', "Earning" with "Get"

    // Replace "Get X assists" full strings with "assists generic"

    // Remove the S from the word assists and kills.

    // Remove the number using regex as it doesn't matter.



    // Placing quests have "place", a number and the unit name
    //Put the placeable unit on the front.
    //If no unit matches it means that it's a generic Place X units in battle

    // Killing quests have "kill"
    // Put the unit capable of performing the kill on front.
    //If not units match it's either a generic kill quest or event specific quest (melee units are good at getting generic kills)

    // Assisting quests have "assist"
    // Put the unit capable of performing the assist on front.
    //If no units match it's a generic assist quest, flag bearer is the best at getting assists.



    console.log("cry")
    //Activate common, uncommon and rare units. 
    //If there is a legendary unit quest activate as well, otherwise keep as is.



    return unitDrawer
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



*/
const arrayUnitsQuest = [
    { key: "AMAZON", type: "MELEE", icon: "8AAAAASUVORK5CYII=", easyKill: false, killType: "armored", killType2: null, easyAssist: false, assistType: null, assistType2: null },
    { key: "ARCHER", type: "RANGED", icon: "FBPKAZY", easyKill: true, killType: "melee", killType2: "support", killType3: "flying", easyAssist: false, assistType: null, assistType2: null },
    { key: "ARTILLERY", type: "RANGED", icon: "3GY1DLAQ", easyKill: true, killType: "melee", killType2: "support", killType3: "flying", easyAssist: false, assistType: null, assistType2: null },
    { key: "BALLOON", type: "ASSASSIN", icon: "FOPPA6G", easyKill: false, killType: "melee", killType2: "support", easyAssist: false, assistType: null, assistType2: null },
    { key: "BARBARIAN", type: "MELEE", icon: "Y2AZRA3G", easyKill: true, killType: "armored", killType2: "support", easyAssist: false, assistType: null, assistType2: null },
    { key: "BERSERKER", type: "MELEE", icon: "BCIAAA", easyKill: true, killType: "armored", killType2: "support", easyAssist: false, assistType: null, assistType2: null },
    { key: "BLOB", type: "ARMORED", icon: "LXTAAA", easyKill: false, killType: "ranged", killType2: null, easyAssist: false, assistType: "tanking", assistType2: null },
    { key: "BOMBER", type: "RANGED", icon: "QWP8WBK", easyKill: true, killType: "melee", killType2: "support", killType3: "flying", easyAssist: false, assistType: null, assistType2: null },
    { key: "BUSTER", type: "ASSASSIN", icon: "PCCPYIHW", easyKill: false, killType: "melee", killType2: "armored", easyAssist: false, assistType: null, assistType2: null },
    { key: "CENTURION", type: "ARMORED", icon: "DUWAAA", easyKill: false, killType: "armored", killType2: null, easyAssist: false, assistType: "tanking", assistType2: null },
    { key: "FAIRY", type: "SUPPORT", icon: "FNJQA", easyKill: false, killType: null, killType2: null, easyAssist: true, assistType: "healing", assistType2: null },
    { key: "FLAG", type: "SUPPORT", icon: "KF7A", easyKill: false, killType: null, killType2: null, easyAssist: true, assistType: "buffing", assistType2: null },
    { key: "FLYING", type: "ASSASSIN", icon: "GSGE2MI", easyKill: true, killType: "flying", killType2: "melee", killType3: "support", easyAssist: false, assistType: null, assistType2: null },
    { key: "GLADIATOR", type: "MELEE", icon: "EMWA84U", easyKill: true, killType: "armored", killType2: "support", easyAssist: false, assistType: null, assistType2: null },
    { key: "HEALER", type: "SUPPORT", icon: "UY3N8", easyKill: false, killType: null, killType2: null, easyAssist: true, assistType: "healing", assistType2: null },
    { key: "LANCER", type: "MELEE", icon: "PU+OGW", easyKill: true, killType: "armored", killType2: "melee", killType3: "flying", easyAssist: false, assistType: null, assistType2: null },
    { key: "MAGE", type: "RANGED", icon: "4Q+BQML8", easyKill: true, killType: "melee", killType2: "support", killType3: "flying", easyAssist: false, assistType: null, assistType2: null },
    { key: "MONK", type: "SUPPORT", icon: "D46EKXW", easyKill: false, killType: null, killType2: null, easyAssist: false, assistType: "healing", assistType2: null },
    { key: "MUSKETEER", type: "RANGED", icon: "DL9SBC7G", easyKill: true, killType: "melee", killType2: "support", killType3: "flying", easyAssist: false, assistType: null, assistType2: null },
    { key: "NECROMANCER", type: "SUPPORT", icon: "85VI", easyKill: false, killType: "", killType2: null, easyAssist: false, assistType: null, assistType2: null },
    { key: "ORC", type: "ARMORED", icon: "VPAASGY8", easyKill: false, killType: "ranged", killType2: null, easyAssist: false, assistType: "tanking", assistType2: null },
    { key: "PALADIN", type: "ARMORED", icon: "IYUEO", easyKill: false, killType: "armored", killType2: null, easyAssist: false, assistType: "tanking", assistType2: null },
    { key: "ROGUE", type: "ASSASSIN", icon: "GRJLD", easyKill: false, killType: "melee", killType2: "support", easyAssist: false, assistType: null, assistType2: null },
    { key: "SAINT", type: "SUPPORT", icon: "PBUHPCG", easyKill: false, killType: null, killType2: null, easyAssist: true, assistType: "buffing", assistType2: null },
    { key: "SHINOBI", type: "ASSASSIN", icon: "XSCZQ", easyKill: false, killType: "", killType2: null, easyAssist: false, assistType: null, assistType2: null },
    { key: "SPY", type: "ASSASSIN", icon: "FJBDFFQ", easyKill: false, killType: null, killType2: null, easyAssist: false, assistType: null, assistType2: null },
    { key: "TANK", type: "ARMORED", icon: "XEK7HQU", easyKill: false, killType: "ranged", killType2: null, easyAssist: null, assistType: "tanking", assistType2: null },
    { key: "TEMPLAR", type: "SUPPORT", icon: "CYNUL", easyKill: false, killType: "", killType2: null, easyAssist: false, assistType: "buffing", assistType2: null },
    { key: "VAMPIRE", type: "ARMORED", icon: "BL5378", easyKill: false, killType: "ranged", killType2: "flying", easyAssist: false, assistType: "tanking", assistType2: null },
    { key: "WARBEAST", type: "MELEE", icon: "SRJSYO", easyKill: true, killType: "armored", killType2: "support", killType3: "assassin", easyAssist: false, assistType: "tanking", assistType2: null },
    { key: "WARRIOR", type: "MELEE", icon: "YTUUAHQ", easyKill: true, killType: "armored", killType2: "support", killType2: "assassin", easyAssist: false, assistType: null, assistType2: null },
  ];  

// Assassins will kill anything, but they will prioritize specific unit types over the units that are closer.
can_kill_easily = ["assassins", "ranged", "melee"]
can_assist_easily = ["flag_bearer", "support"]
can_kill_epic = ["epic_units", "buster", "epic_balloon_buster"] // Epic rogue? This is mostly a gamble as it depends on the enemy epic unit class, but certain units will actively hunt epic units.
can_kill_flying = ["epic_units", "flying_rogue", "ranged", "vampire", "lancer", "balloon_buster"]
can_kill_armored = ["buster", "melee"]
can_kill_ranged = ["assassins", "armored"] //Armored doesn't necessarily kill, but is capable of tanking the damage and if close enough get the kill.
can_kill_support = ["assassins"]

can_buff = ["flag_bearer", "saint"]
can_heal = ["healer", "monk", "templar", "fairy"]
can_tank = ["armored"]