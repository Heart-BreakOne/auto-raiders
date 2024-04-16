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
    let skins = await retrieveFromStorage("skins");
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
            let reward = rewards[j];
            let rewardSort;
            if (reward.includes("scroll")) {
                let regex = /\|scroll.+/;
                let match = regex.exec(reward);
                rewardSort = "0" + match[0].replace("|scroll","") + " scrolls";
            } else {
                rewardSort = reward;
            }

            let regex = /\d+/;
            let match = regex.exec(reward);
            let qty = match ? match[0] : 1;

            let url;
            
            url_loop: for (let k = 0; k < allUrlData.length; k++) {
                if (allUrlData[k].reward == reward && allUrlData[k].eventUid == eventUid) {
                    url = allUrlData[k].url;
                    break url_loop;
                }
            }
            if (!url) {
                url = await getRewardUrl(reward, eventUid, items, currency, imageURLs, skins);  
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
                rewardSort: rewardSort,
                qty: qty,
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

async function getRewardUrl(reward, eventUid, items, currency, imageURLs, skins) {
    url = "";
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
                return;
            }
        })
    } else if (reward.includes("skin")) {
        let skin;
        Object.keys(skins).forEach(function (key) {
            if (key === reward) {
                skin = skins[key].BaseAssetName;
                return;
            }
        });
        Object.keys(imageURLs).forEach(function (key) {
            if (key === "mobilelite/units/static/" + skin + ".png") {
                url = "https://d2k2g0zg1te1mr.cloudfront.net/" + imageURLs[key];
                return;
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
                return;
            }
        })
        Object.keys(currency).forEach(function (key) {
            if (key === item) {
                item = currency[key].UnitAssetName;
                return;
            }
        })
        Object.keys(imageURLs).forEach(function (key) {
            if (key === "mobilelite/units/static/" + item + ".png") {
                url = "https://d2k2g0zg1te1mr.cloudfront.net/" + imageURLs[key];
                return;
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
    header.innerHTML = `<th>#</th><th>ChestId</th><th>Slot</th><th>Reward</th><th>Qty</th><th>Count</th><th>%</th>`;
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
            slotNo: item.slotNo,
            count: item.count
        });
    }
    for (const item of rewardData) {
        const tr = document.createElement('tr');
        count_loop: for (const chest of chests) {
            if (item.chestId == chest.chestId && item.slotNo == chest.slotNo) {
                chestCount = chest.count;
                break count_loop;
            }
        }
        let percent = (item.count / chestCount) * 100
        percent = Math.round((percent + Number.EPSILON) * 100) / 100
        if (item.reward.includes("scroll") || item.reward.includes("skin")) {
              tr.innerHTML = `<td>${counter}</td><td>${item.chestId}</td><td>${item.slotNo}</td><td><div class="crop"><img src="${item.url}" title="${item.rewardSort.replace("0","")}"></div></td><td>x${item.qty}</td><td>${item.count}</td><td>${percent}</td>`;
        } else {
              tr.innerHTML = `<td>${counter}</td><td>${item.chestId}</td><td>${item.slotNo}</td><td><img src="${item.url}" title="${item.rewardSort.replace("0","")}" style="height: 30px; width: auto"></td><td>x${item.qty}</td><td>${item.count}</td><td>${percent}</td>`;
        }
        counter++;
        table.appendChild(tr);
    };
    counterContainer.appendChild(table);
    const br = document.createElement('br');
    counterContainer.appendChild(br);
}