const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain } = require('electron');
const path = require('path');
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
    ]
  
    const contextMenu = Menu.buildFromTemplate(menuTemplate)
    tray.setToolTip(`Roblox Game Tracker (${appverison})`)
    tray.setContextMenu(contextMenu)
  });

  ipcMain.on('create_new_window', () => {
    let newWindow = new BrowserWindow({ width: 800, height: 600 });
  });
});

app.on('activate', () => {

  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('ready', createWindow);