//Declaring/Initializing variables
let rewardData = [];
let allChests = {};

//Event listener for when the page loads
document.addEventListener('DOMContentLoaded', async function () {

	const scrollToTopBtn = document.getElementById("scrollBtn");

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

	//Load the chest rewards log
	await loadUserChestsLog();
	loadChestRewardCounter();
});

async function loadUserChestsLog() {
	let items = await retrieveFromStorage("items");
	let currency = await retrieveFromStorage("currency");
	let imageURLs = await retrieveFromStorage("imageUrls");
	let skins = await retrieveFromStorage("skins");
	let filteredImageURLs = {};
	Object.keys(imageURLs).forEach(function (key) {
		if (key.startsWith("mobilelite/units/static/") || key.startsWith("mobilelite/events/")) {
			filteredImageURLs[key] = imageURLs[key];
			return;
		}
	});
	let chests = await retrieveFromStorage("chests");
	let boxes = await retrieveFromStorage("boxes");

	let allRewardData = [];
	let allUrlData = [];

	let arrayData = await chrome.storage.local.get(['userChestsLog']);
	arrayData = arrayData.userChestsLog;

	//Sort the array based on the time they were added.
	if (!arrayData) return;
	const sortedData = arrayData.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));

	//Get the data container div
	const dataContainer = document.getElementById('dataContainer');
	dataContainer.style.textAlign = "justify";
	const title = document.createElement('div');
	title.innerHTML = '<h2>Reward Details</h2>';
	title.style.textAlign = "center";
	dataContainer.appendChild(title);

	//Create a table 
	const tableElement = document.createElement('table');
	tableElement.id = "logTable";

	//Create table header row
	const headerRow = document.createElement('tr');
	headerRow.innerHTML = '<th>#</th><th>ChestId</th><th>Chest Name</th><th>Time</th><th>Rewards</th>';

	//Append header row to the table
	tableElement.appendChild(headerRow);

	//Populate the table with array data
	for (let i = 0; i < sortedData.length; i++) {
		const entry = sortedData[i];

		let chestId = entry.chestId;
		let dateTime = entry.dateTime;
		let rewards = entry.rewards;
		let eventUid = entry.eventUid;
		let rewardString = "";
		let chestName;

		if (allChests.hasOwnProperty(chestId)) {
			chestName = allChests[chestId].DisplayName;
		} else {
			Object.keys(chests).forEach(function (key) {
				if (key === chestId) {
					chestName = chests[key].DisplayName;
					allChests[key] = { DisplayName: chestName };
					return;
				}
			});
			Object.keys(boxes).forEach(function (key) {
				if (key === chestId) {
					chestName = boxes[key].DisplayName;
					allChests[key] = { DisplayName: chestName };
					return;
				}
			});
		}

		for (let j = 0; j < rewards.length; j++) {
			let reward = rewards[j];
			let rewardSort;
			if (reward.includes("scroll")) {
				let regex = /\|scroll.+/;
				let match = regex.exec(reward);
				rewardSort = "0" + match[0].replace("|scroll", "") + " scrolls";
			} else if (reward.includes("mythicbox_finalreward")) {
				rewardSort = "mythicbox_finalreward_rubies_x15";
			} else if (reward.includes("mythicbox_jackpot")) {
				rewardSort = "mythicbox_jackpot_gold_x5000";
			} else {
				rewardSort = reward;
			}

			let regex = /\d+/;
			let qty;
			if (reward.includes("mythicbox_finalreward")) {
				qty = "15";
			} else if (reward.includes("mythicbox_jackpot")) {
				qty = "5000";
			} else {
				let match = regex.exec(reward);
				qty = match ? match[0] : 1;
			}

			let url;

			url_loop: for (let k = 0; k < allUrlData.length; k++) {
				if (allUrlData[k].reward == reward && allUrlData[k].eventUid == eventUid) {
					url = allUrlData[k].url;
					break url_loop;
				}
			}
			if (!url) {
				url = await getRewardUrl(reward, eventUid, items, currency, filteredImageURLs, skins);
				allUrlData.push({
					reward: reward,
					url: url,
					eventUid: eventUid
				});
			}

			allRewardData.push({
				chestId: chestId,
				chestName: chestName,
				slotNo: j + 1,
				dateTime: dateTime,
				reward: reward,
				rewardSort: rewardSort,
				qty: qty,
				url: url,
				eventUid: eventUid
			});

			if (reward.includes("scroll") || reward.includes("skin")) {
				rewardString += `<div class="crop"><img src="${url}" title="${reward}"></div>`;
			} else {
				rewardString += `<img src="${url}" title="${reward}" style="height: 30px; width: auto">`;
			}
		}

		//Convert the string to a Date object and get hour and minutes.
		const startingTime = getTimeString(new Date(entry.dateTime));
		const startingDate = new Date(entry.dateTime).toDateString();

		// Create a table row
		const row = document.createElement('tr');

		row.innerHTML = `<td>${i + 1}</td>
            <td>${chestId}</td>
            <td>${chestName}</td>
            <td title="${startingDate}">${startingTime}</td>
            <td>${rewardString}</td>`;

		// Append the row to the table
		tableElement.appendChild(row);
	}

	reward_loop: for (let j = 0; j < allRewardData.length; j++) {
		const entry = allRewardData[j];

		let chestId = entry.chestId;
		let chestName = entry.chestName;
		let slotNo = entry.slotNo;
		let reward = entry.reward;
		let rewardSort = entry.rewardSort;
		let qty = entry.qty;
		let url = entry.url;
		let eventUid = entry.eventUid;

		for (let i = 0; i < rewardData.length; i++) {
			if (rewardData[i].reward == reward && rewardData[i].chestId == chestId && rewardData[i].slotNo == slotNo && ((rewardData[i].eventUid == eventUid && rewardData[i].reward.includes("eventtoken")) || !rewardData[i].reward.includes("eventtoken"))) {
				rewardData[i].count++;
				continue reward_loop;
			}
		}

		rewardData.push({
			chestId: chestId,
			chestName: chestName,
			slotNo: slotNo,
			reward: reward,
			rewardSort: rewardSort,
			qty: qty,
			url: url,
			eventUid: eventUid,
			count: 1
		});
	}

	rewardData.sort((a, b) =>
		a.chestId.localeCompare(b.chestId) ||
		a.slotNo - b.slotNo ||
		a.rewardSort.localeCompare(b.rewardSort) ||
		a.qty - b.qty
	);

	// Append the table to the data container
	dataContainer.appendChild(tableElement);
}

