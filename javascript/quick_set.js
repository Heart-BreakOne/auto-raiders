document.addEventListener("DOMContentLoaded", async function () {

    //Opens the popup
    document.getElementById("quickSet_button").addEventListener("click", async function () {
        const popup = document.getElementById('popup');
        const all_inputs = document.querySelectorAll(".quick_set_input");
        all_inputs.forEach((input, index) => {
            input.value = ""
            if (index < 4) {
                input.value = "-1";
            }
        });
        popup.style.display = 'block';

    });

    //Closes the popup
    document.getElementById("closeBtn").addEventListener("click", async function () {
        const popup = document.getElementById('popup');
        popup.style.display = 'none';
    });

    //Save the presets to a file
    document.getElementById("savePreSetBtn").addEventListener("click", async function () {
        savePresetToFile()
    });

    //Set the presets
    document.getElementById("setBtn").addEventListener("click", async function () {
        setPresets()
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
        const a = document.querySelectorAll(".quick_set_input")
        a.forEach(input => {
            input.value = ""
        });
    });

    //Quick sets.
    //Save
    document.getElementById('savePreset1Btn').addEventListener('click', function () {
        saveQuickSet("quickSetOne")
    });

    document.getElementById('savePreset2Btn').addEventListener('click', function () {
        saveQuickSet("quickSetTwo")
    });

    document.getElementById('savePreset3Btn').addEventListener('click', function () {
        saveQuickSet("quickSetThree")
    });

    document.getElementById('savePreset4Btn').addEventListener('click', function () {
        saveQuickSet("quickSetFour")
    });


    //Load
    document.getElementById('loadPreset1Btn').addEventListener('click', function () {
        loadQuickSet("quickSetOne")
    });

    document.getElementById('loadPreset2Btn').addEventListener('click', function () {
        loadQuickSet("quickSetTwo")
    });

    document.getElementById('loadPreset3Btn').addEventListener('click', function () {
        loadQuickSet("quickSetThree")
    });

    document.getElementById('loadPreset4Btn').addEventListener('click', function () {
        loadQuickSet("quickSetFour")
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

    //General Units
    for (let i = 0; i < preSets.length; i++) {
        const key = Object.keys(preSets[i])[0];
        const sliceKey = key.slice(0, -5);
        const value = preSets[i][key]
        if (value < 0 || isNaN(value)) {
            continue
        }
        let minLevel = parseInt(key.slice(-5).substring(0, 2));
        let maxLevel = parseInt(key.slice(-2));

        for (let i = 0; i < tableOfUnits.rows.length; i++) {
            let row = tableOfUnits.rows[i];
            // Extracting values from the row
            let unitName = row.cells[1].innerText;
            let unitLevel = parseInt(row.cells[2].innerText);
            let inputElement = row.querySelector('input');
            if (unitName.toLowerCase() == sliceKey.toLowerCase()) {
                if (unitLevel >= minLevel && unitLevel <= maxLevel) {
                    inputElement.value = value
                }
            }
        }
    }

    //All units quick set
    const a05 = parseInt(document.getElementById("a_u00_05").value);
    const a610 = parseInt(document.getElementById("a_u06_10").value);
    const a1120 = parseInt(document.getElementById("a_u11_20").value);
    const a2130 = parseInt(document.getElementById("a_u21_30").value);
    const ar = [{ value: a05, min: 0, max: 5 },
    { value: a610, min: 6, max: 10 },
    { value: a1120, min: 11, max: 20 },
    { value: a2130, min: 21, max: 30 }]
    for (let i = 0; i < ar.length; i++) {
        const v = ar[i].value;
        const minV = ar[i].min;
        const maxV = ar[i].max;
        for (let i = 0; i < tableOfUnits.rows.length; i++) {
            let row = tableOfUnits.rows[i];
            let unitLevel = parseInt(row.cells[2].innerText);
            let inputElement = row.querySelector('input');
            if (v >= 0 && unitLevel >= minV && unitLevel <= maxV) {
                inputElement.value = v
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
        input.value = ""
    });
    
    chrome.storage.local.get(quickSetKey, function (storedData) {
        if (storedData.hasOwnProperty(quickSetKey)) {
            const array = storedData[quickSetKey]
            for (let i = 0; i < array.length; i++) {
                let id = null
                let value = null
                try {
                    const obj = array[i];
                    id = Object.keys(obj)[0];
                    value = obj[id];
                } catch (error) {
                    continue
                }

                if (id !== null && value !== null && value >= 0) {
                    const a_i = document.querySelectorAll(".quick_set_input");
                    a_i.forEach(input => {
                        if (input.id === id) {
                            input.value = value;
                            
                        }
                    });
                }

            }
        }
    });
}