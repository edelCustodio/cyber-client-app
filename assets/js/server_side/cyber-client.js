const os = require('os');
const net = require('net');
const ip = require('ip');
let host = '';
const port = 6969;
const Main = require('../../../main')

 var CyberClient = {

    createCyberClient: function(ipServer) {
        
        var client = new net.Socket();
        host = ipServer;
        var ipClient = this.getIPClient();

        client.connect(port, host, function() {
        
            console.log('CONNECTED TO: ' + host + ':' + port);
            var json = { hostname: os.hostname(), IP: ipClient };
            client.write(JSON.stringify(json));
        });
          
        // Add a 'data' event handler for the client socket
        // data is what the server sent to this socket
        client.on('data', function(data) {
            var textData = data.toString('utf8');
            var jsonData = JSON.parse(textData);

            if (jsonData.start) {
                Main.getMainWindow().webContents.send('start', textData);
            } else {
                Main.getMainWindow().webContents.send('stop', 0);
            }
        });
        
        // Add a 'close' event handler for the client socket
        client.on('close', function() {

            //Obtener info computadora y actualizar estado computadora
            // Desktop.getDesktopByIPAddress(host).then(result => {
            //     var desktop = result[0];
            //     Desktop.updateDesktopOnline(desktop.idComutadora, false);
            // });
            
            console.log('Connection closed');
        });
        
      
        client.on('error', function(data){
          console.error(data.stack);
          console.log("Node NOT Exiting...");
        });
    },

    getIPClient: function () {
        var ipAddress = '';
        
        try {
            var ipWifi = ip.address('Wi-Fi');
            ipAddress = ipWifi;
        } catch (e) {
            console.log(e);
        }
        
        try {
            var ipEthernet = ip.address('Ethernet');
            ipAddress = ipEthernet;
        } catch (e) {
            console.log(e);
        }
        
        return ipAddress;
    }
 }

 module.exports = CyberClient;