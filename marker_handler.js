const arrayOfUnitNames = ["AMAZON", "ARCHER", "ARTILLERY", "BALLOON", "BARBARIAN", "BERSERKER", "BLOB", "BOMBER", "BUSTER", "CENTURION", "FAIRY", "FLAG", "FLYING", "GLADIATOR", "HEALER", "LANCER", "MAGE", "MONK", "MUSKETEER", "NECROMANCER", "ORC", "PALADIN", "PHANTOM", "ROGUE", "SAINT", "SHINOBI", "SPY", "TANK", "TEMPLAR", "VAMPIRE", "WARBEAST", "WARRIOR"];

function makeMarkers() {

    const placementZones = Array.from(document.querySelectorAll(".placementAlly"));
    const mrkrs = Array.from(document.querySelectorAll(".planIcon"));
    setUpMarkers(mrkrs)

    const dimension = 96

    for (let i = 0; i < placementZones.length; i++) {
        const tile = placementZones[i];
        const numberOfMarkersX = Math.ceil(tile.offsetHeight / dimension);
        const numberOfMarkersY = Math.ceil(tile.offsetWidth / dimension);

        for (let x = 0; x < numberOfMarkersX; x++) {
            for (let y = 0; y < numberOfMarkersY; y++) {
                const proposedMarkerTop = parseFloat(tile.offsetTop + x * dimension);
                const proposedMarkerLeft = parseFloat(tile.offsetLeft + y * dimension);

                if (checkOverlapWithUnits(proposedMarkerTop, proposedMarkerLeft, dimension)) {
                    continue;
                }

                let id_string = checkOverlapWithMarkers(mrkrs, proposedMarkerTop, proposedMarkerLeft, dimension)

                if (!id_string) {
                    const imaginaryMarker = document.createElement("div");
                    imaginaryMarker.classList.add("planIcon");
                    imaginaryMarker.classList.add("custom");
                    imaginaryMarker.setAttribute("id", "VIBE");
                    imaginaryMarker.style.position = "absolute";
                    imaginaryMarker.style.top = proposedMarkerTop + "px";
                    imaginaryMarker.style.left = proposedMarkerLeft + "px";
                    imaginaryMarker.style.width = dimension + "px";
                    imaginaryMarker.style.height = dimension + "px";
                    imaginaryMarker.style.backgroundImage = "url('1EPFWIYQTQRB9OWOGAAAABJRU5ERKJGGG')";
                    //For testing uncomment
                    //imaginaryMarker.style.backgroundColor = "blue";
                    //imaginaryMarker.style.backgroundSize = "0";
                    //imaginaryMarker.style.border = "0.1px solid black";
                    const battlefieldElement = document.querySelector(".battlefield");
                    if (battlefieldElement) {
                        battlefieldElement.appendChild(imaginaryMarker);
                    }
                }

            }
        }
    }
}


