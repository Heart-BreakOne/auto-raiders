
function getCaptainUnit() {
    //Get ally units.
    const arrayOfBattleFieldUnitClickAreas = Array.from(document.querySelectorAll(".allyUnit"));
    const captainName = document.querySelector(".captainButtonActive.captainButtonImg").alt;
    let icon = "";

    //Open the leaderboard
    document.querySelector(".leaderboardCont").click();

    const allPlacers = document.querySelectorAll(".battlefieldLeaderboardRowCont");
    for (let i = 0; i < allPlacers.length; i++) {
        const row = allPlacers[i];
        if (row.querySelector(".battlefieldLeaderboardRowDisplayName").innerText === captainName) {
            icon = row.querySelector(".battlefieldLeaderboardRowUnitIconsCont .battlefieldLeaderboardRowUnitIconWrapper img").src;
            const menuElements = document.querySelectorAll(".slideMenuCont.slideLeft.slideLeftOpen");
            const leaderboard = Array.from(menuElements).find(element => element.innerText.includes('Leaderboard'));
            if (leaderboard) {
                leaderboard.classList.remove('slideLeftOpen');
                leaderboard.classList.add('slideLeftClosed');
            }
            closeAll();
        }
    }

    //Get element  that has innerHTML Leaderboard
    let firstPlacement
    for (let i = 0; i < arrayOfBattleFieldUnitClickAreas.length; i++) {
        const captain = arrayOfBattleFieldUnitClickAreas[i];
        if (captain == undefined || captain == null) {
            continue
        }
        if (i == 0) {
            firstPlacement = captain
        }
        let captainIcon = captain.querySelector("img").src;

        const lastSlashIndex1 = captainIcon.lastIndexOf("/");
        const lastSlashIndex2 = icon.lastIndexOf("/");

        // Find the index of the last occurrence of "."
        const lastDotIndex1 = captainIcon.lastIndexOf(".");
        const lastDotIndex2 = icon.lastIndexOf(".");

        // Extract the substring between the last dot and last slash
        captainIcon = captainIcon.substring(lastDotIndex1 + 1, lastSlashIndex1);
        icon = icon.substring(lastDotIndex2 + 1, lastSlashIndex2);

        if (captainIcon === icon) {
            for (let j = arrayOfBattleFieldUnitClickAreas.length - 1; j >= 0; j--) {

                const lastUnitSize = arrayOfBattleFieldUnitClickAreas[j].querySelector(".battleFieldUnitClickArea").offsetWidth;
                const captainSizeForComparison = captain.querySelector(".battleFieldUnitClickArea").offsetWidth;

                // 1. Is the captain. 2. ??. 3. Rare event where someone places before the captain with the same skin as the captain
                if ((lastUnitSize * 2 === captainSizeForComparison) || (captainSizeForComparison / 2 == lastUnitSize) || (captainSizeForComparison === lastUnitSize)) {
                    return captain
                }
            }
        }
    }
    return firstPlacement
}

function getMapMatrix(captainUnit, arrayOfMarkers) {
    if (captainUnit === undefined) {
        return arrayOfMarkers;
    }

    const elementSize = captainUnit.offsetWidth;
    const divisionSize = (elementSize / 8) * 3;
    const reducedElementSize = (elementSize / 8) * 2;

    const captainTop = captainUnit.offsetTop + divisionSize;
    const captainLeft = captainUnit.offsetLeft + divisionSize;

    const sortedArray = [];

    for (const marker of arrayOfMarkers) {
        const markerTop = marker.offsetTop;
        const markerLeft = marker.offsetLeft;

        const distanceSquared =
            Math.pow(markerTop - captainTop, 2) +
            Math.pow(markerLeft - captainLeft, 2);

        const sizeSquared =
            Math.pow(marker.offsetWidth - reducedElementSize, 2) +
            Math.pow(marker.offsetHeight - reducedElementSize, 2);

        const totalSquaredDistance = distanceSquared * 1 + sizeSquared * 1;

        sortedArray.push({ marker, totalSquaredDistance });
    }

    // Randomize first 10 markers
    for (let i = 0; i < 10 && i < sortedArray.length; i++) {
        const j = Math.floor(Math.random() * (sortedArray.length - i)) + i;
        [sortedArray[i], sortedArray[j]] = [sortedArray[j], sortedArray[i]];
    }

    sortedArray.sort((a, b) => a.totalSquaredDistance - b.totalSquaredDistance);

    const first20Items = sortedArray.slice(0, 20);
    return first20Items.map(item => item.marker);
}