
document.addEventListener('DOMContentLoaded', function () {

    let dataContainer = document.getElementById('data_container');
    
    document.getElementById('check_button').addEventListener('click', function () {
        let key = document.getElementById('key_input').value;
        chrome.storage.local.get(key, function (result) {
            if (result && Object.keys(result).length > 0) {
                dataContainer.innerHTML = JSON.stringify(result[key], null, 2);
            } else {
                dataContainer.innerHTML = 'Key not found in local storage.';
            }
        });
    });

    document.getElementById('delete_button').addEventListener('click', function () {
        let key = document.getElementById('key_input').value;
        chrome.storage.local.get(key, function (result) {
            if (Object.keys(result).length !== 0) {
                chrome.storage.local.remove(key, function () {
                    dataContainer.innerHTML = "Deleted successfully";
                });
            } else {
                dataContainer.innerHTML = 'Key not found in local storage.';
            }
        });
    });

    chrome.storage.local.get(null, function(items) {
        var keys = Object.keys(items);
        var keysString = '';
        var maxKeysPerLine = 10;
    
        for (var i = 0; i < keys.length; i++) {
            keysString += keys[i];
            if (i < keys.length - 1) {
                keysString += ', ';
            }
            if ((i + 1) % maxKeysPerLine === 0 && i < keys.length - 1) {
                keysString += '\n';
            }
        }
    
        document.getElementById('keys_container').textContent = keysString;
    });
});
