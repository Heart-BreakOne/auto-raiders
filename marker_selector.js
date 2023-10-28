//Looks and selects a valid marker for placement
const getValidMarkers = async () => {
  const markersDelay = ms => new Promise(res => setTimeout(res, ms));
    let loopIndex = 0
    await markersDelay(5000);
    let validMarker = false;
    arrayOfMarkers = document.querySelectorAll(".planIcon");
    do {
      loopIndex++
      if (arrayOfMarkers.length != 0) {
        currentMarkerKey = ""
        // The randomization of the index increased the chances of getting a valid placement.
        currentMarker = arrayOfMarkers[Math.floor(Math.random() * (arrayOfMarkers.length - 1))];
        // This bit gets the marker type for comparison later
        const regex = /__reactInternalInstance\$[a-zA-Z0-9]+/;
        const matchedProperty = Object.keys(currentMarker).find(prop => regex.test(prop));
        currentMarkerKey = currentMarker[matchedProperty].key;
      }
  
      //If there are no markers, waits 45 seconds for captain to place markers, if any.
      if (arrayOfMarkers.length === 0) {
        const clockElement = document.querySelector('.battlePhaseTextClock .clock');
        if (clockElement == null) {
          return
        }
        const timeText = clockElement.innerText.replace(':', '');
        const time = parseInt(timeText, 10);
        if (time > 2915) {
          goHome()
          return;
        } else {
          const arrayOfAllyPlacement = document.querySelectorAll(".placementAlly");
          currentMarker = arrayOfAllyPlacement[Math.floor(Math.random() * arrayOfAllyPlacement.length)];
          validMarker = true;
          moveScreenRandomPosition();
        }
      } else {
        //If it's a block marker, get a new marker, if vibe or unit type place.
        if (currentMarkerKey.includes("NoPlacement")) {
          if (loopIndex >= 4000) {
            goHome()
            return;
          } else {
            continue;
          }
        } else {
          markerKeySliced = currentMarkerKey.slice(0, currentMarkerKey.indexOf("-"));
          for (let i = 0; i < arrayOfUnits.length; i++) {
            loopIndex++
            if (loopIndex >= 4000) {
              goHome()
              return;
            }
            const element = arrayOfUnits[i];
            if (markerKeySliced === element.key || markerKeySliced === element.type) {
              validMarker = true;
              moveScreenCenter();
              break;
            }
          }
        }
      }
      if (loopIndex >= 4000) {
        goHome()
        return;
      }
    } while (!validMarker);
  }
  