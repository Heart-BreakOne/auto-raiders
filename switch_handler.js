//Thi file sets the toggle switches/radio buttons
//It is also responsible for getting the values when requested
//It also injects a visual alert so the user knows if the set into storage was successful.

//When invoked this function receives the switch id and returns the switch value from storage.
function getSwitchState(switchId) {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get([switchId], function (result) {
			const res = result[switchId] || false;
			resolve(res);
		});
	});
}

//When invoked this function returns the radio button value from storage
function getRadioButton(key) {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get(key, result => {
			if (chrome.runtime.lastError) {
				reject(chrome.runtime.lastError);
			} else {
				resolve(result[key]);
			}
		});
	});
}