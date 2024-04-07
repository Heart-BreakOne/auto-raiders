document.addEventListener("DOMContentLoaded", async function () {

    await loadChestData()

    await loadCheckBoxData()

    document.getElementById('fetch_btn').addEventListener('click', function () {
        fetchAndSaveChestData()
    });

    document.getElementById('update_key_btn').addEventListener('click', function () {
        saveKeyCurrency()
    });

    document.getElementById('update_bone_btn').addEventListener('click', function () {
        saveBoneCurrency()
    })

    document.getElementById('chest_purchase_order').addEventListener('change', function () {
        let checkbox = document.getElementById('chest_purchase_order');
        let checkboxState = checkbox.checked;
        chrome.storage.local.set({ 'chestPurchaseOrder': checkboxState });
    });

    let checkboxes = document.querySelectorAll('.checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', async function (event) {
            let checkboxId = event.target.id;
            if (checkboxId != "chest_purchase_order") {
                let isChecked = event.target.checked;
                await updateCheckBox(checkboxId, isChecked);
            }
        });
    });

})

async function saveBoneCurrency() {
    let v = document.getElementById('min_bone_currency').value
    await chrome.storage.local.set({ 'minBoneCurrency': v });
}

async function saveKeyCurrency() {
    let v = document.getElementById('min_key_currency').value
    await chrome.storage.local.set({ 'minKeyCurrency': v });
}

