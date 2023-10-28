
setInterval(manageDungeon, 5000)

async function manageDungeon() {

    const captains = document.querySelectorAll(".capSlotContent");
    let captainName = "";
    let counter = 0
    if (captains) {
        captains.forEach(captain => {
            if (captain.innerText.includes("Dungeons")) {
                counter++
            }
        })
    }

    if (counter == 1) {
        captains.forEach(capSlotContent => {
            if (capSlotContent.innerText.includes('Dungeons')) {
                captainName = capSlotContent.querySelector('.capSlotName').innerText;
            }
        });
        await saveToStorage('dungeonCaptain', captainName);
    }

    console.log("log The dungeon captain is " + await retrieveFromStorage('dungeonCaptain'));

}