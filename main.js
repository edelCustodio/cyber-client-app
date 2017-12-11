const electron = require('electron');
const path = require('path');
const url = require('url');
const CyberClient = require('./assets/js/server_side/cyber-client');
const fs = require('fs')
let Store = require('./assets/js/server_side/file-helper')

// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
var server = null;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

const Menu = electron.Menu
const Tray = electron.Tray

let appIcon = null

var Main = {

  createWindow: function () {
    
    var fileName = 'start.html';
    var width = 800;
    var height = 600;

    var fileExist = false;
    //comprobar si existe el archivo user-preferences.json
    // if(fileConfigExist()) {
    //   fileName = 'index.html';
    //   width = 247;
    //   height = 60;
    //   fileExist = true;
    // }

    // Create the browser window.
    mainWindow = new BrowserWindow({
      width: width, 
      height: height,
      //  transparent: true,
      //  frame: false,
      //  toolbar: false,
      //  skipTaskbar: true,
      //  alwaysOnTop: true,
      //  resizable: false
    })

    // if(fileExist)
    //  mainWindow.setPosition(1, 3)
    
    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, fileName),
      protocol: 'file:',
      slashes: true
    }))

    //API
    let server = require('./assets/js/server_side/api')

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
    });

    //Try icon
    const iconName = process.platform === 'win32' ? 'app.ico' : 'app.ico'
    const iconPath = path.join(__dirname, iconName)
    appIcon = new Tray(iconPath)
    
    // const contextMenu = Menu.buildFromTemplate([{
    // label: 'Remove',
    // click: function () {
    //   event.sender.send('tray-removed')
    // }
    // }])
    
    appIcon.setToolTip('Skynet client.')
    //appIcon.setContextMenu(contextMenu)

    //Create cyber cafe server
    CyberClient.createCyberClient(mainWindow);
  },

  getMainWindow: function () {
    return mainWindow;
  },

  getApp: function () {
    return app;
  },

  
}

function fileConfigExist() {
  const userDataPath = (electron.app || electron.remote.app).getPath('userData');
  
  const pathFile = path.join(userDataPath, 'user-preferences.json');

  return fs.existsSync(pathFile);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', Main.createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (Main.createWindow === null) {
    Main.createWindow()
  }
})

module.exports = Main;