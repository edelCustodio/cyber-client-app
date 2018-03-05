

window.$ = window.jQuery = require('jquery');
var FlipClock = require('./assets/js/flipclock.js');
var bootstrap = require('bootstrap');
var { ipcRenderer, remote } = require('electron');  
var desktopInfo = {}
var hostnameInfo = {}
let apiURL = ''; //http://localhost:7070
let ipServer = '';

var clock = {};

$(document).ready(function () {
    ipServer = sessionStorage.getItem('IPServer');
    apiURL = 'http://' + ipServer + ':7070/';
    
    hostnameInfo = JSON.parse(sessionStorage.getItem('hostnameInfo'));
    desktopInfo = JSON.parse(sessionStorage.getItem('desktopInfo'));

    //move the clock lower-down right corner
    window.moveTo(screen.width, screen.height + 20);

    getDesktopInfo();
    clock = $('.your-clock').FlipClock({
        language:'es-es'
    });
    clock.stop();
});

//Start clock depending of values
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
    saveDesktopRecord(currentDate);
}

ipcRenderer.on('start', (event, arg) => {
    var params = JSON.parse(arg);
    initializeClock(params);
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
        clock.reset();
    }
}

function saveDesktopRecord(fecha) {
    var data = { idComputadora: desktopInfo.idComputadora, fecha: fecha }
    $.post(apiURL + 'api/desktopRecord', data, function(result) {
        if (result.length > 0) {
            console.log(result);
            ipcRenderer.send('record', JSON.stringify(result[0]));
        }
        
    })
}

function setDesktopOnline(status) {
    var data = { idComputadora: desktopInfo.idComputadora, enLinea: status };
    $.post(apiURL + 'api/setDesktopOnline', data, function(data) {
        if(data.result)
            desktopInfo = data.data;
        else
            console.log(data);
    })
}

function getDesktopInfo() {
    $.get(apiURL + 'api/getDesktop', { localAddress: ipServer, hostname: hostnameInfo.hostname }, function(data) {
        desktopInfo = data[0];
        sessionStorage.setItem('desktopInfo', JSON.stringify(desktopInfo));
        setDesktopOnline(true);
    })
}

