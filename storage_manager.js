
function saveToStorage(key, value) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({[key]: value}, function() {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve();
            }
        });
    });
}

function retrieveFromStorage(key){
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([key], function(result) {
            resolve(result[key]);
        });
    });
}