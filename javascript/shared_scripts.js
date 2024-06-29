document.addEventListener("DOMContentLoaded", async function () {
	let darkTheme;
	let switchResult = await chrome.storage.local.get(['darkSwitch']);
	let darkSwitch = switchResult.darkSwitch;
	if (darkSwitch == false) {
		darkTheme = "light";
	} else {
		darkTheme = "dark";
	}
	document.querySelector("html").setAttribute("data-theme", darkTheme);
});

function initializeSwitch(switchId) {
	const switchElement = document.getElementById(switchId);

	// Load switch state from storage
	chrome.storage.local.get([switchId], function (result) {
		switchElement.checked = result[switchId] || false;
	});

	//Listen to changes on the switch states and set the new value.
	switchElement.addEventListener("change", function () {
		const switchState = this.checked;
		chrome.storage.local.set({ [switchId]: switchState }, function () {
		});
	});
}

//Get every unit the user has
async function fetchUnits() {
	return await retrieveFromStorage("unitArray");
}
