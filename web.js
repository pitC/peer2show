var INDEX = "public/index.html";
var MAX_ROOM_SIZE = 1;
var LOCAL_PORT = 8080;
var static = require('node-static');
var http = require('http');

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
	 res.sendfile(INDEX);	
 });
 
 /*
  * USER MANAGEMENT PART
  * 
  * */
 
 
 
 
 
 
 
 
 
 /*
  * REMOTE LOGGING PART
  * 
  */
 
 app.post('/issues', bugReporter.addIssue);
 app.post('/event',bugReporter.logEvent);

 app.listen(process.env.PORT || LOCAL_PORT);
 
 console.log("App started!");
 