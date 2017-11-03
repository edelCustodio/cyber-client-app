
var clock = $('.your-clock').FlipClock({
    // The onStart callback
	onStart: function() {
        // Do something
        var startLaunch = new Date();
        console.log(startLaunch);
        console.log("start launch!");
    },
    language:'es-es',
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
