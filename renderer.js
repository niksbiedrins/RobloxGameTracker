const { ipcRenderer, safeStorage } = require('electron');
const noblox = require('noblox.js');
const cron = require('node-cron');
const path = require('path');
const fs = require("fs")
require('dotenv').config();

const config = JSON.parse(fs.readFileSync(path.join(__dirname,"data","config.json")))

var game
var placeid
var imageUrl

async function checkStatus() {
  const currentUser = await noblox.setCookie(process.env.ROBLOX_TOKEN);
  //console.log(`Logged in as ${currentUser.UserName} [${currentUser.UserID}]`);

  const presences = await noblox.getPresences([currentUser.UserID]);
  game = presences.userPresences[0].lastLocation
  placeid = presences.userPresences[0].placeId

    if (game === "Website") {
        ipcRenderer.send('game_status', { status: 'No Game Detected', icon: 'dot_red.png' });

        placeholder = 'img/website.png';
        const img = document.querySelector('img');
        img.src = placeholder;
        img.width = 150
        img.height = 150

        return true;
    } else {
        ipcRenderer.send('game_status', { status: game, icon: 'dot_green.png' });

        var gameInfo = `https://thumbnails.roblox.com/v1/places/gameicons?placeIds=${placeid}&returnPolicy=PlaceHolder&size=50x50&format=Png&isCircular=false`
        fetch(gameInfo).then(responce => responce.json()).then(data => {
            imageUrl = data.data[0].imageUrl
            imageUrl = imageUrl.replace("50/50", "150/150")

            const img = document.querySelector('img')
            img.src = imageUrl
        })

        return false;
    }
}

let websiteState = false;

let task = cron.schedule("* * * * * *", async() => {
  let isWebsite = await checkStatus();
  if (websiteState != isWebsite) {
    if (isWebsite) {
      config["tracking"] = "false"
      fs.writeFileSync(path.join(__dirname,"data","config.json"), JSON.stringify(config, null, 2))

      console.log("In website")
    } else {
      console.log("In game")

      config["tracking"] = "true"
      fs.writeFileSync(path.join(__dirname,"data","config.json"), JSON.stringify(config, null, 2))

      ipcRenderer.send("trackgame", game, placeid)

      setTimeout(() => {
        ipcRenderer.send("trackstop")
      }, 5000)
    }
    websiteState = isWebsite;
  }
});


