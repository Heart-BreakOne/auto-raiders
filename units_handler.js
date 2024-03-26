const unitDelay = (ms) => new Promise((res) => setTimeout(res, ms));
//Unit icons from the unit drawer (the icon on the top left corner of the unit square)
const arrUnitNms = [
    { key: "amazon", icon: "5GHK8AAAAASUVORK5CYII=", class: "legendary" },
    { key: "archer", icon: "FBPKAZY", class: "common" },
    { key: "artillery", icon: "3GY1DLAQ", class: "legendary" },
    { key: "alliesballoonbuster", icon: "FOPPA6G", class: "legendary" },
    { key: "barbarian", icon: "Y2AZRA3G", class: "uncommon" },
    { key: "berserker", icon: "BCIAAA", class: "rare" },
    { key: "blob", icon: "LXTAAA", class: "legendary" },
    { key: "bomber", icon: "QWP8WBK", class: "uncommon" },
    { key: "buster", icon: "PCCPYIHW", class: "uncommon" },
    { key: "centurion", icon: "DUWAAA", class: "rare" },
    { key: "fairy", icon: "FNJQA", class: "rare" },
    { key: "flagbearer", icon: "KF7A", class: "common" },
    { key: "flyingarcher", icon: "GSGE2MI", class: "rare" },
    { key: "gladiator", icon: "EMWA84U", class: "rare" },
    { key: "healer", icon: "UY3N8", class: "uncommon" },
    { key: "lancer", icon: "PU+OGW", class: "uncommon" },
    { key: "mage", icon: "4Q+BQML8", class: "legendary" },
    { key: "monk", icon: "D46EKXW", class: "rare" },
    { key: "musketeer", icon: "DL9SBC7G", class: "rare" },
    { key: "necromancer", icon: "85VI", class: "legendary" },
    { key: "orcslayer", icon: "VPAASGY8", class: "legendary" },
    { key: "alliespaladin", icon: "IYUEO", class: "uncommon" },
    { key: "phantom", icon: "XJQAAAABJRU5ERKJGGG==", class: "legendary" },
    { key: "rogue", icon: "GRJLD", class: "common" },
    { key: "saint", icon: "PBUHPCG", class: "uncommon" },
    { key: "shinobi", icon: "XSCZQ", class: "rare" },
    { key: "spy", icon: "FJBDFFQ", class: "legendary" },
    { key: "tank", icon: "XEK7HQU", class: "common" },
    { key: "templar", icon: "CYNUL", class: "legendary" },
    { key: "vampire", icon: "BL5378", class: "uncommon" },
    { key: "warbeast", icon: "SRJSYO", class: "legendary" },
    { key: "warrior", icon: "YTUUAHQ", class: "common" },
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

    await displayUnits(document.querySelector('input[name="slot"]:checked').value);
    
    document.getElementById("getUnits_button").addEventListener("click", async function () {
        const userOption = window.confirm("Are you sure you want to reset all unit data?");
        if (userOption) {
            await getUnits();
            await unitDelay(1000);
            await displayUnits(document.querySelector('input[name="slot"]:checked').value);
        }

    });

    document.getElementById("setUnits_button").addEventListener("click", async function () {
        await saveUnits();
        //location.reload();
        await unitDelay(1000);
        await displayUnits(document.querySelector('input[name="slot"]:checked').value);
        return;
    });

    //Function to change the displayed units when the radio button state changes
    async function handleSlotRadioButtonChange() {
        let slotOption = document.querySelector('input[name="slot"]:checked').value;
        await displayUnits(slotOption);
    }

    // Event listener for when the slot radio button is changed by the user
    let slotRadioButtons = document.querySelectorAll('input[name="slot"]');
    slotRadioButtons.forEach(function (radioButton) {
        radioButton.addEventListener("change", handleSlotRadioButtonChange);
    });

});

