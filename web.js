var INDEX = "public/index.html";
var INDEX_PL = "public/index_pl.html";
var MAX_ROOM_SIZE = 1;
var LOCAL_PORT = 8080;
var static = require('node-static');
var http = require('http');

//var PeerServer = require('peer').PeerServer;
//var serverP = new PeerServer({port: 9000, path: '/myapp'});

var file = new(static.Server)();

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser());

var bugReporter = require('./backend/bugReporter');


 app.use("/js", express.static(__dirname + '/public/js'));
 app.use("/css", express.static(__dirname + '/public/css'));
 app.use("/fonts", express.static(__dirname + '/public/fonts'));
 app.use("/img", express.static(__dirname + '/public/img'));
 app.use("/site", express.static(__dirname + '/public/site'));
 app.all('/', function(req, res){
	 	console.log( req.headers["accept-language"]);
	 	
	 	console.log(req.query.lan);
	 	if (req.headers["accept-language"][0].indexOf("pl") > -1){
	 		console.log("PL header");
	 		res.sendfile(INDEX_PL);
	 	}
	 	else if (req.query.lan=="pl"){
	 		res.sendfile(INDEX_PL);
	 	}
	 	else{
	 		res.sendfile(INDEX);
	 	}
 });
 
 app.post('/issues', bugReporter.addIssue);
 app.post('/event',bugReporter.logEvent);

 app.listen(process.env.PORT || LOCAL_PORT);
 
 console.log("App started!");
 