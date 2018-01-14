
let apiURL = "http://localhost:7070";
var ipcRenderer = require('electron').ipcRenderer;
var pathConfigFile = '';
var hostname = '';

/**
 * Document Ready
 */
$(document).ready(function () {
    //getFileConfig();
})

ipcRenderer.on('replyIPServer', (event, arg) => {
    location.href = 'index.html';
});


$('#frIPAddress').validator().on('submit', function (e) {
    
    if (!e.isDefaultPrevented()) {
        // everything looks good!
        var ipServer = $("#ipServer").val();
        ipcRenderer.send('sendIPServer', ipServer)
    }

    e.preventDefault();
});