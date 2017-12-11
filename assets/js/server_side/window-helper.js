const electron = require('electron');
const BrowserView = electron.BrowserView
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
            height: 110
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

    fileConfigExists() {
        return store.exists();
    }

    setUserPreferences() {
        currentWindow = Main.getMainWindow();

        let { width, height, transparent, frame, toolbar } = store.get('windowBounds');
        currentWindow.setSize(width, height);

    }
}


// expose the class
module.exports = WindowHelper;