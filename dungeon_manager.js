async function manageCaptain(captainType, keyword) {
    const captains = document.querySelectorAll(".capSlotContent");
    let captainName = "";
    let counter = 0;

    if (captains) {
        captains.forEach(captain => {
            if (captain.innerText.includes(keyword)) {
                counter++;
            }
        });
    }

    if (counter === 1) {
        captains.forEach(capSlotContent => {
            if (capSlotContent.innerText.includes(keyword)) {
                captainName = capSlotContent.querySelector('.capSlotName').innerText;
            }
        });
        await saveToStorage(captainType, captainName);
    }
}

setInterval(manageDungeon, 5000);

async function manageDungeon() {
    await manageCaptain('dungeonCaptain', 'Dungeons');
    await manageCaptain('clashCaptain', 'Clash');
    await manageCaptain('duelCaptain', 'Duel');
}