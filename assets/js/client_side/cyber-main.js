

window.$ = window.jQuery = require('jquery');
var electron = require('electron');  
var { app, BrowserWindow, ipcMain } = electron; 
var FlipClock = require('./assets/js/flipclock.js');
var bootstrap = require('bootstrap');
const os = require('os');
var { ipcRenderer, remote } = require('electron');  
var desktopInfo = {}
var hostnameInfo = {}
let apiURL = ''; //http://localhost:7070
let ipServer = '';
var moment = require('moment');


var clock = {};
ipcRenderer.send('goForIPServer', 1);

$(document).ready(function () {
    // Reply on async message from renderer process
});

/**
 * Listen for async message from renderer process
 */
ipcRenderer.on('getForIPServer', (event, arg) => {  
    var ips = JSON.parse(arg);
    sessionStorage.setItem('IPServer', ips.ipServer);
    apiURL = 'http://' + ips.ipServer + ':7070/';

    //move the clock lower-down right corner
    window.moveTo(screen.width, screen.height + 20);

    // obtener informacion de la maquina
    getDesktopInfo();
    
    // inicializar reloj
    clock = $('.your-clock').FlipClock({
        language:'es-es'
    });
    clock.stop();

});


/**
 * Inicializar reloj contador para el registro
 * del uso de la maquina
 * @param {*} params Objeto para inicializar el reloj
 */
function initializeClock(params) {
    var currentDate = new Date();
    var diff = 0;
    
    if(params.minutes > 0) { // count down
        var countDownValue = (currentDate.getTime() + (params.minutes * 60 * 1000));    
        diff = (countDownValue/1000) - (currentDate.getTime()/1000);

        //Start clock
        clock = $('.your-clock').FlipClock(diff, {
            language:'es-es',
            countdown: params.countDown,
            callbacks: {
                stop: function() {
                    stopClock(true);
                }
            }
        });
    } else { // clock start 0
        clock = $('.your-clock').FlipClock(diff, {
            language:'es-es',
        });
    }

    //Save record on database start time
    saveDesktopRecord(currentDate, params.minutes, params.idUsuario);
}

ipcRenderer.on('start', (event, arg) => {
    var params = JSON.parse(arg);
    initializeClock(params);
});

/**
 * Se ejecuta cuando la aplicacion esta cerrandose, en ese caso, necesitamos cambiar el estado
 * de la maquina cliente para que no sea vista mas por la aplicacion principal
 */
ipcRenderer.on('appClosed', (event, arg) => {
    var desktop = JSON.parse(sessionStorage.getItem('desktopInfo'));
    var data = { idComputadora: desktop.idComputadora, enLinea: false };
    $.post(apiURL + 'api/setDesktopOnline', data, function(data) {
        if(data.result)
            desktopInfo = data.data;
        else
            console.log(data);
    });
});

// Message from main process to stop to clock
ipcRenderer.on('stop', (event, arg) => {  
    stopClock(false);
});

// Close and update status if the app is closed
ipcRenderer.on('close', (event, arg) => {  
    stopClock(false);
    setDesktopOnline(false);
});

function stopClock(timeOff) {
    var currentDate = new Date();
    //Save record on database end time
    saveDesktopRecord(currentDate);

    if (timeOff)
        ipcRenderer.send('time-off', timeOff);
    else {
        clock.stop();
        clock.setTime(0);
    }
}

/**
 * Guardar el registro de uso de la computadora
 * @param {*} fecha fecha, puede ser fechaInicio o fechaFin
 * @param {*} minutos total de minutos de uso de la computadora
 */
function saveDesktopRecord(fecha, minutos = 0, idUsuario = 0) {
    var data = { idComputadora: desktopInfo.idComputadora, fecha: fecha, minutos: minutos, idUsuario: idUsuario }
    $.post(apiURL + 'api/desktopRecord', data, function(result) {
        if (result.length > 0) {
            console.log(result);
            ipcRenderer.send('record', JSON.stringify(result[0]));
        }
    });
}

function setDesktopOnline(status) {
    var data = { idComputadora: desktopInfo.idComputadora, enLinea: status };
    $.post(apiURL + 'api/setDesktopOnline', data, function(data) {
        if(data.result) {

            desktopInfo = data.data;
                
            setTimeout(() => {
                // obtener el ultimo registro de la maquina
                getLatestDesktopRecord();
            }, 100);
        }
            
        else
            console.log(data);
    })
}

function getDesktopInfo() {
    $.get(apiURL + 'api/getDesktop', { localAddress: ipServer, hostname: os.hostname() }, function(data) {
        desktopInfo = data[0];
        sessionStorage.setItem('desktopInfo', JSON.stringify(desktopInfo));
        setDesktopOnline(true);
        ipcRenderer.send('saveDesktopInfo', JSON.stringify(desktopInfo));
        
    })
}

function getLatestDesktopRecord() {
    if (sessionStorage.getItem('desktopInfo') !== null) {
        const desktop = JSON.parse(sessionStorage.getItem('desktopInfo'));
        $.get(apiURL + 'api/getLatestDesktopRecord', { idComputadora: desktop.idComputadora }, function(response) {
            if (response.result) {
                const latestRecord = response.data;
                setClockBasedOnLatestRecord(latestRecord);
            }
        })
    }
}

/**
 * Activar reloj si existe algun registro activo en la
 * base de datos
 * @param {*} latestRecord Ultimo registro de la maquina
 */
function setClockBasedOnLatestRecord(latestRecord) {
    let notifyServer = false;
    const currentDate = new Date();
    const fechaInicio = new Date(latestRecord.fechaInicio);
    let diff = 0;
    var countDownValue = (fechaInicio.getTime() + (latestRecord.minutos * 60 * 1000)); 

    // tiempo abierto
    if (latestRecord.fechaFin === null && latestRecord.minutos === 0) {
        diff = (currentDate.getTime()/1000) - (countDownValue/1000);

        clock = $('.your-clock').FlipClock(diff, {
            language:'es-es'
        });

        notifyServer = true;
    } else if (latestRecord.fechaFin === null && latestRecord.minutos > 0) { // cuenta regresiva
           
        diff = (countDownValue/1000) - (currentDate.getTime()/1000);

        //Start clock
        clock = $('.your-clock').FlipClock(diff, {
            language:'es-es',
            countdown: true,
            callbacks: {
                stop: function() {
                    stopClock(true);
                }
            }
        });

        notifyServer = true;
    }

    if (notifyServer) {
        ipcRenderer.send('record', JSON.stringify(latestRecord));
    }
}