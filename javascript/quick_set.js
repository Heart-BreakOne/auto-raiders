document.addEventListener("DOMContentLoaded", async function () {

    const savePreset = document.getElementById("savePreSetBtn");

    //Opens the popup
    document.getElementById("quickSet_button").addEventListener("click", async function () {
        const popup = document.getElementById('popup');
        popup.style.display = 'block';
    });

    //Closes the popup
    document.getElementById("closeBtn").addEventListener("click", async function () {
        const popup = document.getElementById('popup');
        popup.style.display = 'none';
    });


    //Save the presets to a file
    savePreset.addEventListener('click', function () {
        savePresetToFile()
    });


    //Load presets from a file
    document.getElementById('loadPreSetBtn').addEventListener('change', function () {
        const fileInput = document.getElementById("loadPreSetBtn");
        const file = fileInput.files[0];
        loadPresetFromFile(file);
    });


});

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