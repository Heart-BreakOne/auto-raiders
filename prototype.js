

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

    const allPlacers = document.querySelectorAll(".battlefieldLeaderboardRowCont");
    for (let i = 0; i < allPlacers.length; i++) {
        const row = allPlacers[i];
        if (row.querySelector(".battlefieldLeaderboardRowDisplayName").innerText === captainName) {
            icon = row.querySelector(".battlefieldLeaderboardRowUnitIconsCont .battlefieldLeaderboardRowUnitIconWrapper img").src;
            closeAll()
        }
    }

    outerLoop: for (let i = 0; i < arrayOfBattleFieldUnitClickAreas.length; i++) {
        const captain = arrayOfBattleFieldUnitClickAreas[i];
        const captainIcon = captain.querySelector("img").src;
        if (captainIcon === icon) {
            for (let j = arrayOfBattleFieldUnitClickAreas.length - 1; j >= 0; j--) {
                // Your existing code for the inner loop remains unchanged
                const lastUnitSize = arrayOfBattleFieldUnitClickAreas[j].querySelector(".battleFieldUnitClickArea").offsetWidth;
                const captainSizeForComparison = captain.querySelector(".battleFieldUnitClickArea").offsetWidth;

                // Rest of your inner loop logic
                if (lastUnitSize * 2 === captainSizeForComparison) {
                    // Found the likely captain. Stop both loops
                    captainUnit = captain;
                    break outerLoop;
                } else if (captainSizeForComparison / 2 == lastUnitSize) {
                    // Definitely not the captain, get the next unit placed
                    break;
                } else if (captainSizeForComparison === lastUnitSize) {
                    // Might be a captain, might be a player. Compare the next unit and try to make sure
                    continue;
                }
            }
        }
    }

    // Assuming captainUnit is a DOM element with top and left properties as strings with 'px' suffix
    const captainRect = captainUnit.getBoundingClientRect();
    const captainTop = captainRect.top;
    const captainLeft = captainRect.left;
    const captainWidth = captainRect.width;
    const captainHeight = captainRect.height;

    // Assuming arrayOfMarkers is an array of DOM elements with top and left properties as strings with 'px' suffix
    const sortedArray = [];

    for (let i = 0; i < arrayOfMarkers.length; i++) {
        const marker = arrayOfMarkers[i];
        const markerRect = marker.getBoundingClientRect();
        const markerTop = markerRect.top;
        const markerLeft = markerRect.left;
        const markerWidth = markerRect.width;
        const markerHeight = markerRect.height;

        // Calculate the squared distance between captainUnit and the current marker, considering sizes
        const squaredDistance = (
            Math.pow(markerTop - captainTop, 2) +
            Math.pow(markerLeft - captainLeft, 2) +
            Math.pow(markerWidth - captainWidth, 2) +
            Math.pow(markerHeight - captainHeight, 2)
        );

        // Add the marker and its squared distance to the sortedArray
        sortedArray.push({ marker, squaredDistance });
    }

    // Sort the array based on the squared distances (no square root calculation)
    sortedArray.sort((a, b) => a.squaredDistance - b.squaredDistance);

    // Extract the sorted markers from the sortedArray
    return sortedArray.map(item => item.marker);

}