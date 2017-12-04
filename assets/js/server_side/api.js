let express = require('express')
let bodyParser = require("body-parser")
let app = express()
let WindowHelper = require('./window-helper')
const wHelper = new WindowHelper()

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/**
 * Comprobar archivo de configuracion existente en el sistema de archivos.
 */


app.post('/fileExists', function (req, res) {
    try {
        var ipAddress = req.body.ipAddress;
        wHelper.saveIPServer(ipAddress);
        wHelper.setUserPreferences();
        res.json({result: true});
    } catch (e) {
        res.json({ result: false, message: e });
    }
    
})


app.listen(7070)