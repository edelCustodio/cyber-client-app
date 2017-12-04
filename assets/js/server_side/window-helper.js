const electron = require('electron');
let currentWindow = null;
let app = null;
let Store = require('./file-helper')
const Main = require('../../../main')
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow


 // First instantiate the class
 const store = new Store({
    // We'll call our data file 'user-preferences'
    configName: 'user-preferences',
    defaults: {
        // 800x600 is the default size of our window
        windowBounds: { 
            width: 320, 
            height: 110,
            transparent: true,
            frame: false,
            toolbar: false
        },
        IPServer: ''
    }
});
  

class WindowHelper {

    constructor() {
        
    }

    saveIPServer(IPServer) {
        store.set('IPServer', IPServer);
    }

    setUserPreferences() {
        currentWindow = Main.getMainWindow();
        app = Main.getApp();

        let { width, height, transparent, frame, toolbar } = store.get('windowBounds');
        currentWindow.setSize(width, height); // = new BrowserWindow({ width, height, transparent, frame, toolbar });
        currentWindow.setPosition(1,3)
        app.commandLine.appendSwitch('enable-transparent-visuals');
    }
}


// expose the class
module.exports = WindowHelper;