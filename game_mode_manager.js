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
    let allCaptainNames = "";
    let counter = 0;

    let captainNameFromStorage = await retrieveFromStorage(captainType);
    captainNameFromStorage = captainNameFromStorage ?? "";
    let allCaptainNameFromStorage = [];
    if (keyword != "Campaign") {
        allCaptainNameFromStorage.push(await retrieveFromStorage("campaignCaptain") ?? "");
    }
    if (keyword != "Dungeons") {
        allCaptainNameFromStorage.push(await retrieveFromStorage("dungeonsCaptain") ?? "");
    }
    if (keyword != "Clash") {
        allCaptainNameFromStorage.push(await retrieveFromStorage("clashCaptain") ?? "");
    }
    if (keyword != "Duel") {
        allCaptainNameFromStorage.push(await retrieveFromStorage("duelCaptain") ?? "");
    }

    let modeChangeSwitch = await retrieveFromStorage("modeChangeSwitch");
    let multiClashSwitch;
    if (keyword == "Clash") {
      multiClashSwitch = await retrieveFromStorage("multiClashSwitch");
    }
    //Checks what mode the captain is running and whenever a captain is running the same mode a counter is incremented. 
    if (captains) {
        captains.forEach((captain) => {
            if (keyword != "Campaign" && captain.innerText.includes(keyword)) {
                counter += 1;
            } else if (keyword == "Campaign" && !captain.innerText.includes("Clash") && !captain.innerText.includes("Duel") && !captain.innerText.includes("Dungeons") && !captain.innerText.includes("Unlocks with Battle Pass")) {
                counter += 1;
            }
        });
    }
    //If counter is one it means there is only one captain running the mode,
    if (counter === 1 || (counter > 1 && (keyword == "Campaign" || (keyword == "Clash" && multiClashSwitch)))) {
        captains.forEach((capSlotContent) => {
            if (capSlotContent.querySelector(".capSlotName") != null) {
                allCaptainNames += "," + capSlotContent.querySelector(".capSlotName").innerText + ",";
                //Gets the captain's name running the mode of interest
                if (((keyword != "Campaign" && capSlotContent.innerText.includes(keyword)) || (keyword == "Campaign" && !capSlotContent.innerText.includes("Clash") && !capSlotContent.innerText.includes("Duel") && !capSlotContent.innerText.includes("Dungeons") && !capSlotContent.innerText.includes("Unlocks with Battle Pass"))) && !captainNameFromStorage.includes(capSlotContent.querySelector(".capSlotName").innerText &&
                (modeChangeSwitch || captainNameFromStorage == null || captainNameFromStorage == "" || (keyword == "Clash" && multiClashSwitch) || (keyword == "Campaign")))) {
                    captainName += "," + capSlotContent.querySelector(".capSlotName").innerText + ",";
                }
            }
        });
        captainNameFromStorage = captainNameFromStorage.replace(",,",",");
        let allCaptainNamesArray = allCaptainNames.split(",");
        let captainNameArray = captainName.split(",");
        let captainNameFromStorageArray = captainNameFromStorage.split(",");
        if (captainNameFromStorage != "") {
            //Check if the captain names in storage are still in a slot. If not, remove it
            captainNameFromStorageArray.forEach((captain) => {
                if (captain != "") {
                    if (!allCaptainNamesArray.includes(captain)) {
                        captainNameFromStorage = captainNameFromStorage.replace(captain,"");
                    }
                }
            });
        }
        //Check if the captain exists in another mode. If not, update the storage value
        captainNameArray.forEach((captain) => {
            if (captain != "") {
                //If the captain already exists in another mode in storage, don't add the captain to this one
                for (index in allCaptainNameFromStorage) {
                    if (allCaptainNameFromStorage[index].includes(captain)) {
                        return;
                    }
                }
                //If they don't exist, add the captain to storage
                if (!captainNameFromStorageArray.includes(captain)) {
                    captainNameFromStorage += "," + captain + ",";
                }
            }
        });
        captainNameFromStorage = captainNameFromStorage.replace(",,",",").replace(",,",",");
        //Saves the game mode and the captain's name on storage so they are flagged as running that mode.
        if (captainNameFromStorage !== "") {
          await saveToStorage(captainType, captainNameFromStorage);
        }
    }
}

//Runs the check on special game modes every 15-20 seconds.
(function loopManageDungeon() {
  setTimeout( () => {
    manageDungeon();
    loopManageDungeon();  
  }, getRandNum(15, 20)*1000);
}());

//Checks if the slots menu exists and invokes the manageCaptain function.
async function manageDungeon() {
    if (await retrieveFromStorage("paused_checkbox")) {
        return
    }
    const btView = document.querySelector(".battleView");
    if (!btView) return;

    //Invokes the manageCaptain so the captains running these modes can be flagged.
    await manageCaptain("campaignCaptain", "Campaign");
    await manageCaptain("dungeonCaptain", "Dungeons");
    await manageCaptain("clashCaptain", "Clash");
    await manageCaptain("duelCaptain", "Duel");
}