document.addEventListener("DOMContentLoaded", async function () {

    await loadChestData();

    await loadDropDownMenu("rubyChestsData", "buy_one_ruby_skin");

    await initializeSwitch("chestPurchaseOrder");
    await initializeSwitch("buyAllSkins");
    await initializeSwitch("skinChestFocus");

    await loadSelects("buyThisRubyChest", "buy_one_ruby_skin");

    document.getElementById('fetch_btn').addEventListener('click', function () {
        fetchAndSaveChestData();
    });

    document.getElementById('save_btn').addEventListener('click', function () {
        savePreferences();
    });


    await loadCheckBoxData();
    // Manage chest checkboxes
    let checkboxes = document.querySelectorAll('.checkbox');

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', async function (event) {
            let checkboxId = event.target.id;
            if (checkboxId != "chestPurchaseOrder" && checkboxId != "buyAllSkins" && checkboxId != "skinChestFocus") {
                let isChecked = event.target.checked;
                await updateCheckBox(checkboxId, isChecked);
            }
        });
    });

    // Manage chest purchase order
    let numberInputs = document.querySelectorAll('.number');

    numberInputs.forEach(number => {
        number.addEventListener('change', async function () {
            await updateChestOrder(number.id, number.value);
        });
    });


});

async function savePreferences() {
    let rc = document.getElementById('min_ruby_currency').value;
    await chrome.storage.local.set({ 'minRubyCurrency': rc });

    let r_sel = document.getElementById('buy_one_ruby_skin').value;
    await chrome.storage.local.set({ 'buyThisRubyChest': r_sel });
}

async function fetchAndSaveChestData() {
    try {
        let chestsArray = await retrieveFromStorage("store");
        chestsArray = Object.values(chestsArray);
        
        const filterChests = (section) => {
            const filteredChests = [];
            for (let j = 0; j < chestsArray.length; j++) {
                const chest = chestsArray[j];
                const chestSection = chest.Section;
                const availableTo = chest.AvailableTo;
                const purchaseLimit = chest.PurchaseLimit;

                if (chestSection === section && availableTo !== "Captain") {
                    const basePrice = chest.BasePrice;
                    if (basePrice != -1 && purchaseLimit == -1) {
                        const liveEndTime = new Date(chest.LiveEndTime);
                        const currentDate = new Date();
                        const currentUTCTime = Date.UTC(
                            currentDate.getUTCFullYear(),
                            currentDate.getUTCMonth(),
                            currentDate.getUTCDate(),
                            currentDate.getUTCHours(),
                            currentDate.getUTCMinutes(),
                            currentDate.getUTCSeconds()
                        );

                        if (currentUTCTime <= liveEndTime.getTime()) filteredChests.push(chest);
                    }
                }
            }
            return filteredChests;
        };

        let freshRubyArray = filterChests("Rubies");

        let chests = await retrieveFromStorage("chests");
        let rewards = await retrieveFromStorage("chestRewardSlots");

        freshRubyArray = appendDisplayName(freshRubyArray, chests);
        freshRubyArray = appendSkins(freshRubyArray, chests, rewards);

        await chrome.storage.local.set({ 'rubyChestsData': freshRubyArray });

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
    await updateCurrency("minRubyCurrency", "min_ruby_currency");

    let rcd = await retrieveFromStorage("rubyChestsData");
    if (!rcd) return;
    let userChests = await retrieveFromStorage("userChests");
    let mdc = rcd;
    let chestContainer = document.getElementById("chest_container");
    let table = document.createElement("table");

    let thead = document.createElement("thead");
    let headerRow = document.createElement("tr");
    let headers = ["Section", "Icon", "Uid", "DisplayName", "Item", "BasePrice", "Starts", "Ends", "Bought so far", "Can Buy", "Skin Focus Order"];
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
        let section = item.Section;
        let itemUid = item.Uid;
        let itemDisplayName = item.DisplayName;
        let itemType = item.Item;
        let [itemUrl, size] = await getItemUrl(itemUid, itemType);
        let cost = item.BasePrice;

        let amountBought = 0;
        let order = -1;

        if (userChests && userChests[itemUid]) {
            const { amountBought: userAmountBought, purchaseOrder: userOrder } = userChests[itemUid];
            if (userAmountBought !== undefined) amountBought = userAmountBought;
            if (userOrder !== undefined) order = userOrder;
        }

        let utcTimeString = item.LiveStartTime;

        let utcDate = new Date(Date.UTC(
            parseInt(utcTimeString.substring(0, 4)),
            parseInt(utcTimeString.substring(5, 7)) - 1,
            parseInt(utcTimeString.substring(8, 10)),
            parseInt(utcTimeString.substring(11, 13)),
            parseInt(utcTimeString.substring(14, 16)),
            parseInt(utcTimeString.substring(17, 19))
        ));
        let localLiveStartTime = utcDate.toLocaleString();

        utcTimeString = item.LiveEndTime;

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

        let rowData = [section, itemUid, itemUid, itemDisplayName, itemType, cost, localLiveStartTime, localLiveEndTime, amountBought];
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

        let inputCell = document.createElement("td");
        let inputNumber = document.createElement("input");
        inputNumber.classList.add("number");
        inputNumber.type = "number";
        inputNumber.value = order;
        inputNumber.id = "skinFocus" + itemUid;
        inputCell.appendChild(inputNumber);
        row.appendChild(inputCell);

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
        let currency = await retrieveFromStorage("currency");
        let item;
        Object.keys(currency).forEach(function (key) {
            if (key === unitName) item = currency[key].UnitAssetName;
        });
        Object.keys(imageURLs).forEach(function (key) {
            if (key === "mobilelite/units/static/" + item + ".png") result = "https://d2k2g0zg1te1mr.cloudfront.net/" + imageURLs[key];
        });

        return [result, "100px"];
    }
    else if (itemType.includes("soulvessel")) {
        return ["https://d2k2g0zg1te1mr.cloudfront.net/mobilelite/products/soulvessel.9de886eb455e.png", "50px"];
    }
    else if (itemType === "chest") {
        if (itemUid.includes("skin")) {
            return ["https://d2k2g0zg1te1mr.cloudfront.net/mobilelite/chests/iconChestSkinBoosted.c0e0bcd2b145.png", "50px"];
        } else {
            return ["https://d2k2g0zg1te1mr.cloudfront.net/mobilelite/chests/iconChestGladiator.306cb4539906.png", "50px"];
        }
    }

    return ["/icons/unknown.png", "50px"];
}

