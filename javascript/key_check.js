
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
});
