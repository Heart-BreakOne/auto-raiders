//This file handles getting and setting the captain flag data from the storage.

/* When invoked this function receives a flag value (loyaltyCaptain and flaggedCaptains)
It then checks if any captains match the criteria to be flagged.
If they match, they are sent to storage.
//This function is invoked while the battlefield is active.
*/
async function flagCaptain(flag) {
	return new Promise((resolve, reject) => {
		// Retrieve existing data from local storage
		chrome.storage.local.get([flag], function (result) {
			let flaggedData = result[flag] || [];

			// Get all captain buttons from the captain footer bar
			const captainButtons = document.querySelectorAll(".captainButton");
			// Current time
			const currentTime = new Date();

			// Iterate over active captain buttons
			captainButtons.forEach((button, index) => {
				let isActive;
				try {
					isActive = button.querySelector(".captainButtonImg").classList.contains("captainButtonActive");
				} catch {
					isActive = false;
				}

				// If the captain is active
				if (isActive) {
					const captainId = index + 1;
					const captainName = button.querySelector(".captainButtonImg").getAttribute("alt");

					// Check if an entry with the same captainId and captainName exists
					const existingCaptainIndex = flaggedData.findIndex(
						(entry) => entry.captainId === captainId && entry.captainName === captainName
					);

					if (existingCaptainIndex !== -1) {
						// If the captain with the same id and name exists, update the currentTime
						flaggedData[existingCaptainIndex].currentTime = currentTime.toISOString();
					} else {
						// Add a new entry to the flaggedData object
						flaggedData.push({
							captainId: captainId,
							captainName: captainName,
							currentTime: currentTime.toISOString(),
						});
					}
				}
			});

			// Remove captains with a time older than 20 minutes
			flaggedData = flaggedData.filter(entry => {
				const entryTime = new Date(entry.currentTime);
				const twentyMinutesAgo = new Date();
				twentyMinutesAgo.setMinutes(twentyMinutesAgo.getMinutes() - 20);
				return entryTime > twentyMinutesAgo;
			});

			// Update the flaggedData object in storage
			chrome.storage.local.set({ [flag]: flaggedData }, function () {
				resolve(flaggedData);
			});
		});
	});
}


//When invoked this function receives the captain name and the flag key and returns true or false if they are still under flag.
async function getCaptainFlag(captainName, flagKey) {
	return new Promise((resolve, reject) => {
		//Gets the captain names and values from storage
		chrome.storage.local.get([flagKey], function (result) {
			const flagData = result[flagKey] || [];
			const foundCaptain = flagData.find(captain => captain.captainName === captainName);

			//If captain exists on storage it means they are flagged,
			//It then checks if 5 minutes have passed since they were flagged and returns false. Else returns true
			if (foundCaptain) {
				const currentTime = new Date();
				const pastTime = new Date(foundCaptain.currentTime);
				const elapsedTimeInMinutes = (currentTime - pastTime) / (1000 * 60);

				if (elapsedTimeInMinutes >= 3) {
					resolve(false);
				} else {
					resolve(true);
				}
			} else {
				//If captain does not exist on storage it means they are not flagged.
				resolve(false);
			}
		});
	});
}

async function flagCaptainRed(cpId, cpNmSt) {
	const curTime = new Date().toISOString();
	chrome.storage.local.get("flaggedCaptains", function (data) {
		let flaggedCpts = data.flaggedCaptains || [];

		flaggedCpts.push({
			captainId: cpId,
			captainName: cpNmSt,
			currentTime: curTime,
		});

		chrome.storage.local.set({ "flaggedCaptains": flaggedCpts }, function () {
		});
	});
}

async function setMaxUnit(capName) {
	const curTime = new Date().toISOString();
	capName = capName.toLowerCase();

	chrome.storage.local.get('maxUnitsPlaced', function (result) {
		let maxUnitsPlaced = result.maxUnitsPlaced || [];
		const existingIndex = maxUnitsPlaced.findIndex(item => item.capName === capName);

		if (existingIndex !== -1) {
			maxUnitsPlaced[existingIndex].time = curTime;
		} else {
			maxUnitsPlaced.push({ capName, time: curTime });
		}

		const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
		maxUnitsPlaced = maxUnitsPlaced.filter(item => new Date(item.time) > new Date(tenMinutesAgo));

		chrome.storage.local.set({ 'maxUnitsPlaced': maxUnitsPlaced });
	});
}


async function retrieveMaxUnit(capName) {
	capName = capName.toLowerCase();
	return new Promise(resolve => {
		chrome.storage.local.get('maxUnitsPlaced', function (result) {
			const maxUnitsPlaced = result.maxUnitsPlaced || [];

			const entry = maxUnitsPlaced.find(item => item.capName === capName);

			if (entry) {
				const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
				const entryTime = new Date(entry.time);
				resolve(entryTime > tenMinutesAgo);
			} else {
				resolve(false);
			}
		});
	});
}