async function loadCheckBoxData() {

    let checkbox = document.getElementById('chest_purchase_order');

    if (checkbox) {
        let checkboxState = await retrieveFromStorage("chestPurchaseOrder");
        if (!checkboxState) {
            checkbox.checked = false;
        } else {
            checkbox.checked = true;
        }
    }

    let checkboxes = document.querySelectorAll('.checkbox');

    chrome.storage.local.get('userChests', function (data) {
        let userChests = data.userChests || {};

        checkboxes.forEach((checkbox) => {
            let checkboxId = checkbox.id;

            if (userChests.hasOwnProperty(checkboxId)) checkbox.checked = userChests[checkboxId].canBuy;
        });
    });
}

async function loadDropDownMenu(key1, key2) {
    let keyChests = await retrieveFromStorage(key1);
    let key_select = document.getElementById(key2);

    key_select.innerHTML = '';

    let noneOption = document.createElement("option");
    noneOption.value = "None";
    noneOption.textContent = "None";
    key_select.appendChild(noneOption);

    for (let key in keyChests) {
        if (keyChests.hasOwnProperty(key)) {
            let uid = keyChests[key].Uid;
            let option = document.createElement("option");
            option.value = uid;
            option.textContent = uid;
            key_select.appendChild(option);
        }
    }
}

async function loadSelects(k1, k2) {
    let v = await retrieveFromStorage(k1);
    if (v) {
        let s = document.getElementById(k2);
        if (s) s.value = v;
    }
}

function appendSkins(chestArray, chestsData, rewards) {
    for (let chest of chestArray) {
        let matchingSkin = chestsData[chest.Uid];
        if (matchingSkin) {
            let slots = matchingSkin.ViewerSlots.split(",");
            for (let slotUid of slots) {
                let matchingReward = rewards[slotUid];
                if (matchingReward) {
                    let arrayOfRewards = matchingReward.RewardList.split(",");
                    for (let reward of arrayOfRewards) {
                        if (reward.toLowerCase().includes("skin")) {
                            chest.skinsLoot = chest.skinsLoot || [];
                            chest.skinsLoot.push(reward.trim());
                        }
                    }
                }
            }
        }
    }
    return chestArray;
}

function appendDisplayName(chestArray, chests) {
    for (let chest of chestArray) {
        let matchingChest = chests[chest.Uid];
        if (matchingChest) chest.DisplayName = matchingChest.DisplayName;
    }
    return chestArray;
}

async function updateCheckBox(checkboxId, checkBoxState) {
    let data = await chrome.storage.local.get('userChests');
    let userChests = data.userChests || {};

    if (userChests.hasOwnProperty(checkboxId)) {
        userChests[checkboxId] = {
            ...userChests[checkboxId],
            canBuy: checkBoxState,
        };
    } else {
        userChests[checkboxId] = {
            canBuy: checkBoxState,
            amountBought: 0
        };
    }
    await chrome.storage.local.set({ 'userChests': userChests });
}

async function updateChestOrder(id, value) {
    id = id.replace("skinFocus", "");
    let data = await chrome.storage.local.get('userChests');
    let userChests = data.userChests || {};

    if (userChests.hasOwnProperty(id)) {
        userChests[id] = {
            ...userChests[id],
            purchaseOrder: value
        };
    } else {
        userChests[id] = {
            canBuy: false,
            amountBought: 0,
            purchaseOrder: value,
        };
    }
    await chrome.storage.local.set({ 'userChests': userChests });
}