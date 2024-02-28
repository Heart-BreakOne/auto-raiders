
/* This function retrieves battle data from storage so it checks for any messages left by the captain.
null - Null, no message set
message_00 - Captain unset a message :(
message_01 - Join the giveaway. Captains wants you to join the giveaway
message_02 - Last Battle - Captain said it's the last battle
message_03 - Thanks for helping out - Captain said thanks for helping out
message_04 - Please follow the markers - Captain told you to follow the markers
message_05 - More Epics! - Captain wants more epic units
message_06 - No More Epics! - Captain doesn't want any more epics
message_07 - Check out my stream! - Captain wants you to check their stream
*/

const arrayOfBattleMessages = [
    { key: null, value: "has nothing to say" },
    { key: undefined, value: "has nothing to say" },
    { key: "message_00", value: "has nothing to say" },
    { key: "message_01", value: "wants you to join the giveaway" },
    { key: "message_02", value: "is on LAST BATTLE" },
    { key: "message_03", value: "said thanks for helping out" },
    { key: "message_04", value: "told you to follow the markers" },
    { key: "message_05", value: "wants more epic units" },
    { key: "message_06", value: "doesn't want any more epics" },
    { key: "message_07", value: "wants you to check their stream" }
]
async function displayMessage() {
    const battleMessagePort = chrome.runtime.connect({ name: "content-script" });
    battleMessagePort.postMessage({ action: "checkBattleMessages", captainNameFromDOM });
    battleMessagePort.disconnect();
    try {
        const result = await new Promise((resolve) => {

            chrome.storage.local.get({ ['battleMessageData']: [] }, function (result) {
                if (chrome.runtime.lastError) {
                    resolve(null);
                } else {
                    resolve(result['battleMessageData']);
                }
            });
        });

        if (result) {
            //Do something with the result _shrug_
            let messagesToDisplay = "";
            let messageState = "";
            for (let i = 0; i < result.length; i++) {
                const position = result[i];
                const captName = position.cptName;
                const message = position.message;
                //Filter so only the message of interest is displayed.
                if (message === "message_02") {
                    messageState = "";
                    messagesToDisplay = `${messagesToDisplay}${captName} is on the LAST BATTLE.  `
                } else if (message === "message_01") {
                    messageState = "";
                    messagesToDisplay = `${messagesToDisplay}${captName} has a GIVEAWAY.   `
                }
                //These bits show every message.
                //const messageState = arrayOfBattleMessages.find(entry => entry.key === message)?.value;
                //messagesToDisplay = `${messagesToDisplay}${captName} ${messageState}.   `
            }

            //Return the captain name and their message.
            return messagesToDisplay;
        } else {
            return "No messages to display or something went wrong";
        }
    } catch (error) {
        return "Something went wrong.";
    }
}

async function getUpdate() {
    try {
        const result = await new Promise((resolve) => {

            chrome.storage.local.get({ ['hasUpdate']: [] }, function (result) {
                if (chrome.runtime.lastError) {
                    resolve(null);
                } else {
                    resolve(result['hasUpdate']);
                }
            });
        });

        if (result) {
            return "Update. ";
        } else {
            return "";
        }
    } catch (error) {
        return "";
    }
}