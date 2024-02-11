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

//Receives the game mode key and returns the name of the captain currently running it.
async function retrieveFromStorage(key) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([key], function (result) {
            resolve(result[key]);
        });
    });
}

async function retrieveNumberFromStorage(key) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(key, (result) => {
            if (chrome.runtime.lastError) {
                resolve(-100);
            } else {
                const parsedNumber = parseInt(result[key], 10);
                if (!isNaN(parsedNumber)) {
                    resolve(parsedNumber);
                } else {
                    resolve(-100);
                }
            }
        });
    });
}