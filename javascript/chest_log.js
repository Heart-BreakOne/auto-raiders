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

    let arrayData = await chrome.storage.local.get(['userChestsLog']);
    arrayData = arrayData.userChestsLog;
    
    //Sort the array based on the time they were added.
    if (!arrayData) {
      return
    }
    const sortedData = arrayData.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));

    //Populate the table with array data
    for (let i = 0; i < sortedData.length; i++) {
        const entry = sortedData[i];

        let chestId = entry.chestId;
        let rewards = entry.rewards;
        
        reward_loop: for (let j = 0; j < rewards.length; j++) {
            for (let i = 0; i < rewardData.length; i++) {
                if (rewardData[i].reward == rewards[j] && rewardData[i].chestId == chestId) {
                    rewardData[i].count++;
                    continue reward_loop;
                }
            }
            
            rewardData.push({
                chestId: entry.chestId,
                reward: rewards[j].replace("common",""),
                url: undefined,
                eventUid: entry.eventUid,
                count: 1
            });
        }
    }
    rewardData.sort((a, b) => a.chestId.localeCompare(b.chestId) || a.reward.localeCompare(b.reward));
    
    let items = await retrieveFromStorage("items");
    let currency = await retrieveFromStorage("currency");
    let imageURLs = await retrieveFromStorage("imageUrls");

    for (let i = 0; i < rewardData.length; i++) {
        if (rewardData[i].reward.includes("goldbag")) {
          rewardData[i].url = "https://d2k2g0zg1te1mr.cloudfront.net/env/prod1/mobile-lite/static/media/iconGold.6072909d.png";
        } else if (rewardData[i].reward.includes("epicpotion")) {
          rewardData[i].url = "https://d2k2g0zg1te1mr.cloudfront.net/env/prod1/mobile-lite/static/media/iconPotion.2c8f0f08.png";
        } else if (rewardData[i].reward.includes("cooldown")) {
          rewardData[i].url = "https://d2k2g0zg1te1mr.cloudfront.net/env/prod1/mobile-lite/static/media/iconMeat.5c167903.png";
        } else if (rewardData[i].reward.includes("eventtoken")) {
          Object.keys(imageURLs).forEach(function (key) {
            if (key === "mobilelite/events/" + rewardData[i].eventUid + "/iconEventToken.png") {
              rewardData[i].url = "https://d2k2g0zg1te1mr.cloudfront.net/" + imageURLs[key];
            }
          })
        } else if (rewardData[i].reward.includes("skin")) {
          Object.keys(imageURLs).forEach(function (key) {
            if (key === "mobilelite/units/static/" + rewardData[i].reward + ".png") {
              rewardData[i].url = "https://d2k2g0zg1te1mr.cloudfront.net/" + imageURLs[key];
            }
          });
        } else {
          let item;
          let itemReceived;
          if (rewardData[i].reward.includes("|")) {
            itemReceived = rewardData[i].reward.split("|")[1];
          } else {
            itemReceived = rewardData[i].reward;
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
              rewardData[i].url = "https://d2k2g0zg1te1mr.cloudfront.net/" + imageURLs[key];
            }
          })
        }
    }
}

function loadChestRewardCounter() {
    const counterContainer = document.querySelector('.counter-container');
    counterContainer.innerHTML = '';
    const table = document.createElement('table');
    table.setAttribute('style', 'width:20% !important; padding:0 !important');
    const header = document.createElement('tr');
    header.innerHTML = `<td>ChestId</td><td>Reward</td><td>Qty</td><td>Count</td>`;
    table.appendChild(header);
    // Loop through the data and create HTML elements
    for (const item of rewardData) {
        const tr = document.createElement('tr');
        let regex = /\d+/;
        let qty = regex.exec(item.reward)[0];
        if (item.reward.includes("scroll")) {
            tr.innerHTML = `<td>${item.chestId}</td><td><div class="crop"><img src="${item.url}" title="${item.reward}"></div></td><td>x${qty}</td><td>${item.count}</td>`;
        } else {
            tr.innerHTML = `<td>${item.chestId}</td><td><img src="${item.url}" title="${item.reward}" style="height: 30px; width: auto"></td><td>x${qty}</td><td>${item.count}</td>`;
        }
        table.appendChild(tr);
    };
    counterContainer.appendChild(table);
    const br = document.createElement('br');
    counterContainer.appendChild(br);
}