

function getMapMatrix(arrayOfMarkers) {
    //arrayOfMarkers holds the vibe and set markers.

    //Get captain units.
    //Get ally units.
    const arrayOfBattleFieldUnitClickAreas = Array.from(document.querySelectorAll(".allyUnit"));
    const captainName = document.querySelector(".captainButtonActive.captainButtonImg").alt;
    let captainUnit;
    let icon = "";

    //Open leaderboard
    document.querySelector(".leaderboardCont").click();
    //Look for skinned units here

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
    outerLoop: for (let i = 0; i < arrayOfBattleFieldUnitClickAreas.length; i++) {
        const captain = arrayOfBattleFieldUnitClickAreas[i];
        const captainIcon = captain.querySelector("img").src;
        if (captainIcon === icon) {
            for (let j = arrayOfBattleFieldUnitClickAreas.length - 1; j >= 0; j--) {

                const lastUnitSize = arrayOfBattleFieldUnitClickAreas[j].querySelector(".battleFieldUnitClickArea").offsetWidth;
                const captainSizeForComparison = captain.querySelector(".battleFieldUnitClickArea").offsetWidth;

                if (lastUnitSize * 2 === captainSizeForComparison) {
                    captainUnit = captain;
                    break outerLoop;
                } else if (captainSizeForComparison / 2 == lastUnitSize) {

                    break;
                } else if (captainSizeForComparison === lastUnitSize) {
                    continue;
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