//This file keeps track of which captains are running which special modes.

/* This function checks which captain is running dungeon, clash and duels.
If there is only one captain running the mode (one in dungeon, one in clash and one in duels),
they are saved on storage with their flag to identify their mode.
*/
async function manageCaptain(captainType, keyword) {
    //Get all captain slots contents
    const captains = document.querySelectorAll(".capSlotContent");
    //Initializes variables
    let captainName = "";
    let counter = 0;

    let captainNameFromStorage = await retrieveFromStorage(captainType);
    let multiClashSwitch;

    if (keyword == "Dungeons") {
        let dCounter = 0
        if (captains) {
            captains.forEach((captain) => {
                if (captain.innerText.includes(keyword)) {
                    dCounter += 1;
                }
            });
        }
        if (dCounter == 1) {
            captains.forEach((capSlotContent) => {
                //Gets the captain's name running the mode of interest
                if (capSlotContent.innerText.includes(keyword)) {
                    captainName += "," + capSlotContent.querySelector(".capSlotName").innerText + ",";
                }
            });
            //Saves the game mode and the captain's name on storage so they are flagged as running that mode.
            if (captainName !== "") {
                await saveToStorage(captainType, captainName);
            }
        }
    }
    if (keyword == "Clash") {
        multiClashSwitch = await retrieveFromStorage("multiClashSwitch");
    }
    //Checks what mode the captain is running and whenever a captain is running the same mode a counter is incremented. 
    if (captains) {
        captains.forEach((captain) => {
            if (captain.innerText.includes(keyword)) {
                counter += 1;
            }
        });
    }
    //If counter is one it means there is only one captain running the mode,
    if (counter === 1 || (counter > 1 && keyword == "Clash" && multiClashSwitch)) {
        captains.forEach((capSlotContent) => {
            //Gets the captain's name running the mode of interest
            if (capSlotContent.innerText.includes(keyword) && (captainNameFromStorage == null || captainNameFromStorage == "" || (keyword == "Clash" && multiClashSwitch))) {
                captainName += "," + capSlotContent.querySelector(".capSlotName").innerText + ",";
            }
        });
        //Saves the game mode and the captain's name on storage so they are flagged as running that mode.
        if (captainName !== "") {
            await saveToStorage(captainType, captainName);
        }
    }
}

//Runs the check on special game modes every 15-20 seconds.
(function loopManageDungeon() {
    setTimeout(() => {
        manageDungeon();
        loopManageDungeon();
    }, getRandNum(15, 20) * 1000);
}());

//Checks if the slots menu exists and invokes the manageCaptain function.
async function manageDungeon() {
    if (await retrieveFromStorage("paused_checkbox")) {
        return
    }
    const btView = document.querySelector(".battleView");
    if (!btView) return;

    //Invokes the manageCaptain so the captains running these modes can be flagged.
    await manageCaptain("dungeonCaptain", "Dungeons");
    await manageCaptain("clashCaptain", "Clash");
    await manageCaptain("duelCaptain", "Duel");
}