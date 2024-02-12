const { ipcRenderer } = require('electron');
const noblox = require('noblox.js');
const cron = require('node-cron');

require('dotenv').config();

var queue = []

var game
var placeid
var imageUrl

async function checkGameStatus() {
    const currentUser = await noblox.setCookie(process.env.ROBLOX_TOKEN);
    console.log(`Logged in as ${currentUser.UserName} [${currentUser.UserID}]`);

    const presences = await noblox.getPresences([currentUser.UserID]);
    game = presences.userPresences[0].lastLocation
    placeid = presences.userPresences[0].placeId

    if (game === "Website") {
        imageUrl = '../assets/img/placeholder.png';

        const img = document.querySelector('img');
        img.src = imageUrl;
        img.width = 150
        img.height = 150
    } else {
        var gameInfo = `https://thumbnails.roblox.com/v1/places/gameicons?placeIds=${placeid}&returnPolicy=PlaceHolder&size=50x50&format=Png&isCircular=false`

        fetch(gameInfo).then(responce => responce.json()).then(data => {
            imageUrl = data.data[0].imageUrl

            imageUrl = imageUrl.replace("50/50", "150/150")

            const img = document.querySelector('img')
            img.src = imageUrl
        })
    }
}

cron.schedule("* * * * * *", () => {
    checkGameStatus();
})
