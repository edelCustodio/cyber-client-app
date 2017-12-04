window.$ = window.jQuery = require('jquery');
var FlipClock = require('./assets/js/flipclock.js');
var bootstrap = require('bootstrap');
var { ipcRenderer, remote } = require('electron');  


var clock = $('.your-clock').FlipClock({
    language:'es-es'
});

$(document).ready(function () {
    clock.stop();
});

$("#stopClock").click(function(){
    clock.stop();
    
    var endDate = new Date();
    console.log(endDate);
    console.log(clock.getTime().time);
    console.log("clock stopped!");
    clock.reset();
});

$("#startClock").click(function(){
    clock.start();
    var startDate = new Date();
    console.log(startDate);
    console.log("clock started!");
});


ipcRenderer.on('start', (event, arg) => {
    clock.start();
    console.log(arg);
});

ipcRenderer.on('stop', (event, arg) => {  
    clock.stop();
    console.log(arg);
});

