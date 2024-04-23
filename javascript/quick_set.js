document.addEventListener("DOMContentLoaded", async function () {

    //Opens the popup
    document.getElementById("quickSet_button").addEventListener("click", async function () {
        const popup = document.getElementById('popup');
        const all_inputs = document.querySelectorAll(".quick_set_input");
        all_inputs.forEach((input, index) => {
            input.value = "";
            if (index < 5) input.value = "-1";
        });
        popup.style.display = 'block';

    });

    document.getElementById("loadUnitFileBtn").addEventListener("change", async function () {
        importUnitsFromFile();
    });

    document.getElementById("exportUnits_button").addEventListener("click", async function () {
        exportUnitsToFile();
    });

    //Closes the popup
    document.getElementById("closeBtn").addEventListener("click", async function () {
        const popup = document.getElementById('popup');
        popup.style.display = 'none';
    });

    //Save the presets to a file
    document.getElementById("savePreSetBtn").addEventListener("click", async function () {
        savePresetToFile();
    });

    //Set the presets
    document.getElementById("setBtn").addEventListener("click", async function () {
        setPresets();
        const popup = document.getElementById('popup');
        popup.style.display = 'none';
    });

    //Load presets from a file
    document.getElementById('loadPreSetBtn').addEventListener('change', function () {
        const fileInput = document.getElementById("loadPreSetBtn");
        const file = fileInput.files[0];
        loadPresetFromFile(file);
    });

    //Clear all inputs
    document.getElementById('clearPresetBtn').addEventListener('click', function () {
        const a = document.querySelectorAll(".quick_set_input");
        a.forEach(input => {
            input.value = "";
        });
    });

    //Quick sets.
    //Save
    document.getElementById('savePreset1Btn').addEventListener('click', function () {
        saveQuickSet("quickSetOne");
    });

    document.getElementById('savePreset2Btn').addEventListener('click', function () {
        saveQuickSet("quickSetTwo");
    });

    document.getElementById('savePreset3Btn').addEventListener('click', function () {
        saveQuickSet("quickSetThree");
    });

    document.getElementById('savePreset4Btn').addEventListener('click', function () {
        saveQuickSet("quickSetFour");
    });

    document.getElementById('savePreset5Btn').addEventListener('click', function () {
        saveQuickSet("quickSetFive");
    });

    document.getElementById('savePreset6Btn').addEventListener('click', function () {
        saveQuickSet("quickSetSix");
    });

    //Load
    document.getElementById('loadPreset1Btn').addEventListener('click', function () {
        loadQuickSet("quickSetOne");
    });

    document.getElementById('loadPreset2Btn').addEventListener('click', function () {
        loadQuickSet("quickSetTwo");
    });

    document.getElementById('loadPreset3Btn').addEventListener('click', function () {
        loadQuickSet("quickSetThree");
    });

    document.getElementById('loadPreset4Btn').addEventListener('click', function () {
        loadQuickSet("quickSetFour");
    });

    document.getElementById('loadPreset5Btn').addEventListener('click', function () {
        loadQuickSet("quickSetFive");
    });

    document.getElementById('loadPreset6Btn').addEventListener('click', function () {
        loadQuickSet("quickSetSix");
    });

});

