window.$ = window.jQuery = require('jquery');
var FlipClock = require('./assets/js/flipclock.js');
var bootstrap = require('bootstrap');
var { ipcRenderer, remote } = require('electron');  


var clock = $('.your-clock').FlipClock({
    language:'es-es'
});

$(document).ready(function () {
    clock.stop();

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
    //Save record on database end time


    //Stop clock
    clock.stop();
});

