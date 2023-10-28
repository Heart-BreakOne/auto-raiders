
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

    captainName = "";
    counter = 0
    if (captains) {
        captains.forEach(captain => {
            if (captain.innerText.includes("Clash")) {
                counter++
            }
        })
    }

    if (counter == 1) {
        captains.forEach(capSlotContent => {
            if (capSlotContent.innerText.includes('Clash')) {
                captainName = capSlotContent.querySelector('.capSlotName').innerText;
            }
        });
        await saveToStorage('clashCaptain', captainName);
    }

    captainName = "";
    counter = 0
    if (captains) {
        captains.forEach(captain => {
            if (captain.innerText.includes("Duel")) {
                counter++
            }
        })
    }

    if (counter == 1) {
        captains.forEach(capSlotContent => {
            if (capSlotContent.innerText.includes('Duel')) {
                captainName = capSlotContent.querySelector('.capSlotName').innerText;
            }
        });
        await saveToStorage('duelCaptain', captainName);
    }

    console.log("log The dungeon captain is " + await retrieveFromStorage('dungeonCaptain'));
    console.log("log The clash captain is " + await retrieveFromStorage('clashCaptain'));
    console.log("log The duel captain is " + await retrieveFromStorage('duelCaptain'));
}