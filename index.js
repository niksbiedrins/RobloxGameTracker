const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain } = require('electron');
const path = require('path');
const appverison = "1.0.0"

var appicon = path.join(__dirname, "icon", "rgticon.png")

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.webContents.openDevTools();
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

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
});

app.on('activate', () => {

  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});