const electron = require('electron');
const path = require('path');
const url = require('url');

// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
const ipc = electron.ipcMain
const Menu = electron.Menu
const Tray = electron.Tray


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let appIcon = null

function createWindow () {
  
  // Create the browser window.
  mainWindow = new BrowserWindow({
      
    width: 800, 
    height: 600
      //width: 300, 
      //height: 150,
      //transparent: true
      //frame: false
    })

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  });

  //Tray icon
  ipc.on('put-in-tray', function (event) {
    const iconName = process.platform === 'win32' ? 'windows-icon.png' : 'iconTemplate.png'
    const iconPath = path.join(__dirname, iconName)
    
    appIcon = new Tray(iconPath)
    
    const contextMenu = Menu.buildFromTemplate([{
      label: 'Remove',
      click: function () {
        event.sender.send('tray-removed')
      }
    }])

    appIcon.setToolTip('Electron Demo in the tray.')
    appIcon.setContextMenu(contextMenu)
  })

  ipc.on('remove-tray', function () {
    appIcon.destroy()
  })

  //Create cyber cafe server
  createCyberClient();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

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
  if (mainWindow === null) {
    createWindow()
  }
})

//
app.on('window-all-closed', function () {
  if (appIcon) appIcon.destroy()
})



/**
 * Create cyber client
 */
function createCyberClient() {
  var net = require('net');
  var host = '127.0.0.1';
  var port = 6969;
  
  var client = new net.Socket();
  client.connect(port, host, function() {
  
      console.log('CONNECTED TO: ' + host + ':' + port);
      // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client 
      client.write('I am Chuck Norris!');
  
  });
    
  // Add a 'data' event handler for the client socket
  // data is what the server sent to this socket
  client.on('data', function(data) {
      
      console.log('DATA: ' + data);
      // Close the client socket completely
      //client.destroy();
      
  });
  
  // Add a 'close' event handler for the client socket
  client.on('close', function() {
      console.log('Connection closed');
  });
  

  client.on('error', function(data){
    console.error(data.stack);
    console.log("Node NOT Exiting...");
  });
  
}