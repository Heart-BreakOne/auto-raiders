document.addEventListener("DOMContentLoaded", async function () {

    await loadUnitsData()

    document.getElementById('save_btn').addEventListener('click', function () {
        saveLevelUpUnits()
    });

    document.getElementById('reset_btn').addEventListener('click', function () {
        if (confirm('Are you sure you want to delete all unit data?')) {
            chrome.storage.local.remove('minCurrency');
            chrome.storage.local.remove('unitsData');
            location.reload();
        }
    });

    document.getElementById("log-file-input").addEventListener('change', function () {
        importUnitsData("log-file-input");
        this.value = '';
    });

    document.getElementById('export_btn').addEventListener('click', function () {
        exportUnitsData()
    });
})

async function loadUnitsData() {

    chrome.storage.local.get('minCurrency', function (data) {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            return;
        }

        if (!data || Object.keys(data).length === 0) {
            return;
        }
        document.getElementById('min_level_currency').value = data.minCurrency
    })
    chrome.storage.local.get("unitsData", function (data) {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            return;
        }

        if (!data || Object.keys(data).length === 0) {
            return;
        }

        let table = document.getElementById('units_table');
        for (let i = 1; i < table.rows.length; i++) {
            let row = table.rows[i];
            let id = row.id
            let unit = data.unitsData[id];
            let canLevelUp = unit.canLevelUp
            let canSpec = unit.canSpec
            let spec = unit.spec
            let priority = unit.priority

            row.cells[1].querySelector('input[type="checkbox"]').checked = canLevelUp
            row.cells[2].querySelector('input[type="checkbox"]').checked = canSpec
            row.cells[3].querySelector('select').value = spec
            row.cells[4].querySelector('input[type="number"]').value = priority
        }

    });
}
function saveLevelUpUnits() {
    
    let minCurrency = document.getElementById('min_level_currency').value
    chrome.storage.local.set({ 'minCurrency': minCurrency });

    let table = document.getElementById('units_table');

    let unitsData = {}

    for (let i = 1; i < table.rows.length; i++) {
        let row = table.rows[i];


        let id = row.id;
        let canLevelUp = row.cells[1].querySelector('input[type="checkbox"]').checked;
        let canSpec = row.cells[2].querySelector('input[type="checkbox"]').checked;
        let spec = row.cells[3].querySelector('select').value;
        let priority = row.cells[4].querySelector('input[type="number"]').value;

        let prepareData = {
            priority: parseInt(priority),
            canLevelUp: canLevelUp,
            canSpec: canSpec,
            spec: spec
        };
        unitsData[id] = prepareData;
    }

    chrome.storage.local.set({ 'unitsData': unitsData }, () => { alert('Saved successfully!'); });
}

function exportUnitsData() {

    chrome.storage.local.get("unitsData", function (data) {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            return;
        }

        if (!data || Object.keys(data).length === 0) {
            return;
        }

        let jsonData = JSON.stringify(data.unitsData);
        let blob = new Blob([jsonData], { type: 'application/json' });
        let url = URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.href = url;
        a.download = 'unitsData.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
}

async function importUnitsData(string) {
    const fileInput = document.getElementById(string);
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const jsonContent = e.target.result;

            try {
                const parsedData = JSON.parse(jsonContent);

                chrome.storage.local.set({ 'unitsData': parsedData }, function () {
                    alert('Data imported successfully!');
                    location.reload();
                });
            } catch (error) {
                alert('An error occurred: ' + error);
            }
        };
        reader.readAsText(file);
    } else {
        alert('Please select a file!');
    }
}