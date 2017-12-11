

window.$ = window.jQuery = require('jquery');
var FlipClock = require('./assets/js/flipclock.js');
var bootstrap = require('bootstrap');
var { ipcRenderer, remote } = require('electron');  
var desktopInfo = {}
let apiURL = "http://localhost:7070";

var clock = $('.your-clock').FlipClock({
    language:'es-es'
});

$(document).ready(function () {
    clock.stop();

    if(sessionStorage.getItem('desktop') !== null)
        desktopInfo = JSON.parse(sessionStorage.getItem('desktop'));

    //move the clock lower-down right corner
    window.moveTo(screen.width, screen.height + 20);
});

//Start clock depending of values
function initializeClock(params) {
    var currentDate = new Date();
    var diff = 0;
    
    if(params.minutes > 0) {
        var countDownValue = (currentDate.getTime() + (params.minutes * 60 * 1000));    
        diff = (countDownValue/1000) - (currentDate.getTime()/1000);
    }

    //Save record on database start time
    saveDesktopRecord(currentDate);

    //Start clock
    clock = $('.your-clock').FlipClock(diff, {
        language:'es-es',
        countdown: params.countDown
    });
}

ipcRenderer.on('start', (event, arg) => {
    var params = JSON.parse(arg);
    initializeClock(params);
});

ipcRenderer.on('stop', (event, arg) => {  
    var currentDate = new Date();
    //Save record on database end time
    saveDesktopRecord(currentDate);

    //Stop clock
    //clock.stop();

    //Reset clock
    clock.reset();
});


function saveDesktopRecord(fecha) {
    var data = { idComputadora: desktopInfo.idComputadora, fecha: fecha }
    $.post(apiURL + '/desktopRecord', data, function(data) {
        console.log(data);
    })
}
