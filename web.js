var INDEX = "public/index.html";
var DEMO = "html/All-in-One.html";
var MAX_ROOM_SIZE = 1;
var LOCAL_PORT = 8080;
var static = require('node-static');
var http = require('http');

//var PeerServer = require('peer').PeerServer;
//var serverP = new PeerServer({port: 9000, path: '/myapp'});

var file = new(static.Server)();

var express = require('express');
var app = express();

var bugReporter = require('./backend/bugReporter');

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
 
 app.post('/issues', bugReporter.addIssue);

 app.listen(process.env.PORT || LOCAL_PORT);