function getCaptainUnit() {
    //Get ally units.
    const allUnits = Array.from(document.querySelectorAll(".allyUnit"))
    const captainUnit = document.querySelector(".captainButtonActive.captainButtonImg");
    if (captainUnit == null) {
      return;
    }
    const captainName = captainUnit.alt;
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
    for (let i = 0; i < allUnits.length; i++) {
        const captain = allUnits[i];
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
            for (let j = allUnits.length - 1; j >= 0; j--) {

                const lastUnitSize = allUnits[j].querySelector(".battleFieldUnitClickArea").offsetWidth;
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


function checkOverlapWithUnits(top, left, dimension) {
    const allUnits = Array.from(document.querySelectorAll(".battleFieldUnitClickArea"))
    for (let i = 0; i < allUnits.length; i++) {
        const unit = allUnits[i];
        const unitParent = unit.parentElement;

        const unitTop = unitParent.offsetTop + (unitParent.offsetHeight / 2) - (unit.offsetHeight / 2);
        const unitLeft = unitParent.offsetLeft + (unitParent.offsetWidth / 2) - (unit.offsetWidth / 2);

        if (
            top + dimension > unitTop &&
            left + dimension > unitLeft &&
            top < unitTop + unit.offsetHeight &&
            left < unitLeft + unit.offsetWidth
        ) {
            return true;
        }
    }

    return false;
}

function setUpMarkers(mrkrs) {

    const arrTypes = [{ key: "ARMORED", units: "BLOB#CENTURION#ORC#PALADIN#TANK#VAMPIRE" },
    { key: "ASSASSIN", units: "BALLOON#BUSTER#FLYING#PHANTOM#ROGUE#SHINOBI#SPY" },
    { key: "MELEE", units: "AMAZON#BARBARIAN#BERSERKER#GLADIATOR#LANCER#WARBEAST#WARRIOR" },
    { key: "RANGED", units: "ARCHER#ARTILLERY#BOMBER#MAGE#MUSKETEER" },
    { key: "SUPPORT", units: "FAIRY#FLAG#HEALER#NECROMANCER#MONK#SAINT#TEMPLAR" }]

    const arrBtMrkr = [
        { key: "NO", type: "NO", icon: "VYAAAAASUVORK5CYII=" },
        { key: "ARMORED", type: "ARMORED", icon: "XLAAAAAELFTKSUQMCC" },
        { key: "ASSASSIN", type: "ASSASSIN", icon: "EGAAAABJRU5ERKJGGG==" },
        { key: "MELEE", type: "MELEE", icon: "TAAAAAASUVORK5CYII=" },
        { key: "RANGED", type: "RANGED", icon: "+IAAAAAELFTKSUQMCC" },
        { key: "SUPPORT", type: "SUPPORT", icon: "YFQAAAABJRU5ERKJGGG" },
        { key: "VIBE", icon: "1EPFWIYQTQRB9OWOGAAAABJRU5ERKJGGG" },
        { key: "AMAZON", type: "MELEE", icon: "CRKB" },
        { key: "ARCHER", type: "RANGED", icon: "6QAAAABJRU5ERKJGGG==" },
        { key: "ARTILLERY", type: "RANGED", icon: "+YAAAAASUVORK5CYII=" },
        { key: "BALLOON", type: "ASSASSIN", icon: "BAAAAAASUVORK5CYII=" },
        { key: "BARBARIAN", type: "MELEE", icon: "GIAAAAAASUVORK5CYII=" },
        { key: "BERSERKER", type: "MELEE", icon: "JAAAAAAELFTKSUQMCC" },
        { key: "BLOB", type: "ARMORED", icon: "KAAAAAELFTKSUQMCC" },
        { key: "BOMBER", type: "RANGED", icon: "TWAAAAASUVORK5CYII=" },
        { key: "BUSTER", type: "ASSASSIN", icon: "OWAAAABJRU5ERKJGGG==" },
        { key: "CENTURION", type: "ARMORED", icon: "0WAAAABJRU5ERKJGGG==" },
        { key: "FAIRY", type: "SUPPORT", icon: "AUWAAAABJRU5ERKJGGG==" },
        { key: "FLAG", type: "SUPPORT", icon: "HAAAAABJRU5ERKJGGG==" },
        { key: "FLYING", type: "ASSASSIN", icon: "0AAAAASUVORK5CYII=" },
        { key: "GLADIATOR", type: "MELEE", icon: "NWAAAAASUVORK5CYII=" },
        { key: "HEALER", type: "SUPPORT", icon: "IGAAAAASUVORK5CYII=" },
        { key: "LANCER", type: "MELEE", icon: "XQAAAABJRU5ERKJGGG==" },
        { key: "MAGE", type: "RANGED", icon: "3QAAAABJRU5ERKJGGG==" },
        { key: "MONK", type: "SUPPORT", icon: "RAAAAAELFTKSUQMCC" },
        { key: "MUSKETEER", type: "RANGED", icon: "MAAAAASUVORK5CYII=" },
        { key: "NECROMANCER", type: "SUPPORT", icon: "QMAAAAAELFTKSUQMCC" },
        { key: "ORC", type: "ARMORED", icon: "OQAAAABJRU5ERKJGGG==" },
        { key: "PALADIN", type: "ARMORED", icon: "EAAAAAELFTKSUQMCC" },
        { key: "PHANTOM", type: "ASSASSIN", icon: "MLAAAAAELFTKSUQMCC" },
        { key: "ROGUE", type: "ASSASSIN", icon: "VIAAAAAELFTKSUQMCC" },
        { key: "SAINT", type: "SUPPORT", icon: "SAAAAAASUVORK5CYII=" },
        { key: "SHINOBI", type: "ASSASSIN", icon: "WAAAAABJRU5ERKJGGG==" },
        { key: "SPY", type: "ASSASSIN", icon: "N6GAAAAASUVORK5CYII=" },
        { key: "TANK", type: "ARMORED", icon: "FAAAAAELFTKSUQMCC" },
        { key: "TEMPLAR", type: "SUPPORT", icon: "VGAAAABJRU5ERKJGGG==" },
        { key: "VAMPIRE", type: "ARMORED", icon: "BAAAAAELFTKSUQMCC" },
        { key: "WARBEAST", type: "MELEE", icon: "4WAAAABJRU5ERKJGGG==" },
        { key: "WARRIOR", type: "MELEE", icon: "YIAAAAASUVORK5CYII=" },
    ];

    for (let i = 0; i < mrkrs.length; i++) {
        const mrkr = mrkrs[i];
        const backgroundImage = window.getComputedStyle(mrkr).getPropertyValue('background-image');
        for (let j = 0; j < arrBtMrkr.length; j++) {
            const icon = arrBtMrkr[j].icon;
            const key = arrBtMrkr[j].key;
            if (backgroundImage.toUpperCase().includes(icon)) {
                for (let k = 0; k < arrTypes.length; k++) {
                    if (arrTypes[k].key === key) {
                        mrkr.id = arrTypes[k].units;
                        // console.log(key);
                        break;
                    }
                }
                if (!mrkr.id) {
                    mrkr.id = key;
                }
                break;
            }
        }
    }
}


function checkOverlapWithMarkers(mrkrs, top, left, dimension) {
    for (let i = 0; i < mrkrs.length; i++) {
        const mrkr = mrkrs[i];
        const mrkrTop = parseFloat(mrkr.style.top);
        const mrkrLeft = parseFloat(mrkr.style.left);
        if (
            top + dimension > mrkrTop &&
            left + dimension > mrkrLeft &&
            top < mrkrTop + dimension &&
            left < mrkrLeft + dimension
        ) {
            return mrkr.id
        }
    }
    return false;
}

function getMapMatrix(arrayOfMarkers) {
    arrayOfMarkers = arrayOfMarkers.filter(marker => marker.id !== "NO");
    
    const captainUnit = getCaptainUnit();
    if (!captainUnit || captainUnit == null || captainUnit == undefined) {
        return arrayOfMarkers
    }

    const elementSize = captainUnit.offsetWidth;
    const divisionSize = (elementSize / 8) * 3;

    const captainTop = captainUnit.offsetTop + divisionSize;
    const captainLeft = captainUnit.offsetLeft + divisionSize;

    const reducedElementSize = (elementSize / 8) * 2;
    const sortedArray = [];

    for (let i = 0; i < arrayOfMarkers[0].length; i++) {
        const marker = arrayOfMarkers[0][i];

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

function bumpVibeMarkers(arrayOfMarkers) {
    try {
        const customMarkers = arrayOfMarkers.filter(marker => marker.classList.contains('custom'));
        const nonCustomMarkers = arrayOfMarkers.filter(marker => !marker.classList.contains('custom') && !marker.id.includes('NO'));

        if (nonCustomMarkers.length > 10) {
            return nonCustomMarkers;
        } else {
            return nonCustomMarkers.concat(customMarkers);
        }
    } catch (error) {
        return
    }
}