async function getUnits() {
    let fetchUnitsArrayList = await fetchUnits();
    let unitsArrayList = fetchUnitsArrayList.data;

    await chrome.storage.local.get(['unitList'], (result) => {
      //Add an identifier, priority indicator and removed optional data from the response
      let arrayLength = unitsArrayList.length;
      for (let i = 0; i < arrayLength; i++) {
          const item = unitsArrayList[i];
          item.index = i;
          item.priority = 0;
          item.slotOption = 0;
          delete item.cooldownTime;
          delete item.skin;
          delete item.soulId;
          delete item.soulType;
          delete item.userId;
          delete item.specializationUid;
          let unitsArrayListSlot1 = {
              index: item.index,
              level: item.level,
              priority: item.priority,
              slotOption: 1,
              unitType: item.unitType
          }
          unitsArrayList.push(unitsArrayListSlot1);
          let unitsArrayListSlot2 = {
              index: item.index,
              level: item.level,
              priority: item.priority,
              slotOption: 2,
              unitType: item.unitType
          }
          unitsArrayList.push(unitsArrayListSlot2);
          let unitsArrayListSlot3 = {
              index: item.index,
              level: item.level,
              priority: item.priority,
              slotOption: 3,
              unitType: item.unitType
          }
          unitsArrayList.push(unitsArrayListSlot3);
          let unitsArrayListSlot4 = {
              index: item.index,
              level: item.level,
              priority: item.priority,
              slotOption: 4,
              unitType: item.unitType
          }
          unitsArrayList.push(unitsArrayListSlot4);
          let unitsArrayListSlot5 = {
              index: item.index,
              level: item.level,
              priority: item.priority,
              slotOption: 5,
              unitType: item.unitType
          }
          unitsArrayList.push(unitsArrayListSlot5);
      }
      let newUnitsArrayList = [];
      for (let i = 0; i < unitsArrayList.length; i++) {
        
      }
      const storageObject = {};
      storageObject['unitList'] = unitsArrayList;

      //Save the array to Chrome's local storage
      chrome.storage.local.set(storageObject, function () {
          if (chrome.runtime.lastError) {
              console.log("failure");
          } else {
              console.log("success");
          }
      });
    });
}

async function displayUnits(slotOption) {
    await chrome.storage.local.get(['unitList'], (result) => {
        let array = [];
        if (result.unitList !== undefined) {
            for (let i = 0; i < result.unitList.length; i++) {
                if (result.unitList[i].slotOption == slotOption) {
                    array.push(result.unitList[i]);
                }
            };
        };
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
    await chrome.storage.local.get(['unitList'], (result) => {
      const slotOption = parseInt(document.querySelector('input[name="slot"]:checked').value);
      let existingUnitsExcludingSlotOption
      let array = [];
      if (result.unitList !== undefined) {
          for (let i = 0; i < result.unitList.length; i++) {
              if (result.unitList[i].slotOption !== slotOption) {
                  array.push(result.unitList[i]);
              }
          };
      };
      // Handle the retrieved data
      // if (array === undefined) {
          // return;
      // }
      if (array.length > 0) {
          existingUnitsExcludingSlotOption = array;
      }
    
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
                  index,
                  slotOption
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
      
      if (existingUnitsExcludingSlotOption !== undefined) {
          dataArray.push(...existingUnitsExcludingSlotOption);
      }
    
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
    });
}

//Sort units based on their priority
async function sortPriorityUnits(unitDrawer, slotOption, shuffleSwitch) {
    return new Promise((resolve) => {
        chrome.storage.local.get(['unitList'], (result) => {
            let array = [];
            for (let i = 0; i < result.unitList.length; i++) {
                if (result.unitList[i].slotOption == slotOption) {
                    array.push(result.unitList[i]);
                }
            };

            if (shuffleSwitch) {
                array.sort(() => Math.random() - 0.5);
                array.sort((a, b) => a.priority - b.priority);
            }

            let arrayFromStorage = array;

            if (arrayFromStorage === undefined) {
                resolve(unitDrawer);
                return;
            }

            arrayFromStorage = arrayFromStorage.filter(item => item.priority !== '0');
            let unitArray = Array.from(unitDrawer);
            const unitSize = unitArray[0].children.length;
            let tempArray = [];

            for (let i = 0; i < arrayFromStorage.length; i++) {
                let level = arrayFromStorage[i].level;
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
                    let levelFromDOM
                    try {
                        levelFromDOM = u.querySelector(".unitNormalLevel").innerText;
                    } catch {
                        levelFromDOM = 0
                        level = 0
                    }
                    if (levelFromDOM == null || levelFromDOM == undefined) {
                        levelFromDOM = 0
                        level = 0
                    }
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

async function getUnitsExcludingSlotOption(slotOption) {
    await chrome.storage.local.get(['unitList'], (result) => {
        let array = [];
        if (result.unitList !== undefined) {
            for (let i = 0; i < result.unitList.length; i++) {
                if (result.unitList[i].slotOption !== slotOption) {
                    array.push(result.unitList[i]);
                }
            };
        };
        // Handle the retrieved data
        if (array === undefined) {
            return;
        }
        if (array.length > 0) {
            return array;
        }
    });
}
