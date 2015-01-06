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




 app.use("/js", express.static(__dirname + '/public/js'));
 app.use("/css", express.static(__dirname + '/public/css'));
 app.use("/fonts", express.static(__dirname + '/public/fonts'));
 app.use("/img", express.static(__dirname + '/public/img'));
 app.use("/site", express.static(__dirname + '/public/site'));
 app.all('/', function(req, res){
	 	res.sendfile(INDEX);
 });
 
 app.all('/s/*', function(req, res){
	 res.sendfile(INDEX);	
 });
 
 app.all('/home', function(req, res){
	 res.sendfile(INDEX);	
 });
 
 app.get('/r/*', function(req, res){
	 res.sendfile(INDEX);	
 });
 
 /*
  * USER MANAGEMENT PART
  * 
  * */
//
 var dbConfig = require('./backend/db/db');
 var mongoose = require('mongoose');
//Connect to DB
mongoose.connect(dbConfig.url); 
 

//Configuring Passport
 var passport = require('passport');
 var expressSession = require('express-session');
 
 app.use(expressSession({
	 secret: 'mySecretKey',
	 saveUninitialized: true,
     resave: true
     }));
 app.use(passport.initialize());
 app.use(passport.session());
 
 var initPassport = require('./backend/user_manager/init');
 initPassport(passport);
 
 var auth = function(req, res, next){
	  if (!req.isAuthenticated()) 
	  	res.send(401);
	  else
	  	next();
 };
 
 app.post('/login',passport.authenticate('login'),function(req,res){
	 res.send(req.user);
 });
 
 app.post('/signup',passport.authenticate('signup'),function(req,res){
	 
 });
 
 app.post('/logout',function(req,res){
	 req.logout();
	 res.send("logged out");
 });
 
 
 // check if logged in
 app.post('/autologin',auth,function(req,res){
	 res.send(req.user);
 });
 
 var passwordReset = require('./backend/user_manager/passwordReset');
 app.post('/forgot',passwordReset.forgot);
 app.post('/reset',passwordReset.reset);
 
 var userSettings = require('./backend/user_manager/userSettings');

 
 app.get('/settings/session',auth,function(req,res){
	 console.log("Got user settings request");
	 
	 userSettings.getSettings(req,res,'imageSettings');
 });
 
 app.put('/settings/session',auth,function(req,res){
	 console.log("Received put!");
	 userSettings.updateSettings(req,res,'imageSettings'); 
 });
 
 app.post('/settings/session',auth,function(req,res){
	 console.log("Received post!");
	 userSettings.updateSettings(req,res,'imageSettings'); 
 });
 
 
 /*
  * ICE Broker 
  */
 
 var iceBroker = require('./backend/iceBroker');
 
 app.post('/ice',iceBroker.getIceCandidates);
 
 
 
 
 
 /*
  * REMOTE LOGGING PART
  * 
  */
 var bugReporter = require('./backend/bugReporter');
 
 app.post('/event',bugReporter.logEvent);

 app.listen(process.env.PORT || LOCAL_PORT);
 
 console.log("App started!");
 