//Set presets to the unit list
function setPresets() {
    const preSets = [];
    const all_inputs = document.querySelectorAll(".quick_set_input");
    const tableOfUnits = document.getElementById("tableOfUnits");

    all_inputs.forEach(input => {
        const id = input.id;
        const value = parseInt(input.value);
        preSets.push({ [id]: value });
    });

    //All units quick set
    const a04 = parseInt(document.getElementById("a_u00_04").value);
    const a59 = parseInt(document.getElementById("a_u05_09").value);
    const a1019 = parseInt(document.getElementById("a_u10_19").value);
    const a2029 = parseInt(document.getElementById("a_u20_29").value);
    const a3030 = parseInt(document.getElementById("a_u30_30").value);
    const ar = [{ value: a04, min: 0, max: 4 },
    { value: a59, min: 5, max: 9 },
    { value: a1019, min: 10, max: 19 },
    { value: a2029, min: 20, max: 29 },
    { value: a3030, min: 30, max: 30 }];
    for (let i = 0; i < ar.length; i++) {
        let v = ar[i].value;
        let minV = ar[i].min;
        let maxV = ar[i].max;
        for (let i = 0; i < tableOfUnits.rows.length; i++) {
            let row = tableOfUnits.rows[i];
            let unitLevel = parseInt(row.cells[2].innerText);
            let inputElement = row.querySelector('input');
            if (v >= 0 && unitLevel >= minV && unitLevel <= maxV) inputElement.value = v;
        }
    }

    //General Units
    for (let i = 0; i < preSets.length; i++) {
        const key = Object.keys(preSets[i])[0];
        const sliceKey = key.slice(0, -5);
        const value = preSets[i][key];
        if (value < 0 || isNaN(value)) continue;
        let minLevel = parseInt(key.slice(-5).substring(0, 2));
        let maxLevel = parseInt(key.slice(-2));

        for (let i = 0; i < tableOfUnits.rows.length; i++) {
            let row = tableOfUnits.rows[i];
            // Extracting values from the row
            let unitName = row.cells[1].innerText;
            let unitLevel = parseInt(row.cells[2].innerText);
            let inputElement = row.querySelector('input');
            if (unitName.toLowerCase() == sliceKey.toLowerCase()) {
                if (unitLevel >= minLevel && unitLevel <= maxLevel) inputElement.value = value;
            }
        }
    }

    //Common units quick set
    const com04 = parseInt(document.getElementById("com00_04").value);
    const com59 = parseInt(document.getElementById("com05_09").value);
    const com1019 = parseInt(document.getElementById("com10_19").value);
    const com2029 = parseInt(document.getElementById("com20_29").value);
    const com3030 = parseInt(document.getElementById("com30_30").value);
    const comr = [{ value: com04, min: 0, max: 4 },
    { value: com59, min: 5, max: 9 },
    { value: com1019, min: 10, max: 19 },
    { value: com2029, min: 20, max: 29 },
    { value: com3030, min: 30, max: 30 }];
    for (let i = 0; i < comr.length; i++) {
        let v = comr[i].value;
        if (v < 0 || isNaN(v)) continue;
        let minV = comr[i].min;
        let maxV = comr[i].max;
        
        for (let i = 1; i < tableOfUnits.rows.length; i++) {
            let row = tableOfUnits.rows[i];
            // Extracting values from the row
            let unitName = row.cells[1].innerText;
            let unitClass;
            for (let j = 0; j < arrUnitNms.length; j++) {
                if (unitName === arrUnitNms[j].key) {
                    unitClass = arrUnitNms[j].class;
                    j = arrUnitNms.length;
                }
            }
            let unitLevel = parseInt(row.cells[2].innerText);
            let inputElement = row.querySelector('input');
            if (unitClass == "common") {
                if (unitLevel >= minV && unitLevel <= maxV) inputElement.value = v;
            }
        }        
    }

    //Uncommon units quick set
    const unc04 = parseInt(document.getElementById("unc00_04").value);
    const unc59 = parseInt(document.getElementById("unc05_09").value);
    const unc1019 = parseInt(document.getElementById("unc10_19").value);
    const unc2029 = parseInt(document.getElementById("unc20_29").value);
    const unc3030 = parseInt(document.getElementById("unc30_30").value);
    const uncr = [{ value: unc04, min: 0, max: 4 },
    { value: unc59, min: 5, max: 9 },
    { value: unc1019, min: 10, max: 19 },
    { value: unc2029, min: 20, max: 29 },
    { value: unc3030, min: 30, max: 30 }];
    for (let i = 0; i < uncr.length; i++) {
        let v = uncr[i].value;
        if (v < 0 || isNaN(v)) continue;
        let minV = uncr[i].min;
        let maxV = uncr[i].max;
        
        for (let i = 1; i < tableOfUnits.rows.length; i++) {
            let row = tableOfUnits.rows[i];
            // Extracting values from the row
            let unitName = row.cells[1].innerText;
            let unitClass;
            for (let j = 0; j < arrUnitNms.length; j++) {
                if (unitName === arrUnitNms[j].key) {
                    unitClass = arrUnitNms[j].class;
                    j = arrUnitNms.length;
                }
            }
            let unitLevel = parseInt(row.cells[2].innerText);
            let inputElement = row.querySelector('input');
            if (unitClass == "uncommon") {
                if (unitLevel >= minV && unitLevel <= maxV) inputElement.value = v;
            }
        }        
    }

    //Rare units quick set
    const rar04 = parseInt(document.getElementById("rar00_04").value);
    const rar59 = parseInt(document.getElementById("rar05_09").value);
    const rar1019 = parseInt(document.getElementById("rar10_19").value);
    const rar2029 = parseInt(document.getElementById("rar20_29").value);
    const rar3030 = parseInt(document.getElementById("rar30_30").value);
    const rarr = [{ value: rar04, min: 0, max: 4 },
    { value: rar59, min: 5, max: 9 },
    { value: rar1019, min: 10, max: 19 },
    { value: rar2029, min: 20, max: 29 },
    { value: rar3030, min: 30, max: 30 }];
    for (let i = 0; i < rarr.length; i++) {
        let v = rarr[i].value;
        if (v < 0 || isNaN(v)) continue;
        let minV = rarr[i].min;
        let maxV = rarr[i].max;
        
        for (let i = 1; i < tableOfUnits.rows.length; i++) {
            let row = tableOfUnits.rows[i];
            // Extracting values from the row
            let unitName = row.cells[1].innerText;
            let unitClass;
            for (let j = 0; j < arrUnitNms.length; j++) {
                if (unitName === arrUnitNms[j].key) {
                    unitClass = arrUnitNms[j].class;
                    j = arrUnitNms.length;
                }
            }
            let unitLevel = parseInt(row.cells[2].innerText);
            let inputElement = row.querySelector('input');
            if (unitClass == "rare") {
                if (unitLevel >= minV && unitLevel <= maxV) inputElement.value = v;
            }
        }        
    }

    //Legendary units quick set
    const len04 = parseInt(document.getElementById("len00_04").value);
    const len59 = parseInt(document.getElementById("len05_09").value);
    const len1019 = parseInt(document.getElementById("len10_19").value);
    const len2029 = parseInt(document.getElementById("len20_29").value);
    const len3030 = parseInt(document.getElementById("len30_30").value);
    const lenr = [{ value: len04, min: 0, max: 4 },
    { value: len59, min: 5, max: 9 },
    { value: len1019, min: 10, max: 19 },
    { value: len2029, min: 20, max: 29 },
    { value: len3030, min: 30, max: 30 }];
    for (let i = 0; i < lenr.length; i++) {
        let v = lenr[i].value;
        if (v < 0 || isNaN(v)) continue;
        let minV = lenr[i].min;
        let maxV = lenr[i].max;
        
        for (let i = 1; i < tableOfUnits.rows.length; i++) {
            let row = tableOfUnits.rows[i];
            // Extracting values from the row
            let unitName = row.cells[1].innerText;
            let unitClass;
            for (let j = 0; j < arrUnitNms.length; j++) {
                if (unitName === arrUnitNms[j].key) {
                    unitClass = arrUnitNms[j].class;
                    j = arrUnitNms.length;
                }
            }
            let unitLevel = parseInt(row.cells[2].innerText);
            let inputElement = row.querySelector('input');
            if (unitClass == "legendary") {
                if (unitLevel >= minV && unitLevel <= maxV) inputElement.value = v;
            }
        }        
    }

}

