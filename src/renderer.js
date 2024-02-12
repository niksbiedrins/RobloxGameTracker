// TODO: Use Cron to check every 1 second if the user is in a game, if user is in game send game detected message (pop up) else not

const noblox = require('noblox.js');
require('dotenv').config();

var game
var placeid

async function startApp() {
    // You MUST call setCookie() before using any authenticated methods [marked by 🔐]
    // Replace the parameter in setCookie() with your .ROBLOSECURITY cookie.
    const currentUser = await noblox.setCookie(process.env.ROBLOX_TOKEN);
    console.log(`Logged in as ${currentUser.UserName} [${currentUser.UserID}]`);

    // Get the presence information for the specified user IDs
    const presences = await noblox.getPresences([currentUser.UserID]);
    
    game = presences.userPresences[0].lastLocation
    placeid = presences.userPresences[0].placeId

    console.log(game);
    console.log(placeid);

    if (game === "Website") {
        console.log("User is not currently in a game")
    } else {
        console.log(`User is currently playing: ${game}`)
    }
}

startApp();
