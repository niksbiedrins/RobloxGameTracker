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

var profilepic

async function checkStatus() {
  const currentUser = await noblox.setCookie(process.env.ROBLOX_TOKEN);
  //console.log(`Logged in as ${currentUser.UserName} [${currentUser.UserID}]`);

  const presences = await noblox.getPresences([currentUser.UserID]);
  game = presences.userPresences[0].lastLocation
  placeid = presences.userPresences[0].placeId
  userid = currentUser.UserID

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

            //TODO Change this to the id/class
            document.getElementById("icon").src = imageUrl
        })
        
        return false;
    }
}

function getPlayerIcon(userid) {
  var profileurl
  var profileInfo = `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userid}&size=48x48&format=Png&isCircular=true`
    fetch(profileInfo).then(responce => responce.json()).then(data => {
      profileurl = data.data[0].imageUrl
  })
  return profileurl
}

function updateConfig(trackingValue) {
  const config = {
      tracking: trackingValue.toString()
  };

  fs.writeFileSync(path.join(__dirname, "data", "config.json"), JSON.stringify(config, null, 2));
}

function cleanString(string) {
  // Remove text surrounded by square brackets
  const cleanedString = string.replace(/\[.*?\]/g, '')
                              .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
                              .replace(/[\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F191}-\u{1F251}\u{2B50}\u{2B55}]/gu, '')
                              .replace(/[^\w\s]/gi, '');
  return cleanedString.trim(); 
}

let websiteState = false;

let task = cron.schedule("* * * * * *", async() => {
  let isWebsite = await checkStatus();
  if (websiteState != isWebsite) {
    if (isWebsite) {
      updateConfig(false)

      //Update index.html
      document.getElementById("game").innerHTML = "No Game Detected"
      document.getElementById("placeid").innerHTML = "No Place ID Detected"
    } else {
      updateConfig(true)

      //Clean up the game name
      fixedGameString = cleanString(game)

      //Update index.html
      document.getElementById("game").innerHTML = fixedGameString
      document.getElementById("placeid").innerHTML = placeid

      ipcRenderer.send("trackgame", game, placeid)

      setTimeout(() => {
        ipcRenderer.send("trackstop")
      }, 5000)
    }
    websiteState = isWebsite;
  }
});


