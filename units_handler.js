

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
            const headers = ['Index', 'Unit Name', 'Unit Level', 'Unit Specialization', 'Priority', 'Unit identifier'];

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

                const unitSpecializationCell = row.insertCell(3);
                if (position.specializationUid != "") {
                    unitSpecializationCell.textContent = "Specialized"
                } else {
                    unitSpecializationCell.textContent = "Not specialized"
                }


                const unitId = row.insertCell(4);
                unitId.textContent = position.index;

                const inputCell = row.insertCell(4);
                const inputSpinner = document.createElement('input');
                inputSpinner.type = 'number';
                inputSpinner.min = 0;
                inputSpinner.value = position.priority;

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
            const specializationUid = row.cells[3].textContent;
            const priority = inputNumber.value;
            const index = row.cells[5].textContent;

            const rowData = {
                unitType,
                level,
                specializationUid,
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





//Function to sort units based on priority.
async function sortPriorityUnits(unitDrawer) {
    await new Promise((resolve) => {
        chrome.storage.local.get(['unitList'], (result) => {

            let array = result.unitList;

            if (array === undefined) {
                return unitDrawer;
            }

            //Remove units that are not supposed to be used from the array.
            array = array.filter(item => item.priority !== '0');
            const unitArray = Array.from(unitDrawer);
            const unitSize = unitArray[0].children.length;
            for (let i = 0; i < array.length; i++) {
                const level = array[i].level;
                const unitType = array[i].unitType;
                const specializationUid = array[i].specializationUid

                for (let j = unitSize - 1; j >= 0; j--) {
                    const unit = unitArray[0].children[i];
                    const u = unit.querySelector(".unitItem:nth-child(1)")
                    const level = u.querySelector(".unitNormalLevel").innerText;
                    const nameIdentifier = u.querySelector('.unitClass img').getAttribute('src').slice(-50).toUpperCase();
                    const spec = u.querySelector('.unitSpecialized img').getAttribute('alt').toUpperCase();

                    
                    console.log();
                }
            }

            return unitDrawer;
        });
    });


}

