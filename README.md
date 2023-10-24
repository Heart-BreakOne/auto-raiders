# AutoRaiders
## Click emulator for Stream Raiders - Google Chrome extension.

##Special thanks to contributors:
Heather1209

This extension runs on the client side simulating user inputs so there's no risk of having you're account banned due to botting.

To use it you need to download this repo as a zip file, open the Google Chrome extension manager, enable dev mode and load an unpacked extension, select the zip file.<br>
The desktop version of the game uses canvas, the mobile version is built differently, this extension is built to work with the mobile version, to use it open the devtools tab and select mobile mode. Because of this it can be used on mobile chromium based browsers such as, but not limited to Kiwi.<br>
As an alternative to mobile mode via the devtools, there are browser extensions that force mobile mode.<br>
After installation, just open the game website and stay at the main menu.

#### What it does:
💰 Collects rewards.<br>
☠️ Savages defeat chests.<br>
📜 When the scroll store becomes available it buys scrolls within the first five minutes, if you're past 1hour and 30 minutes of the store refresh, buy manually. It will also refresh the store once for 100 coins. Check below to disable this feature<br>
📦 Collects quests, Quests tab only. Does not collect battle pass nor any freebies from the store. Check below to disable this feature<br><br>
⚔️ Opens battlefield.<br>
✌️ Seeks a valid marker: vibe markers, set markers and maps without markers.<br>
🫡 Selects the first available unit from the ALL list ordered by readiness or level (manually select your personal preference).<br>
☝️ Places only one unit on dungeons as keys only increase with battle quantity and more units placed increase the death toll as the levels get high hitting a point where all units are dead while the dungeon is still running <br>
🚫 If the marker is invalid, outside the ally area or if there's another ally unit on the marker, it will seek another valid marker.<br>
🛠️ Handles situations in which the loading screen or the game freeze, any warnings or errors pop-ups appear or the battle starts while trying to place a unit.<br>
💎 It doesn't place legendary units on campaign as they don't grant anything. See instructions below on how to remove this limitation.<br>
⚗️ It doesn't use potions. See instructions below to remove this limitation.<br>

### To prevent purchases from the scroll store and quest collection, comment the following line with two slashes //buyScrolls()
``` buyScrolls() ```


### To enable potions when it reaches a maximum of 100 uncomment this portion:
```
  /* Use a potion if there are 100 potions available, uncomment to enable it.
      let potions = document.getElementsByClassName("quantityText")[3].innerText;
      if (potions.includes("100 / 100")) {
      let epicButton = document.querySelector(".actionButton.actionButtonPrimary.epicButton");
      if (epicButton) {
        epicButton.click();
      }
    }
  */
```
If you would like to use a potion as soon as you have 45, use this snippet in the same place as the snippet above:
```
/* Use a potion if there are 45 potions available, uncomment to enable it.
//
let potions = document.getElementsByClassName("quantityText")[3].innerText;
if (potions.includes("100")) {
  let firstTwoDigits = parseInt(potions.slice(0, 2));
  if (firstTwoDigits >= 45) {
    let epicButton = document.querySelector(".actionButton.actionButtonPrimary.epicButton");
    if (epicButton) {
      epicButton.click();
    }
  }
}
*/
//
```
### If you would like to use legendary units, remove the following line:
```  let legendaryCheck = placeableUnit.querySelector('.unitRarityLegendary'); ```
<br><br>and the following extract<br><br>
``` legendaryCheck ||  ```

### Use the find tools (usually CTRL+F) of your editor to help you locate these snippets within the main script.

## For feedback (hit me on discord) and contributors are welcome, specially to improve the quality of the code since javascript is not my forte.

  
