const Desktop = require('../models/computadora')
const os = require('os');
const net = require('net');
const ip = require('ip');

 var CyberClient = {

    createCyberClient: function(win) {
        mainWindow = win;
        var client = new net.Socket();
        var host = this.getIPServer();
        var port = 6969;

        client.connect(port, host, function() {
        
            console.log('CONNECTED TO: ' + host + ':' + port);
            
            Desktop.getDesktop(client.localAddress).then(res => {
                // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client 
                client.write(JSON.stringify(res));
            })
            
        });
          
        // Add a 'data' event handler for the client socket
        // data is what the server sent to this socket
        client.on('data', function(data) {
            var textData = data.toString('utf8');
            var jsonData = JSON.parse(textData)

            if (jsonExample.start) {
                mainWindow.webContents.send('start', textData);
            } else {
                mainWindow.webContents.send('stop', 0);
            }
        });
        
        // Add a 'close' event handler for the client socket
        client.on('close', function() {
            console.log('Connection closed');
        });
        
      
        client.on('error', function(data){
          console.error(data.stack);
          console.log("Node NOT Exiting...");
        });
    },

    getIPServer: function () {
        return ip.address();//get IP server from config file using fs 
    }
 }

 module.exports = CyberClient;