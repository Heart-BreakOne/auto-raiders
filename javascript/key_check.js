
document.addEventListener('DOMContentLoaded', function () {
    const scrollToTopBtn = document.getElementById("scrollBtnUp");
    const scrollToBotBtn = document.getElementById("scrollBtnDown");
    scrollToBotBtn.style.display = "block";

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
    // Scroll to the bottom when the button is clicked
    scrollToBotBtn.addEventListener("click", function () {
        document.body.scrollTop = document.body.scrollHeight;
        document.documentElement.scrollTop = document.documentElement.scrollHeight;
    });

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

    chrome.storage.local.get(null, function (items) {
        var keys = Object.keys(items);
        var keysString = '';
        var maxKeysPerLine = 7;

        for (var i = 0; i < keys.length; i++) {
            keysString += '<span name="keyItem">' + keys[i] + '</span>';
            if (i < keys.length - 1) keysString += ', ';
            if ((i + 1) % maxKeysPerLine === 0 && i < keys.length - 1) keysString += '<br>';
        }

        document.getElementById('keys_container').innerHTML = keysString;
        let keyItems = document.getElementsByName('keyItem');
        for (var i = 0; i < keyItems.length; i++) {
            keyItems[i].addEventListener('click', function (e) {
                document.getElementById("key_input").value = e.target.innerText;
                chrome.storage.local.get(e.target.innerText, function (result) {
                    if (result && Object.keys(result).length > 0) {
                        dataContainer.innerHTML = JSON.stringify(result[e.target.innerText], null, 2);
                    } else {
                        dataContainer.innerHTML = 'Key not found in local storage.';
                    }
                });
            });
        }

    });
});

