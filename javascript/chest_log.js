//Declaring/Initializing variables
let rewardData = [];

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

  isSuccess = [false, false];

  //Load the chest rewards log
  await loadUserChestsLog();
  loadChestRewardCounter();
});

async function loadUserChestsLog() {
    let items = await retrieveFromStorage("items");
    let currency = await retrieveFromStorage("currency");
    let imageURLs = await retrieveFromStorage("imageUrls");
    let allRewardData = [];
    let allUrlData = [];
    
    let arrayData = await chrome.storage.local.get(['userChestsLog']);
    arrayData = arrayData.userChestsLog;
    
    //Sort the array based on the time they were added.
    if (!arrayData) {
      return
    }
    const sortedData = arrayData.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));

    //Get the data container div
    const dataContainer = document.getElementById('dataContainer');
    dataContainer.style.textAlign = "justify";

    //Create a table 
    const tableElement = document.createElement('table');
    tableElement.id = "logTable";

    //Create table header row
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = '<th>ChestId</th><th>Time</th><th>Rewards</th>'

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
        
        for (let j = 0; j < rewards.length; j++) {
            let reward = rewards[j].replace("common","");
            for (let m = 1; m < 6; m++) {
                reward = reward.replace(`_${m}|`,`_0${m}|`);
            }
            let url;
            
            url_loop: for (let k = 0; k < allUrlData.length; k++) {
                if (allUrlData[k].reward == reward && allUrlData[k].eventUid == eventUid) {
                    url = allUrlData[k].url;
                    break url_loop;
                }
            }
            if (!url) {
                url = await getRewardUrl(reward, eventUid, items, currency, imageURLs);  
                allUrlData.push({
                    reward: reward,
                    url: url,
                    eventUid: eventUid
                });
            }
            
            allRewardData.push({
                chestId: chestId,
                slotNo: j + 1,
                dateTime: dateTime,
                reward: reward,
                url: url,
                eventUid: eventUid
            });
            
            if (reward.includes("scroll")) {
                rewardString += `<div class="crop"><img src="${url}" title="${reward}"></div>`
            } else {
                rewardString += `<img src="${url}" title="${reward}" style="height: 30px; width: auto">`
            }
        }
        
        //Convert the string to a Date object and get hour and minutes.
        const startingTime = getTimeString(new Date(entry.dateTime));
        const startingDate = new Date(entry.dateTime).toDateString();

        // Create a table row
        const row = document.createElement('tr');

        row.innerHTML = `<td>${chestId}</td>
            <td title="${startingDate}">${startingTime}</td>
            <td>${rewardString}</td>`

        // Append the row to the table
        tableElement.appendChild(row);
    }

    reward_loop: for (let j = 0; j < allRewardData.length; j++) {
        const entry = allRewardData[j];

        let chestId = entry.chestId;
        let slotNo = entry.slotNo;
        let reward = entry.reward;
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
            slotNo: slotNo,
            reward: reward,
            url: url,
            eventUid: eventUid,
            count: 1
        });
    }

    rewardData.sort((a, b) => a.chestId < b.chestId ? 1 : (a.chestId > b.chestId ? -1 : 0) || a.slotNo < b.slotNo ? -1 : (a.slotNo > b.slotNo ? 1 : 0) || a.reward.localeCompare(b.reward));

    // Append the table to the data container
    dataContainer.appendChild(tableElement);
}

async function getRewardUrl(reward, eventUid, items, currency, imageURLs) {
    if (reward.includes("goldbag")) {
        url = "https://d2k2g0zg1te1mr.cloudfront.net/env/prod1/mobile-lite/static/media/iconGold.6072909d.png";
    } else if (reward.includes("epicpotion")) {
        url = "https://d2k2g0zg1te1mr.cloudfront.net/env/prod1/mobile-lite/static/media/iconPotion.2c8f0f08.png";
    } else if (reward.includes("cooldown")) {
        url = "https://d2k2g0zg1te1mr.cloudfront.net/env/prod1/mobile-lite/static/media/iconMeat.5c167903.png";
    } else if (reward.includes("eventtoken")) {
        Object.keys(imageURLs).forEach(function (key) {
            if (key === "mobilelite/events/" + eventUid + "/iconEventToken.png") {
                url = "https://d2k2g0zg1te1mr.cloudfront.net/" + imageURLs[key];
            }
        })
    } else if (reward.includes("skin")) {
        Object.keys(imageURLs).forEach(function (key) {
            if (key === "mobilelite/units/static/" + reward + ".png") {
                url = "https://d2k2g0zg1te1mr.cloudfront.net/" + imageURLs[key];
            }
        });
    } else {
        let item;
        let itemReceived;
        if (reward.includes("|")) {
            itemReceived = reward.split("|")[1];
        } else {
            itemReceived = reward;
        }
        Object.keys(items).forEach(function (key) {
            if (key === itemReceived) {
                item = items[key].CurrencyTypeAwarded;
            }
        })
        Object.keys(currency).forEach(function (key) {
            if (key === item) {
                item = currency[key].UnitAssetName;
            }
        })
        Object.keys(imageURLs).forEach(function (key) {
            if (key === "mobilelite/units/static/" + item + ".png") {
                url = "https://d2k2g0zg1te1mr.cloudfront.net/" + imageURLs[key];
            }
        })
    }
    return url;
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
    table.setAttribute('style', 'width:20% !important; padding:0 !important');
    const header = document.createElement('tr');
    header.innerHTML = `<th>ChestId</th><th>Slot</th><th>Reward</th><th>Qty</th><th>Count</th><th>%</th>`;
    table.appendChild(header);
    // Loop through the data and create HTML elements
    let chests = [];
    item_loop: for (const item of rewardData) {
        for (const chest of chests) {
            if (item.chestId == chest.chestId && item.slotNo == chest.slotNo) {
                chest.count += item.count;
                continue item_loop;
            }
        }
        chests.push({
            chestId: item.chestId,
            slotNo: item.slotNo,
            count: item.count
        });
    }
    for (const item of rewardData) {
        const tr = document.createElement('tr');
        let regex = /\d+/;
        let qty = regex.exec(item.reward.replace("_0","_"))[0];
        let totalChestCount;
        count_loop: for (const chest of chests) {
            if (item.chestId == chest.chestId && item.slotNo == chest.slotNo) {
                chestCount = chest.count;
                break count_loop;
            }
        }
        let percent = (item.count / chestCount) * 100
        percent = Math.round((percent + Number.EPSILON) * 100) / 100
        if (item.reward.includes("scroll")) {
            tr.innerHTML = `<td>${item.chestId}</td><td>${item.slotNo}</td><td><div class="crop"><img src="${item.url}" title="${item.reward}"></div></td><td>x${qty}</td><td>${item.count}</td><td>${percent}</td>`;
        } else {
            tr.innerHTML = `<td>${item.chestId}</td><td>${item.slotNo}</td><td><img src="${item.url}" title="${item.reward}" style="height: 30px; width: auto"></td><td>x${qty}</td><td>${item.count}</td><td>${percent}</td>`;
        }
        table.appendChild(tr);
    };
    counterContainer.appendChild(table);
    const br = document.createElement('br');
    counterContainer.appendChild(br);
}