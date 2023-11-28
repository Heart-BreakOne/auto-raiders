
const arrayOfUnitNames = ["AMAZON", "ARCHER", "ARTILLERY", "BALLOON", "BARBARIAN", "BERSERKER", "BLOB", "BOMBER", "BUSTER", "CENTURION", "FAIRY", "FLAG", "FLYING", "GLADIATOR", "HEALER", "LANCER", "MAGE", "MONK", "MUSKETEER", "NECROMANCER", "ORC", "PALADIN", "ROGUE", "SAINT", "SHINOBI", "SPY", "TANK", "TEMPLAR", "VAMPIRE", "WARBEAST", "WARRIOR"];
let allUnits

function setImaginaryMarkers(placementTiles) {
    allUnits = Array.from(document.querySelectorAll(".battleFieldUnitClickArea"));
    const last10Units = Array.from(allUnits).slice(-10);

    let dimension = 0;

    // Calculate the smallest dimension among the selected units
    for (let i = 0; i < last10Units.length; i++) {
        const unit = last10Units[i];
        if (!arrayOfUnitNames.includes(unit.previousSibling.alt.toUpperCase())) {
            continue;
        }
        const newDimension = unit.offsetWidth;
        if (dimension === 0 || newDimension < dimension) {
            dimension = newDimension;
        }
    }
    for (let i = 0; i < placementTiles.length; i++) {
        const tile = placementTiles[i];
        const numberOfMarkersX = Math.ceil(tile.offsetHeight / dimension); // Use height for X and round up
        const numberOfMarkersY = Math.ceil(tile.offsetWidth / dimension); // Use width for Y and round up

        for (let x = 0; x < numberOfMarkersX; x++) {
            for (let y = 0; y < numberOfMarkersY; y++) {
                // Skip bottom row and rightmost column
                if (x === numberOfMarkersX - 1 || y === numberOfMarkersY - 1) {
                    continue;
                }
                const imaginaryMarker = document.createElement("div");
                imaginaryMarker.classList.add("planIcon");
                imaginaryMarker.style.position = "absolute";

                // Calculate the position of each imaginary marker within the tile
                const markerTop = parseInt(tile.offsetTop + (x * dimension));
                const markerLeft = parseInt(tile.offsetLeft + (y * dimension));

                imaginaryMarker.style.top = markerTop + "px";
                imaginaryMarker.style.left = markerLeft + "px";
                imaginaryMarker.style.width = dimension + "px";
                imaginaryMarker.style.height = dimension + "px";
                imaginaryMarker.style.backgroundColor = "blue";
                imaginaryMarker.style.backgroundImage = "url('1EPFWIYQTQRB9OWOGAAAABJRU5ERKJGGG')";
                imaginaryMarker.style.backgroundSize = "0";
                imaginaryMarker.style.border = "2px solid black";

                // Append the imaginary marker to the element with class 'battlefield'
                const battlefieldElement = document.querySelector(".battlefield");
                if (battlefieldElement) {
                    battlefieldElement.appendChild(imaginaryMarker);
                }
            }
        }
    }

}