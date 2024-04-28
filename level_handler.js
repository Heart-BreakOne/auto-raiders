async function getUnitAmountData() {
    let n = 6;
    try {
        if (await retrieveFromStorage("levelSwitch")) {
            let mapDifficulty = document.querySelector(".mapInfoDifficulty").innerText.split(":")[1].trim();
            let unitQty;
            switch (mapDifficulty) {
                case "Very Easy":
                case "Easy":
                    unitQty = await retrieveNumberFromStorage("veInput");
                    break;
                case "Moderate":
                    unitQty = await retrieveNumberFromStorage("mInput");
                    break;
                case "Hard":
                    unitQty = await retrieveNumberFromStorage("hInput");
                    break;
                case "Very Hard":
                    unitQty = await retrieveNumberFromStorage("vhInput");
                    break;
                case "Insane":
                    unitQty = await retrieveNumberFromStorage("iInput");
                    break;
                case "Extreme Boss":
                    unitQty = await retrieveNumberFromStorage("ebInput");
                    break;
                case "Boss":
                    unitQty = await retrieveNumberFromStorage("bInput");
                    break;
                default:
                    unitQty = n;
            }
            if (unitQty >= 1 && unitQty <= 6) n = unitQty;
        } else if (await retrieveFromStorage("chestSwitch")) {
            let chestType = document.querySelector(".mapInfoRewardsName").innerText;
            let unitQty;
            switch (chestType) {
                case "Bronze Chest":
                    unitQty = await retrieveNumberFromStorage("bronzeInput");
                    break;
                case "Silver Chest":
                    unitQty = await retrieveNumberFromStorage("silverInput");
                    break;
                case "Gold Chest":
                    unitQty = await retrieveNumberFromStorage("goldInput");
                    break;
                case "Loyalty Gold Chest":
                    unitQty = await retrieveNumberFromStorage("lGoldInput");
                    break;
                case "Loyalty Token Chest":
                    unitQty = await retrieveNumberFromStorage("lTokenInput");
                    break;
                case "Loyalty Scroll Chest":
                    unitQty = await retrieveNumberFromStorage("lScrollInput");
                    break;
                case "Loyalty Skin Chest":
                    unitQty = await retrieveNumberFromStorage("lSkinInput");
                    break;
                case "Loyalty Super Boss Chest":
                    unitQty = await retrieveNumberFromStorage("sBossInput");
                    break;
                case "Loyalty Boss Chest":
                    unitQty = await retrieveNumberFromStorage("BossInput");
                    break;
                default:
                    unitQty = n;
            }
            if (unitQty >= 1 && unitQty <= 6) n = unitQty;
        }
        return n;
    } catch (error) {
        return 6;
    }
}