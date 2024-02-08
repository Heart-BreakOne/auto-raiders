
document.addEventListener('DOMContentLoaded', function() {
    var checkButton = document.getElementById('check_button');
    checkButton.addEventListener('click', function() {
        var key = document.getElementById('key_input').value;
        chrome.storage.local.get(key, function(result) {
            var dataContainer = document.getElementById('data_container');
            if (result && Object.keys(result).length > 0) {
                dataContainer.innerHTML = JSON.stringify(result[key]);
            } else {
                dataContainer.innerHTML = 'Key not found in local storage.';
            }
        });
    });
});
