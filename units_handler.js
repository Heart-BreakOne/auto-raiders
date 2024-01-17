//Unit icons markers (the icon on the top left corner of the unit square)
const arrUnitNms = [
    { key: "amazon", icon: "8AAAAASUVORK5CYII=" },
    { key: "archer", icon: "FBPKAZY" },
    { key: "artillery", icon: "3GY1DLAQ" },
    { key: "alliesballoonbuster", icon: "FOPPA6G" },
    { key: "barbarian", icon: "Y2AZRA3G" },
    { key: "berserker", icon: "BCIAAA" },
    { key: "blob", icon: "LXTAAA" },
    { key: "bomber", icon: "QWP8WBK" },
    { key: "buster", icon: "PCCPYIHW" },
    { key: "centurion", icon: "DUWAAA" },
    { key: "fairy", icon: "FNJQA" },
    { key: "flagbearer", icon: "KF7A" },
    { key: "flyingarcher", icon: "GSGE2MI" },
    { key: "gladiator", icon: "EMWA84U" },
    { key: "healer", icon: "UY3N8" },
    { key: "lancer", icon: "PU+OGW" },
    { key: "mage", icon: "4Q+BQML8" },
    { key: "monk", icon: "D46EKXW" },
    { key: "musketeer", icon: "DL9SBC7G" },
    { key: "necromancer", icon: "85VI" },
    { key: "orcslayer", icon: "VPAASGY8" },
    { key: "alliespaladin", icon: "IYUEO" },
    { key: "rogue", icon: "GRJLD" },
    { key: "saint", icon: "PBUHPCG" },
    { key: "shinobi", icon: "XSCZQ" },
    { key: "spy", icon: "FJBDFFQ" },
    { key: "tank", icon: "XEK7HQU" },
    { key: "templar", icon: "CYNUL" },
    { key: "vampire", icon: "BL5378" },
    { key: "warbeast", icon: "SRJSYO" },
    { key: "warrior", icon: "YTUUAHQ" },
];
document.addEventListener("DOMContentLoaded", async function () {

    const scrollToTopBtn = document.getElementById("scrollBtn");

    // Show or hide the button based on scroll position
    window.onscroll = function () {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            scrollToTopBtn.style.display = "block";
        } else {
            scrollToTopBtn.style.display = "none";
        }
    };

    // Scroll back to the top when the button is clicked
    scrollToTopBtn.addEventListener("click", function () {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    });

    await displayUnits();

    document.getElementById("getUnits_button").addEventListener("click", async function () {
        const userOption = window.confirm("Are you sure you want to reset all unit data?");
        if (userOption) {
            await getUnits();
            await displayUnits();
        }

    });

    document.getElementById("setUnits_button").addEventListener("click", async function () {
        await saveUnits();
        location.reload();
    });

});


const contport = chrome.runtime.connect({ name: "content-script" });

async function getUnits() {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error('Timeout while waiting for response'));
        }, 8000);

        const responseListener = (response) => {
            clearTimeout(timeout);
            // Handle the response (true/false)
            if (response !== undefined) {
                let unitsArrayList = response.response.data;
                //Add an indentifier, priority indicator and removed unrequired data from the response
                for (let i = 0; i < unitsArrayList.length; i++) {
                    const item = unitsArrayList[i];
                    item.index = i;
                    item.priority = 0;
                    delete item.cooldownTime;
                    delete item.skin;
                    delete item.soulId;
                    delete item.soulType;
                    delete item.userId;
                    delete item.specializationUid;
                }
                const storageObject = {};
                storageObject['unitList'] = unitsArrayList;

                //Save the array to Chrome's local storage
                chrome.storage.local.set(storageObject, function () {
                    if (chrome.runtime.lastError) {
                        resolve(false);
                    } else {
                        resolve(false);
                    }
                });

                resolve(unitsArrayList.data);
            } else {
                reject(new Error('Invalid response format from background script'));
            }
        };

        contport.onMessage.addListener(responseListener);

        contport.postMessage({ action: "getUnits" });
    });
}

