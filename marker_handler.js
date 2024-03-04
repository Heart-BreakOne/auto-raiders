
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
        if(i == 0) {
            firstPlacement = captain
        }
        let captainIcon = captain.querySelector("img").src;

        const lastSlashIndex1 = captainIcon.lastIndexOf("/");
        const lastSlashIndex2 = icon.lastIndexOf("/");

        // Find the index of the last occurrence of "."
        const lastDotIndex1 = captainIcon.lastIndexOf(".");
        const lastDotIndex2 = icon.lastIndexOf(".");

        // Extract the substring between the last dot and last slash
        captainIcon= captainIcon.substring(lastDotIndex1 + 1, lastSlashIndex1);
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

    const elementSize = captainUnit.offsetWidth;

    const divisionSize = (elementSize / 8) * 3;

    const captainTop = captainUnit.offsetTop + divisionSize;
    const captainLeft = captainUnit.offsetLeft + divisionSize;

    const reducedElementSize = (elementSize / 8) * 2;

    const sortedArray = [];

    for (let i = 0; i < arrayOfMarkers.length; i++) {
        const marker = arrayOfMarkers[i];

        const markerTop = marker.offsetTop;
        const markerLeft = marker.offsetLeft;

        const squaredDistance =
            Math.pow(markerTop - captainTop, 2) +
            Math.pow(markerLeft - captainLeft, 2) +
            Math.pow(marker.offsetWidth - reducedElementSize, 2) +
            Math.pow(marker.offsetHeight - reducedElementSize, 2);

        sortedArray.push({ marker, squaredDistance });
    }

    sortedArray.sort((a, b) => a.squaredDistance - b.squaredDistance);

    //Randomize first 10 markers to reduce misplacements and still remain near the captain.
    const itemsToRandomize = Math.min(sortedArray.length, 10);
    for (let i = itemsToRandomize - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [sortedArray[i], sortedArray[j]] = [sortedArray[j], sortedArray[i]];
    }
    return sortedArray.map(item => item.marker);

}