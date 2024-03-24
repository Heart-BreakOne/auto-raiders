
// Governor for the slot 0 so it always has a dungeon on it.
async function manageDungeonSlot() {
    let slot0 = await retrieveFromStorage("dungeonsSlot0Switch")
    let emptySlot0 = await retrieveFromStorage("dungeonsEmptySlot0Switch")

    if (!slot0) {
        return
    }

    // Attempt to clear other slots doing dungeons
    let slots = document.querySelectorAll(".capSlot")
    for (let i = 1; i < slots.length; i++) {
        let slot = slots[i];
        if (slot.innerHTML.includes("Dungeons")) {
            slot.querySelector(".fal.fa-times-square")?.click();
        }
    }
    let firstSlot = slots[0]
    if (firstSlot) {
        const closeBtn = firstSlot.querySelector(".fal.fa-times-square")

        if (!firstSlot.innerHTML.includes("Dungeons") && closeBtn) {
            closeBtn.click()
        } else if (!firstSlot.innerHTML.includes("Dungeons")) {
            chrome.storage.local.get("offlinePermission", function (data) {
                data.offlinePermission.offlineButton_1 = 0;
                chrome.storage.local.set({ "offlinePermission": data.offlinePermission });
            });
        }


    }
    firstSlot = document.querySelector(".capSlot")



}