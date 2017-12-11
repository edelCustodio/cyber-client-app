
let apiURL = "http://localhost:7070";

/**
 * Document Ready
 */
$(document).ready(function () {
    //getFileConfig();
})

function getFileConfig(ipAddress) {

    $.post(apiURL + '/fileExists', {ipAddress: ipAddress}, function(data){
        if (data.result) {
            sessionStorage.setItem('desktop', JSON.stringify(data.data));
            document.location.href = "index.html";
        }
    })
   
}

$('#frIPAddress').validator().on('submit', function (e) {
    
    if (e.isDefaultPrevented()) {
        // handle the invalid form...
    } else {
        // everything looks good!
        var ipServer = $("#ipServer").val();
        getFileConfig(ipServer);
    }

    e.preventDefault();
});