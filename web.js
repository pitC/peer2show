var INDEX = "public/index.html";
var DEMO = "html/All-in-One.html";
var MAX_ROOM_SIZE = 1;
var LOCAL_PORT = 8080;
var static = require('node-static');
var http = require('http');
var file = new(static.Server)();

var express = require('express');
var app = express();
app.configure(function(){
	  app.use(express.bodyParser());
	  app.use(app.router);
});
 app.use("/js", express.static(__dirname + '/public/js'));
 app.use("/css", express.static(__dirname + '/public/css'));
 app.use("/fonts", express.static(__dirname + '/public/fonts'));
 app.use("/img", express.static(__dirname + '/public/img'));
 app.use("/site", express.static(__dirname + '/public/site'));
 app.all('/', function(req, res){
	 	res.sendfile(INDEX);
	 });
 app.all('/demo', function(req, res){
	 	res.sendfile(DEMO);
	 });
 
var server = http.createServer(app).listen(process.env.PORT || LOCAL_PORT);

var io = require('socket.io').listen(server);
var channels = {};
// set logging to WARN	 0 - error 1 - warn 2 - info 3 - debug
io.set('log level', 1);
io.sockets.on('connection', function (socket) {
    var initiatorChannel = '';
    if (!io.isConnected)
        io.isConnected = true;

    socket.on('new-channel', function (data) {
    	console.log("*NEW CHANNEL*"+JSON.stringify(data));
    	var isChannelPresent = !! channels[data.channel];
    	if (!isChannelPresent){
	        channels[data.channel] = data.channel;
	        onNewNamespace(data.channel, data.sender);
    	};
    });

    socket.on('presence', function (channel) {
    	
        var isChannelPresent = !! channels[channel];
        socket.emit('presence', isChannelPresent);
        console.log("*Check presence* "+channel+":"+isChannelPresent);
        if (!isChannelPresent)
            initiatorChannel = channel;
    });

    socket.on('disconnect', function (channel) {
    	console.log("Disconnect on main ns "+initiatorChannel+" "+channel);
    	if (initiatorChannel){
    		var roomEmpty = isRoomEmpty(initiatorChannel);
    		if (roomEmpty){
    			console.log("Room empty, close channel!");
        		channels[initiatorChannel] = null;
    		};
    	};
    });
});

function getNamespace(channel){
	return "/"+channel;
}

function getChannelId(namespace){
	var channelId = namespace.substr(1,namespace.length);
	return channelId;
}

function isRoomEmpty(channel){
	var clients = io.of('/' + channel).clients();
	console.log(clients.length);
	var roomEmpty = !clients || (clients.length==1);
	return roomEmpty;
}



function onNewNamespace(channel, sender) {
    io.of('/' + channel).on('connection', function (socket) {
    	console.log("On connection in namespace "+socket.namespace.name+" "+io.isConnected);
    	
        if (io.isConnected) {
            io.isConnected = false;
            socket.emit('connect', true);
        }

        socket.on('message', function (data) {
        	//console.log("Broadcast message in namespace "+socket.namespace.name+"\n"+JSON.stringify(data)+" of sender "+sender);
        	
            
            //if (data.sender == sender){
                socket.broadcast.emit('message', data.data);
            //}
    	});
        
        socket.on('disconnect', function (channel) {
        	console.log("Disconnect! namespace "+socket.namespace.name+" "+channel);
        	var channel = getChannelId(socket.namespace.name);
        	var roomEmpty = isRoomEmpty(channel);
        	if (roomEmpty){
        		console.log("Room empty, close channel!");
        		channels[channel] = null;
        	};
        });
    });
};

