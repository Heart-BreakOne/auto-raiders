const arrayOfUnitNames = ["AMAZON", "ARCHER", "ARTILLERY", "BALLOON", "BARBARIAN", "BERSERKER", "BLOB", "BOMBER", "BUSTER", "CENTURION", "FAIRY", "FLAG", "FLYING", "GLADIATOR", "HEALER", "LANCER", "MAGE", "MONK", "MUSKETEER", "NECROMANCER", "ORC", "PALADIN", "ROGUE", "SAINT", "SHINOBI", "SPY", "TANK", "TEMPLAR", "VAMPIRE", "WARBEAST", "WARRIOR"];
let allUnits;
let unitDimension;
let settingImaginaryMarker = false;

function setImaginaryMarkers(placementTiles) {
    const blockMarkers = Array.from(document.querySelectorAll(".planIcon"));
    if (blockMarkers.length !== 0) {
        blockMarkers.forEach(marker => {
            marker.classList.remove("planIcon");
            marker.classList.add("blockMarker");
        });
    }

    if (settingImaginaryMarker) {
        return;
    }
    settingImaginaryMarker = true;
    allUnits = Array.from(document.querySelectorAll(".battleFieldUnitClickArea"));
    let dimension = 0;

    for (let i = allUnits.length - 1; i >= 0; i--) {
        const unit = allUnits[i];
        let unitName = unit.previousSibling.alt;
        unitName = unitName.replace(" ", "").toUpperCase();
        if (arrayOfUnitNames.some(substring => unitName.includes(substring))) {
            const newDimension = unit.offsetWidth;
            if (dimension === 0) {
                dimension = newDimension;
            } else if (newDimension < dimension) {
                dimension = newDimension;
            }
        } else {
            continue;
        }
    }

    unitDimension = dimension;
    dimension = dimension * 1.3333333333333333;

    if (dimension === 0) {
        return;
    }

    for (let i = 0; i < placementTiles.length; i++) {
        const tile = placementTiles[i];
        const numberOfMarkersX = Math.ceil(tile.offsetHeight / dimension);
        const numberOfMarkersY = Math.ceil(tile.offsetWidth / dimension);

        for (let x = 0; x < numberOfMarkersX; x++) {
            for (let y = 0; y < numberOfMarkersY; y++) {
                const proposedMarkerTop = parseFloat(tile.offsetTop + x * dimension);
                const proposedMarkerLeft = parseFloat(tile.offsetLeft + y * dimension);

                if (checkOverlapWithUnits(proposedMarkerTop, proposedMarkerLeft, dimension) || checkOverlapWithBlockMarkers(proposedMarkerTop, proposedMarkerLeft, dimension)) {
                    continue;
                }

                const imaginaryMarker = document.createElement("div");
                imaginaryMarker.classList.add("planIcon");
                imaginaryMarker.style.position = "absolute";
                imaginaryMarker.style.top = proposedMarkerTop + "px";
                imaginaryMarker.style.left = proposedMarkerLeft + "px";
                imaginaryMarker.style.width = dimension + "px";
                imaginaryMarker.style.height = dimension + "px";
                imaginaryMarker.style.backgroundImage = "url('1EPFWIYQTQRB9OWOGAAAABJRU5ERKJGGG')";
                //For testing uncomment
                //imaginaryMarker.style.backgroundColor = "blue";
                //imaginaryMarker.style.backgroundSize = "0";
                //imaginaryMarker.style.border = "2px solid black";

                const battlefieldElement = document.querySelector(".battlefield");
                if (battlefieldElement) {
                    battlefieldElement.appendChild(imaginaryMarker);
                }
            }
        }
    }

    settingImaginaryMarker = false;
}

function checkOverlapWithUnits(top, left, dimension) {
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

function checkOverlapWithBlockMarkers(top, left, dimension) {
    const blockMarkers = Array.from(document.querySelectorAll(".blockMarker"));
    for (let i = 0; i < blockMarkers.length; i++) {
        const blockMarker = blockMarkers[i];
        const blockMarkerTop = parseFloat(blockMarker.style.top);
        const blockMarkerLeft = parseFloat(blockMarker.style.left);

        if (
            top + dimension > blockMarkerTop &&
            left + dimension > blockMarkerLeft &&
            top < blockMarkerTop + dimension &&
            left < blockMarkerLeft + dimension
        ) {
            return true;
        }
    }

    return false;
}
