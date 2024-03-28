//This file handles getting and setting of the game mode the captains are playing in.
//game_mode_manager.js is responsible for getting the captain names and their mode and passing to this file for setting.

//Game modes are dungeon, duel and clash

//This function receives a key which is a string with their game mode and a value which is the captain's name.
//The key is unique so only one captain can exist running that mode.
async function saveToStorage(key, value) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({ [key]: value }, function () {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve();
            }
        });
    });
}

//Receives a string key and retrieves the data from the chrome storage.
async function retrieveFromStorage(key) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([key], function (result) {
            resolve(result[key]);
        });
    });
}

async function retrieveMultipleFromStorage(keys) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, (items) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(items);
      }
    });
  });
};

//Receives a string key and retrieves numbers from the chrome storage.
async function retrieveNumberFromStorage(key) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(key, (result) => {
            if (chrome.runtime.lastError) {
                resolve(-100);
            } else {
                const parsedNumber = parseFloat(result[key], 10);
                if (!isNaN(parsedNumber)) {
                    resolve(parsedNumber);
                } else {
                    resolve(-100);
                }
            }
        });
    });
}