async function fetchAndSaveChestData() {
    try {
        const gdUrl = await retrieveFromStorage("gameDataPath");

        // Get chests from the game data
        const response = await fetch(gdUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch game data (${response.status} ${response.statusText})`);
        }
        const gameData = await response.json();
        if (!gameData || !gameData.sheets || !gameData.sheets.Store) {
        }

        const chestsArray = Object.values(gameData.sheets.Store);

        const filterChests = (section) => {
            const filteredChests = [];
            for (let j = 0; j < chestsArray.length; j++) {
                const chest = chestsArray[j];
                const chestSection = chest["Section"];
                const availableTo = chest["AvailableTo"];
                const purchaseLimit = chest["PurchaseLimit"];

                if (chestSection === section && availableTo !== "Captain") {
                    const basePrice = chest["BasePrice"];
                    if (basePrice != -1 && purchaseLimit == -1) {
                        const liveEndTime = new Date(chest["LiveEndTime"]);
                        const currentDate = new Date();
                        const currentUTCTime = Date.UTC(
                            currentDate.getUTCFullYear(),
                            currentDate.getUTCMonth(),
                            currentDate.getUTCDate(),
                            currentDate.getUTCHours(),
                            currentDate.getUTCMinutes(),
                            currentDate.getUTCSeconds()
                        );

                        if (currentUTCTime <= liveEndTime.getTime()) {
                            filteredChests.push(chest);
                        }
                    }
                }
            }
            return filteredChests;
        };

        const freshDungeonArray = filterChests("Dungeon");
        const freshBoneArray = filterChests("Bones");

        await chrome.storage.local.set({ 'dungeonChestsData': freshDungeonArray });
        await chrome.storage.local.set({ 'boneChestsData': freshBoneArray });

        location.reload();

    } catch (error) {
        console.error('Error fetching units:', error.message);
    }
}


async function updateCurrency(key, id) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(key, function (data) {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                reject(chrome.runtime.lastError);
                return;
            }

            if (!data || Object.keys(data).length === 0) {
                resolve();
                return;
            }

            document.getElementById(id).value = data[key];
            resolve();
        });
    });
}


async function loadChestData() {
    await updateCurrency("minBoneCurrency", "min_bone_currency");
    await updateCurrency("minKeyCurrency", "min_key_currency");

    let dcd = await retrieveFromStorage("dungeonChestsData");
    let bcd = await retrieveFromStorage("boneChestsData");
    if (!dcd || !bcd) {
        return
    }
    let userChests = await retrieveFromStorage("userChests")
    let mdc = dcd.concat(bcd);
    let chestContainer = document.getElementById("chest_container");
    let table = document.createElement("table");

    let thead = document.createElement("thead");
    let headerRow = document.createElement("tr");
    let headers = ["Section", "Icon", "Uid", "Item", "BasePrice", "Max Quantity", "Amount", "Starts", "Ends", "Bought so far", "Can Buy"];
    headers.forEach(headerText => {
        let headerCell = document.createElement("th");
        headerCell.textContent = headerText;
        headerRow.appendChild(headerCell);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    let tbody = document.createElement("tbody");
    for (let i = 0; i < mdc.length; i++) {
        let item = mdc[i];
        let section = item["Section"];
        let itemUid = item["Uid"];
        let itemType = item["Item"];
        let [itemUrl, size] = await getItemUrl(itemUid, itemType);
        let cost = item["BasePrice"];
        let maxPurchase = item["PurchaseLimit"];
        let quantity = item["Quantity"];

        let amountBought = userChests[itemUid]
        if (amountBought) {
            amountBought = amountBought.amountBought
        } else {
            amountBought = 0
        }

        let utcTimeString = item["LiveStartTime"];

        let utcDate = new Date(Date.UTC(
            parseInt(utcTimeString.substring(0, 4)),
            parseInt(utcTimeString.substring(5, 7)) - 1,
            parseInt(utcTimeString.substring(8, 10)),
            parseInt(utcTimeString.substring(11, 13)),
            parseInt(utcTimeString.substring(14, 16)),
            parseInt(utcTimeString.substring(17, 19))
        ));
        let localLiveStartTime = utcDate.toLocaleString();

        utcTimeString = item["LiveEndTime"];

        utcDate = new Date(Date.UTC(
            parseInt(utcTimeString.substring(0, 4)),
            parseInt(utcTimeString.substring(5, 7)) - 1,
            parseInt(utcTimeString.substring(8, 10)),
            parseInt(utcTimeString.substring(11, 13)),
            parseInt(utcTimeString.substring(14, 16)),
            parseInt(utcTimeString.substring(17, 19))
        ));

        let localLiveEndTime = utcDate.toLocaleString();

        let row = document.createElement("tr");
        let rowData = [section, itemUid, itemUid, itemType, cost, maxPurchase, quantity, localLiveStartTime, localLiveEndTime, amountBought];
        rowData.forEach((data, index) => {
            let cell = document.createElement("td");
            if (index === 1) {
                let img = document.createElement("img");
                img.style.width = size;
                img.style.height = size;
                img.src = itemUrl;
                cell.appendChild(img);
            } else {
                cell.textContent = data;
            }
            row.appendChild(cell);
        });

        let checkboxCell = document.createElement("td");
        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";

        checkbox.classList.add("checkbox");

        checkbox.id = itemUid;
        checkboxCell.appendChild(checkbox);
        row.appendChild(checkboxCell);

        tbody.appendChild(row);
    }
    table.appendChild(tbody);

    chestContainer.appendChild(table);
}




async function getItemUrl(itemUid, itemType) {
    if (itemType === "skin") {
        let skinKey = `mobilelite/units/static/${itemUid}.png`;
        let images = await retrieveFromStorage("imageUrls");
        let result = null;

        Object.keys(images).forEach(function (key) {
            if (key.toLowerCase() === skinKey.toLowerCase()) {
                let string = "https://d2k2g0zg1te1mr.cloudfront.net/" + images[key];
                result = string;
            }
        });

        return [result, "100px"];
    } else if (itemType.includes("scroll")) {

        let result = "";
        let unitName = itemType.replace("scroll", "").trim();


        let imageURLs = await retrieveFromStorage("imageUrls");
        let currency = await retrieveFromStorage("currency")
        let item
        Object.keys(currency).forEach(function (key) {
            if (key === unitName) {
                item = currency[key].UnitAssetName;
            }
        })
        Object.keys(imageURLs).forEach(function (key) {
            if (key === "mobilelite/units/static/" + item + ".png") {
                result = "https://d2k2g0zg1te1mr.cloudfront.net/" + imageURLs[key];
            }
        })

        return [result, "100px"];
    }
    else if (itemType.includes("soulvessel")) {
        return ["https://d2k2g0zg1te1mr.cloudfront.net/mobilelite/products/soulvessel.9de886eb455e.png", "50px"]
    }
    else if (itemType === "chest") {
        if (itemUid.includes("skin")) {
            return ["https://d2k2g0zg1te1mr.cloudfront.net/mobilelite/chests/iconChestSkinBoosted.c0e0bcd2b145.png", "50px"]
        } else {
            return ["https://d2k2g0zg1te1mr.cloudfront.net/mobilelite/chests/iconChestGladiator.306cb4539906.png", "50px"]
        }
    }

    return ["/icons/unknown.png", "50px"]
}

async function updateCheckBox(checkboxId, checkBoxState) {
    let data = await chrome.storage.local.get('userChests');
    let userChests = data.userChests || {};

    if (userChests.hasOwnProperty(checkboxId)) {
        let amountBought = userChests[checkboxId].amountBought
        userChests[checkboxId] = {
            canBuy: checkBoxState,
            amountBought: amountBought
        };
    } else {
        userChests[checkboxId] = {
            canBuy: checkBoxState,
            amountBought: 0
        };
    }
    await chrome.storage.local.set({ 'userChests': userChests });
}

async function loadCheckBoxData() {

    let checkbox = document.getElementById('chest_purchase_order');

    if (checkbox) {
        let checkboxState = await retrieveFromStorage("chestPurchaseOrder")
        if (!checkboxState) {
            checkbox.checked = false
        } else {
            checkbox.checked = true
        }
    }

    let checkboxes = document.querySelectorAll('.checkbox');

    chrome.storage.local.get('userChests', function (data) {
        let userChests = data.userChests || {};

        checkboxes.forEach((checkbox) => {
            let checkboxId = checkbox.id;

            if (userChests.hasOwnProperty(checkboxId)) {
                checkbox.checked = userChests[checkboxId].canBuy;
            }
        });
    });
}