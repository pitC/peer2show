var BUFFER_LENGTH = 300;
var INDEX_HTML = "rooms.html";

var ADAPTER_JS = "js/adapter.js";

var express = require('express');

var fs = require('fs');

var app = express.createServer(express.logger());

function printFile(fileName,response){
    response.writeHeader(200, {"Content-Type": "text/html"});
    var text = fs.readFileSync(fileName);
    response.write(text);
    response.end();
}

app.use("/js", express.static(__dirname + '/js'));

app.get('/index.html', function(request, response) {

    printFile(INDEX_HTML,response);
});

app.get('/room', function(request, response) {

    printFile("room.html",response);
});


var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});

var rtcPort = 8001;
var webRTC = requir1e('webrtc.io');
webRTC.listen(rtcPort);

