document.addEventListener('DOMContentLoaded', function () {
    const button = document.querySelector('button');
    button.addEventListener('click', transformJson);
});

async function transformJson() {
    const urlInput = document.getElementById('urlInput').value;
    const jsonFileInput = document.getElementById('jsonFileInput').files[0];

    try {
        const jsonData = await readFileAsync(jsonFileInput);
        const parsedJson = JSON.parse(jsonData);

        //Extract MapNodes from the json
        const mapNodes = parsedJson.sheets.MapNodes;

        //Remove unwanted keys from each map node
        for (const nodeKey in mapNodes) {
            const node = mapNodes[nodeKey];
            if (
                node.ChestType === "dungeonchest" ||
                node.ChestType === "bonechest" ||
                node.ChestType === "chestbronze" ||
                node.ChestType === "chestsilver" ||
                node.ChestType === "chestgold"
            ) {
                delete mapNodes[nodeKey];
                continue;
            }
            for (const keyToRemove of ["NodeDifficulty", "NodeType", "MapTags", "OnLoseDialog", "OnStartDialog", "OnWinDialog"]) {
                delete node[keyToRemove];
            }
        }

        //Create the transformed JSON
        const transformedJson = {
            url: urlInput,
            MapNodes: mapNodes
        };

        //Convert the JSON to a Blob
        const blob = new Blob([JSON.stringify(transformedJson, null, 2)], { type: 'application/json' });

        //Create a download link
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = 'loyalty_chests.json';

        //Trigger the download
        downloadLink.click();
    } catch (error) {
        console.error(error.message);
    }
}

function readFileAsync(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
    });
}