
// Governor for the slot 0 so it always has a dungeon on it.
async function manageDungeonSlot() {
    let slot0 = await retrieveFromStorage("dungeonsSlot0Switch")
    let emptySlot0 = await retrieveFromStorage("dungeonsEmptySlot0Switch")

    if (!slot0) {
        return
    }
    
}