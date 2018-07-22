

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
var _idUsuario = 0;
var isCountDown = false;


var clock = {};
ipcRenderer.send('goForIPServer', 1);

$(document).ready(function () {
    if ($.isEmptyObject(desktopInfo)) {
        ipcRenderer.send('requestDesktopInfo', 1);
    }

    ipcRenderer.send('init', 1);
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

        isCountDown = true;
    } else { // clock start 0
        clock = $('.your-clock').FlipClock(diff, {
            language:'es-es',
        });
    }

    //Save record on database start time
    saveDesktopRecord(currentDate, params.minutes, _idUsuario);
}

ipcRenderer.on('start', (event, arg) => {
    var params = JSON.parse(arg);
    _idUsuario = params.idUsuario;
    initializeClock(params);
});

// Message from main process to stop to clock
ipcRenderer.on('stop', (event, arg) => {
    if (isCountDown) {
        // clock.callbacks.stop = null;
        clock = $('.your-clock').FlipClock(0, {
            language:'es-es',
        });
        isCountDown = false;
    }
    
    stopClock(false);
});

// Close and update status if the app is closed
ipcRenderer.on('close', (event, arg) => {  
    stopClock(false);
});

/**
 * Obtiene la informacion de la computadora la cual es enviada
 * desde la maquina de cobro
 */
ipcRenderer.on('desktopInfo', (event, arg) => {  
    desktopInfo = arg;
    sessionStorage.setItem('desktopInfo', JSON.stringify(desktopInfo));
});

// Close and update status if the app is closed
ipcRenderer.on('init', (event, arg) => {  
    setClockBasedOnLatestRecord(arg);
});

/**
 * Detiene el reloj
 * @param {*} timeOff 
 */
function stopClock(timeOff) {
    var currentDate = new Date();
    //Save record on database end time
    saveDesktopRecord(currentDate, 0, _idUsuario, timeOff);

    if (!timeOff) {
        clock.stop();
        clock.setTime(0);
    }
}

/**
 * Notifica a la maquina de cobro, el momento en que la
 * maquina cliente fue inicializado el reloj of fue detenido
 * @param {*} fecha fecha, puede ser fechaInicio o fechaFin
 * @param {*} minutos total de minutos de uso de la computadora
 */
function saveDesktopRecord(fecha, minutos = 0, idUsuario = 0, timeOff = false) {

    if ($.isEmptyObject(desktopInfo)) {
        desktopInfo = JSON.parse(sessionStorage.getItem('desktopInfo'));
    }


    var json = {
        fecha: fecha,
        minutos: minutos,
        idUsuario: idUsuario,
        idComputadora: desktopInfo.idComputadora
    }

    if (timeOff) {
        json.timeOff = { stopBy: 'time-off', client: desktopInfo.nombre };
    }

    ipcRenderer.send('record', JSON.stringify(json));

}



/**
 * Activar reloj si existe algun registro activo en la
 * base de datos
 * @param {*} latestRecord Ultimo registro de la maquina
 */
function setClockBasedOnLatestRecord(latestRecord) {
    if (!$.isEmptyObject(latestRecord)) {
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
            //ipcRenderer.send('record', JSON.stringify(latestRecord));
        }
    }
}