//Save the presets to a file
function savePresetToFile() {
    const presetsToSave = [];
    const all_inputs = document.querySelectorAll(".quick_set_input");

    all_inputs.forEach(input => {
        const id = input.id;
        const value = parseInt(input.value);
        presetsToSave.push({ [id]: value });
    });

    const jsonPresets = JSON.stringify(presetsToSave);
    const blob = new Blob([jsonPresets], { type: "application/json" });
    const a = document.createElement("a");
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = "presets.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

//Load presets from a file
function loadPresetFromFile(file) {
    const reader = new FileReader();

    reader.onload = function (event) {
        try {
            const presetData = JSON.parse(event.target.result);
            const allInputs = document.querySelectorAll(".quick_set_input");

            allInputs.forEach(input => {
                const inputId = input.id;

                for (let i = 0; i < presetData.length; i++) {
                    if (presetData[i].hasOwnProperty(inputId)) {
                        input.value = presetData[i][inputId];
                        break;
                    }
                }
            });
        } catch (error) {
            console.error("Error parsing file:", error);
        }
    };

    reader.readAsText(file);
}

function saveQuickSet(quickSetKey) {
    const presetsToSave = [];
    const all_inputs = document.querySelectorAll(".quick_set_input");

    all_inputs.forEach(input => {
        const id = input.id;
        const value = parseInt(input.value);
        presetsToSave.push({ [id]: value });
    });

    chrome.storage.local.set({ [quickSetKey]: presetsToSave }, function () {
        if (chrome.runtime.lastError) {
            console.error("Error saving presets:", chrome.runtime.lastError);
        } else {
            alert("Presets were saved successfully!");
        }
    });
}


function loadQuickSet(quickSetKey) {
    const a_i = document.querySelectorAll(".quick_set_input");
    a_i.forEach(input => {
        input.value = "";
    });

    chrome.storage.local.get(quickSetKey, function (storedData) {
        if (storedData.hasOwnProperty(quickSetKey)) {
            const array = storedData[quickSetKey];
            for (let i = 0; i < array.length; i++) {
                let id = null;
                let value = null;
                try {
                    const obj = array[i];
                    id = Object.keys(obj)[0];
                    value = obj[id];
                } catch (error) {
                    continue;
                }

                if (id !== null && value !== null && value >= 0) {
                    const a_i = document.querySelectorAll(".quick_set_input");
                    a_i.forEach(input => {
                        if (input.id === id) input.value = value;
                    });
                }
            }
        }
    });
}




function importUnitsFromFile() {
    const fileInput = document.getElementById("loadUnitFileBtn").files[0];

    if (!fileInput) {
        alert('Please select a file!');
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
        try {
            const data = JSON.parse(e.target.result);
            chrome.storage.local.set(data, function () {
                console.log('Settings imported successfully.');
            });
        } catch (error) {
            alert('An error occurred: ' + error);
        }
    };

    reader.readAsText(fileInput);
    location.reload();
}


function exportUnitsToFile() {
    const keysToExport = [
        "quickSetOne",
        "quickSetTwo",
        "quickSetThree",
        "quickSetFour",
        "quickSetFive",
        "quickSetSix",
        "unitList"
    ];

    chrome.storage.local.get(keysToExport, function (data) {
        const exportedData = {};
        keysToExport.forEach(key => {
            exportedData[key] = data[key];
        });

        const json = JSON.stringify(exportedData, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "SRHelper_Settings.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}