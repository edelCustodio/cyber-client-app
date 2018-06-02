const os = require('os');
const net = require('net');
const ip = require('ip');
let host = '';
const port = 6969;
const Main = require('../../../main');
const { ipcMain } = require('electron');
let client = null;
var parentActive = false;
var intervalConnect = false;
const configuration = require('./file-helper');
let _ipServer = '';
let _ipClient = '';

 var CyberClient = {

    createCyberClient: function(ipMachine, ipClient) {
        client = new net.Socket();
        host = ipMachine;
        _ipServer = configuration.readSettings('IPMachine');
        _ipClient = configuration.readSettings('IPClient');
        const $this = this;
        parentActive = false;

        client.connect(port, host, function() {
            if (!parentActive) {
                $this.clearIntervalConnect();
                console.log('CONNECTED TO: ' + host + ':' + port);
                var json = { hostname: os.hostname(), IP: ipClient };
                client.write(JSON.stringify(json));
                parentActive = true;
            } else {
                client.destroy();
            }          
        });
          
        // Add a 'data' event handler for the client socket
        // data is what the server sent to this socket
        client.on('data', function(data) {
            var textData = data.toString('utf8');
            var jsonData = JSON.parse(textData);

            if (!client.destroyed) {
                if (jsonData.start) {
                    Main.getMainWindow().webContents.send('start', textData);
                } else {
                    Main.getMainWindow().webContents.send('stop', 0);
                }
            }
        });
        
        // Add a 'close' event handler for the client socket
        client.on('close', function() {
            parentActive = false;
            //Obtener info computadora y actualizar estado computadora            
            // client.write(JSON.stringify({ closeApp: true, hostname: os.hostname() }));
            // client.end(());
            client.destroy();
            $this.launchIntervalConnect();
            console.log('Connection closed');
        });
        
      
        client.on('error', function(data) {
            client.destroy();
            $this.launchIntervalConnect();
            console.error(data.stack);
            console.log("Node NOT Exiting...");
            parentActive = false;
        });
    },

    launchIntervalConnect() {
        if(false != intervalConnect) return
        intervalConnect = setInterval(reconnect.bind(), 5000)
    },

    clearIntervalConnect() {
        if(false == intervalConnect) return
        clearInterval(intervalConnect)
        intervalConnect = false;
    },

    getIPClient: function () {
        var ipAddress = '';
        
        try {
            var ipWifi = ip.address('Wi-Fi');
            ipAddress = ipWifi;
        } catch (e) {
            // console.log(e);
        }
        
        try {
            if(ipAddress === '') {
                var ipEthernet = ip.address('Ethernet');
                ipAddress = ipEthernet;
            }
        } catch (e) {
            // console.log(e);
        }

        if(ipAddress === '') {
            const ifaces = os.networkInterfaces();
            Object.keys(ifaces).forEach(ifname => {
                if(ifname.toLowerCase().indexOf('ethernet') >= 0) {
                    const eth = ifaces[ifname];
                    eth.forEach(ipObj => {
                        if(ipObj.family === 'IPv4') {
                            ipAddress = ipObj.address;
                        }
                    });
                }
            });
        }
        
        return ipAddress;
    },

    getClientSocket: function() {
        return client;
    }
 }

 /**
  * Reconectar socket
  */
 function reconnect() {
    CyberClient.createCyberClient(_ipServer, _ipClient);
 }

ipcMain.on('time-off', (event, arg) => {  
    client.write(JSON.stringify({ stopBy: 'time-off', client: os.hostname() }));
});

ipcMain.on('record', (event, arg) => {  
    client.write(arg);
});

 module.exports = CyberClient;