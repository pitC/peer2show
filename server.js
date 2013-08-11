var ROOM = "html/whiteboard.html";
var ROOMS = "public/index.html";
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
 
 app.all('/whiteboard.html', function(req, res){
	 	res.sendfile("whiteboard.html");
 });
 
 app.all('/room/:roomId', function(req, res){
	 	console.log("Get room: "+req.params.roomId);
	 	res.sendfile(ROOM);
 });
 
 app.get('/api/rooms', rooms.findAll);
 app.post('/api/rooms', rooms.addRoom);
 app.put('/api/rooms/:id', rooms.addRoom);
 app.delete('/api/rooms/:id', rooms.deleteRoom);

var server = http.createServer(app).listen(PORT);

var io = require('socket.io').listen(server);
io.sockets.on('connection', function (socket){

	function log(){
		var array = [">>> "];
	  for (var i = 0; i < arguments.length; i++) {
		  
		  
	  	array.push(arguments[i]);
	  }
	    socket.emit('log', array);
	}

	socket.on('message', function (message) {
		log('Got message: ', message);
		socket.broadcast.emit('message', message); // should be room only
	});

	socket.on('create or join', function (room) {
		var numClients = io.sockets.clients(room).length;

		log('Room ' + room + ' has ' + numClients + ' client(s)');
		log('Request to create or join room', room);

		if (numClients == 0){
			socket.join(room);
			socket.emit('created', room);
		} else if (numClients <= MAX_ROOM_SIZE) {
			io.sockets.in(room).emit('join', room);
			socket.join(room);
			socket.emit('joined', room);
		} else { // max two clients
			socket.emit('full', room);
		}
		socket.emit('emit(): client ' + socket.id + ' joined room ' + room);
		socket.broadcast.emit('broadcast(): client ' + socket.id + ' joined room ' + room);

	});

});

