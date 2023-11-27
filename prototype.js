

function getMapMatrix(arrayOfMarkers) {
    //arrayOfMarkers holds the vibe and set markers.

    //Get captain units.
    //Get ally units.
    const arrayOfBattleFieldUnitClickAreas = Array.from(document.querySelectorAll(".allyUnit"));
    const captainName = document.querySelector(".captainButtonActive.captainButtonImg").alt;
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


    const createTwoDimensionalArray = (elements) => {
        const firstElement = elements[0];
        const firstElementStyle = window.getComputedStyle(firstElement);
        const defaultWidth = parseInt(firstElementStyle.width) / 2;
        const defaultHeight = parseInt(firstElementStyle.height) / 2;
        const centerTop = parseInt(firstElementStyle.top) + defaultHeight;
        const centerLeft = parseInt(firstElementStyle.left) + defaultWidth;


        let centerElementIndex = null;

        const twoDimensionalArray = elements.map((element, index) => {
            const elementStyle = window.getComputedStyle(element);

            const isDoubleSize = (
                parseInt(elementStyle.width) === parseInt(firstElementStyle.width) &&
                parseInt(elementStyle.height) === parseInt(firstElementStyle.height)
            );

            const width = isDoubleSize ? parseInt(elementStyle.width) : defaultWidth;
            const height = isDoubleSize ? parseInt(elementStyle.height) : defaultHeight;

            const displacementTop = parseInt(elementStyle.top) - centerTop;
            const displacementLeft = parseInt(elementStyle.left) - centerLeft;

            if (Math.abs(displacementTop) < 1 && Math.abs(displacementLeft) < 1) {
                centerElementIndex = index;
            }

            return { width, height, top: displacementTop, left: displacementLeft };
        });

        return twoDimensionalArray;
    };

    const finalArray = createTwoDimensionalArray(arrayOfBattleFieldUnitClickAreas.concat(arrayOfMarkers));

    console.log(finalArray);

    console.log();
}