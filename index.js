const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs')
const appverison = "1.0.0"

var appicon = path.join(__dirname, "icon", "rgticon.png")

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: `Roblox Game Tracker (${appverison})`,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.webContents.openDevTools();
};

var tray = null
var traylabel

//Tray Setup
app.whenReady().then(() => {
  tray = new Tray(appicon)

  ipcMain.on('game_status', (event, { status, icon }) => {
    const menuTemplate = [
      {
        label: status,
        icon: nativeImage.createFromPath(path.join(__dirname, "icon", icon)),
        enabled: false
      },
      {
        label: "",
        type: "separator"
      },
      {
        label: "Exit",
        //icon: nativeImage.createFromPath(path.join(__dirname,"img","close.png")).resize({ width: 16 }),
        click: () => {
          app.quit()
        }
      }
    ]
  
    const contextMenu = Menu.buildFromTemplate(menuTemplate)
    tray.setToolTip(`Roblox Game Tracker (${appverison})`)
    tray.setContextMenu(contextMenu)
  });

  ipcMain.on('create_new_window', () => {
    let newWindow = new BrowserWindow({ width: 800, height: 600 });
  });

  ipcMain.on('trackgame', (event, game, placeid) => {
    const trackwin = new BrowserWindow({
      width: 165,
      height: 65,
      title: 'trackwin',
      frame: false,
      resizable: false,
      movable: false,
      fullscreenable: false,
      focusable: false,
      skipTaskbar: true,
      transparent: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
        backgroundThrottling: false
      }
    })
    trackwin.setIgnoreMouseEvents(true)
    trackwin.setAlwaysOnTop(true, 'screen-saver')

    trackwin.loadFile(path.join(__dirname,"notify","track","track.html"))
    
    trackwin.once('ready-to-show', async () => {
        const configData = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "config.json")));
        try {
            if (configData.tracking == "true") {
                console.log("If Try working")
                trackwin.show()
            } else {
                trackwin.hide()
                console.log("else try working")
            }
        } catch {
            console.log("catch working")
            trackwin.show()
        }

        trackwin.webContents.send('track', game, placeid)
        console.log("sent webcontents")
    })

    ipcMain.on("trackstop", () => {
      trackwin.destroy()
      console.log("destroyed window")
    }) 
  });
});

app.on('activate', () => {

  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('ready', createWindow);