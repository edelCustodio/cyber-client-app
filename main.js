const electron = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
const os = require('os');
const { ipcMain, ipcRenderer } = require('electron')

const configuration = require('./assets/js/server_side/file-helper')

const { autoUpdater } = require('electron-updater')
const isDev = require('electron-is-dev')
const log = require('electron-log');

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

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

// First instantiate the class
// const store = new Store({
//   // We'll call our data file 'user-preferences'
//   configName: 'user-preferences',
//   defaults: {
//       // 800x600 is the default size of our window
//       windowBounds: { 
//           width: 247, 
//           height: 60
//       },
//       IPServer: ''
//   }
// });

function sendStatusToWindow(text) {
  log.info(text);
  Main.getMainWindow().webContents.send('message', text);
}


var Main = {

  createWindow: function () {

    //check for updates
    autoUpdater.checkForUpdatesAndNotify();

    var fileName = 'start.html';
    var width = 800;
    var height = 600;

    //comprobar si existe el archivo user-preferences.json
    if(configuration.existFileConfig()) {
      fileName = 'index.html';
      var windowBounds = configuration.readSettings('windowBounds');
      width = windowBounds.width;
      height = windowBounds.height;

      CyberClient.createCyberClient(configuration.readSettings('IPServer'));
    } else {
      // create settings
     
    }

    // Create the browser window.
    mainWindow = new BrowserWindow({
      width: width, 
      height: height,
      // transparent: true,
      // frame: false,
      toolbar: false,
      skipTaskbar: true,
      alwaysOnTop: true,
      resizable: false
    })
    
    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, fileName),
      protocol: 'file:',
      slashes: true
    }))

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();

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
    
  },

  getMainWindow: function () {
    return mainWindow;
  },

  getApp: function () {
    return app;
  },

  
}


/**
 * Update app
 */
autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
})
autoUpdater.on('update-available', (info) => {
  sendStatusToWindow('Update available.');
})
autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow('Update not available.');
})
autoUpdater.on('error', (err) => {
  sendStatusToWindow('Error in auto-updater. ' + err);
})
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  sendStatusToWindow(log_message);
})
autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow('Update downloaded');
});

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

autoUpdater.on('checking-for-update', () => {
  autoUpdater.checkForUpdates();
})

/**
 * Message communication
 */
ipcMain.on('sendIPServer', (event, arg) => {
  var ipServer = arg;
  
  var jsonClientConfig = { hostname: os.hostname(), pathConfigFile: configuration.getFileConfig() }

  //comunicate client socket to the server
  CyberClient.createCyberClient(ipServer);

  if (!configuration.existFileConfig()) {
    configuration.saveSettings('windowBounds', { 'width': 247, 'height': 60 });
    configuration.saveSettings('hostname', os.hostname());
    configuration.saveSettings('IPServer', ipServer);
  }

  mainWindow.setSize(247, 60);
  event.sender.send('replyIPServer', JSON.stringify(jsonClientConfig));
});

// Listen for async-reply message from main process
ipcMain.on('goForIPServer', (event, arg) => {  
  // Print 2
  console.log(arg);
  // Send sync message to main process
  event.sender.send('getForIPServer', configuration.readSettings('IPServer'));
});





module.exports = Main;
const CyberClient = require('./assets/js/server_side/cyber-client');