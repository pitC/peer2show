var ROOMS = "public/index.html";
var DEMO = "html/All-in-One.html";
var MAX_ROOM_SIZE = 1;
var PORT = 8080;
var static = require('node-static');
var http = require('http');
var file = new(static.Server)();

var express = require('express');
var rooms = require('./routes/rooms');
var app = express();
app.configure(function(){
	  app.use(express.bodyParser());
	  app.use(app.router);
});
 app.use("/js", express.static(__dirname + '/public/js'));
 app.use("/css", express.static(__dirname + '/public/css'));
 app.all('/', function(req, res){
	 	res.sendfile(ROOMS);
	 });
 app.all('/rooms', function(req, res){
 	res.sendfile(ROOMS);
 });
 app.all('/demo', function(req, res){
	 	res.sendfile(DEMO);
	 });
 
 app.all('/whiteboard.html', function(req, res){
	 	res.sendfile("whiteboard.html");
 });
 
 app.get('/api/rooms', rooms.findAll);
 app.post('/api/rooms', rooms.addRoom);
 app.put('/api/rooms/:id', rooms.addRoom);
 app.delete('/api/rooms/:id', rooms.deleteRoom);

var server = http.createServer(app).listen(PORT);

var io = require('socket.io').listen(server);
var channels = {};

io.sockets.on('connection', function (socket) {
    var initiatorChannel = '';
    if (!io.isConnected)
        io.isConnected = true;

    socket.on('new-channel', function (data) {
    	console.log("*NEW CHANNEL*"+JSON.stringify(data));
        channels[data.channel] = data.channel;
        onNewNamespace(data.channel, data.sender);
    });

    socket.on('presence', function (channel) {
    	console.log("*Check presence* "+channel);
        var isChannelPresent = !! channels[channel];
        socket.emit('presence', isChannelPresent);
        if (!isChannelPresent)
            initiatorChannel = channel;
    });

    socket.on('disconnect', function (channel) {
        if (initiatorChannel)
            channels[initiatorChannel] = null;
    });
});

function onNewNamespace(channel, sender) {
    io.of('/' + channel).on('connection', function (socket) {
        if (io.isConnected) {
            io.isConnected = false;
            socket.emit('connect', true);
        }

        socket.on('message', function (data) {
            if (data.sender == sender)
                socket.broadcast.emit('message', data.data);
        });
    });
};