function getTimeString(startTime) {
	//Get hours and minutes
	const startHour = startTime.getHours();
	const startMinute = startTime.getMinutes();

	//Using padStart to ensure two digits for hours and minutes
	return String(startHour).padStart(2, '0') + ":" + String(startMinute).padStart(2, '0');
}

function loadChestRewardCounter() {
	const counterContainer = document.querySelector('.counter-container');
	counterContainer.innerHTML = '';
	const table = document.createElement('table');
	table.setAttribute('style', 'width:50% !important; padding:0 !important');
	const header = document.createElement('tr');
	header.innerHTML = `<th>#</th><th>Chest Name</th><th>Slot</th><th>Reward</th><th>Qty</th><th>Count</th><th>%</th>`;
	table.appendChild(header);
	let chests = [];
	let counter = 1;
	item_loop: for (const item of rewardData) {
		for (const chest of chests) {
			if (item.chestId == chest.chestId && item.slotNo == chest.slotNo) {
				chest.count += item.count;
				continue item_loop;
			}
		}
		chests.push({
			chestId: item.chestId,
			chestName: item.chestName,
			slotNo: item.slotNo,
			count: item.count
		});
	}
	for (const item of rewardData) {
		const tr = document.createElement('tr');
		let chestCount;
		count_loop: for (const chest of chests) {
			if (item.chestId == chest.chestId && item.slotNo == chest.slotNo) {
				chestCount = chest.count;
				break count_loop;
			}
		}
		let percent = (item.count / chestCount) * 100;
		percent = Math.round((percent + Number.EPSILON) * 100) / 100;
		if (item.reward.includes("scroll") || item.reward.includes("skin")) {
			tr.innerHTML = `<td>${counter}</td><td title="${item.chestId}" style="white-space: nowrap;">${item.chestName}</td><td>${item.slotNo}</td><td><div class="crop"><img src="${item.url}" title="${item.rewardSort.replace("0", "")}"></div></td><td>x${item.qty}</td><td>${item.count}</td><td>${percent}</td>`;
		} else {
			tr.innerHTML = `<td>${counter}</td><td title="${item.chestId}" style="white-space: nowrap;">${item.chestName}</td><td>${item.slotNo}</td><td><img src="${item.url}" title="${item.rewardSort.replace("0", "")}" style="height: 30px; width: auto"></td><td>x${item.qty}</td><td>${item.count}</td><td>${percent}</td>`;
		}
		counter++;
		table.appendChild(tr);
	}
	counterContainer.appendChild(table);
	const br = document.createElement('br');
	counterContainer.appendChild(br);
}