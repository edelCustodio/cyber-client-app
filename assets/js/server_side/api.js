let express = require('express')
let bodyParser = require("body-parser")
let WindowHelper = require('./window-helper')
let app = express()
let desktop = require('../models/computadora')

const wHelper = new WindowHelper()

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/**
 * Comprobar archivo de configuracion existente en el sistema de archivos.
 */
app.post('/fileExists', function (req, res) {
    try {
        var ipAddress = req.body.ipAddress;
        var desktopInfo = {}

        if(!wHelper.fileConfigExists()) {
            wHelper.saveIPServer(ipAddress);
            wHelper.setUserPreferences();
        }

        desktop.getDesktopByName().then(result1 => {
            desktopInfo = result1[0];
            //Change desktop status
            desktop.updateDesktopOnline(desktopInfo.idComputadora, true).then(result2 => {
                res.json({ result: true, data: result2[0] });
            });
        });
    } catch (e) {
        res.json({ result: false, message: e });
    }
    
});

app.post('/desktopRecord', function(req, res) {
    var idComputadora = req.body.idComputadora;
    var fecha = new Date(req.body.fecha);

    desktop.updateDesktopRecord(idComputadora, fecha).then(result => {
        res.json(result);
    })
})


app.listen(7070)