async function displayUnits() {
    await chrome.storage.local.get(['unitList'], (result) => {
        const array = result.unitList;
        // Handle the retrieved data
        if (array === undefined) {
            return;
        }
        if (array.length > 0) {
            let table = document.querySelector("#tableOfUnits")
            if (table) {
                table.remove();
            }
            table = document.createElement('table');
            table.id = "tableOfUnits"

            const headerRow = table.insertRow(0);
            const headers = ['Index', 'Unit Name', 'Unit Level', 'Priority', 'Unit identifier'];

            headers.forEach((headerText) => {
                const headerCell = headerRow.insertCell();
                headerCell.textContent = headerText;
            });

            for (let i = 0; i < array.length; i++) {
                const position = array[i];
                const row = table.insertRow(i + 1);

                const cellIndex = row.insertCell(0);
                cellIndex.textContent = i + 1;

                const unitNameCell = row.insertCell(1);
                unitNameCell.textContent = position.unitType;

                const unitLevelCell = row.insertCell(2);
                unitLevelCell.textContent = position.level;

                const inputCell = row.insertCell(3);
                const inputSpinner = document.createElement('input');
                inputSpinner.type = 'number';
                inputSpinner.min = 0;
                inputSpinner.value = position.priority;

                const unitId = row.insertCell(4);
                unitId.textContent = position.index;

                inputSpinner.id = `${i}`;

                inputCell.appendChild(inputSpinner);
            }

            const unitsTableContainer = document.getElementById('unitTableContainer');
            unitsTableContainer.appendChild(table);
        }
    });
}


//Save the units after the user edited them.
async function saveUnits() {
    const table = document.getElementById('tableOfUnits');

    let dataArray = [];
    let zeroArray = [];
    try {
        for (let i = 0; i < table.rows.length; i++) {
            const row = table.rows[i + 1];
            const inputNumber = document.getElementById(`${i}`);

            const unitType = row.cells[1].textContent;
            const level = row.cells[2].textContent;
            const priority = inputNumber.value;
            const index = row.cells[4].textContent;

            const rowData = {
                unitType,
                level,
                priority,
                index
            };
            if (priority === '0') {
                zeroArray.push(rowData)
            } else {
                dataArray.push(rowData);
            }

        }
    } catch (error) {
    }

    dataArray.sort((a, b) => a.priority - b.priority);
    dataArray.push(...zeroArray);
    const storageObject = {};
    storageObject['unitList'] = dataArray;

    //Save the array to Chrome's local storage
    chrome.storage.local.set(storageObject, function () {
        if (chrome.runtime.lastError) {
            console.log("failure");
        } else {
            console.log("success");
        }
    });
}

//Sort units based on their priority
async function sortPriorityUnits(unitDrawer) {
    return new Promise((resolve) => {
        chrome.storage.local.get(['unitList'], (result) => {
            let arrayFromStorage = result.unitList;

            if (arrayFromStorage === undefined) {
                resolve(unitDrawer);
                return;
            }

            arrayFromStorage = arrayFromStorage.filter(item => item.priority !== '0');
            let unitArray = Array.from(unitDrawer);
            const unitSize = unitArray[0].children.length;
            let tempArray = [];

            for (let i = 0; i < arrayFromStorage.length; i++) {
                const level = arrayFromStorage[i].level;
                let unitType = arrayFromStorage[i].unitType;

                for (let j = 0; j < arrUnitNms.length; j++) {
                    if (unitType === arrUnitNms[j].key) {
                        unitType = arrUnitNms[j].icon;
                        break;
                    }
                }

                for (let j = unitSize - 1; j >= 0; j--) {
                    const unit = unitArray[0].children[j];
                    const u = unit.querySelector(".unitItem:nth-child(1)");
                    const levelFromDOM = u.querySelector(".unitNormalLevel").innerText;
                    const unitTypeFromDOM = u.querySelector('.unitClass img').getAttribute('src').slice(-50).toUpperCase();

                    if (unitTypeFromDOM.includes(unitType) && level === levelFromDOM) {
                        tempArray.push(unitArray[0].children[j]);
                    }
                }
            }

            while (unitArray[0].children.length > 0) {
                unitArray[0].children[0].remove();
            }

            tempArray.forEach((item) => {
                unitArray[0].appendChild(item);
            });

            resolve(unitArray);
        });
    });
}
