exports.addIssue = function(req, res) {
	var issue = req.body;
	// TODO: handle post
	res.send(issue);
	console.log("Add issue!");
	var bitbucket = require('bitbucket-api');
	var credentials = {username: 'pitC', password: 'bleble'};
	var client = bitbucket.createClient(credentials);
	client.getRepository({slug: 'adhocShow', owner: 'pitC'}, function (err, repository) {
	      if (err) {return done(err);}
	      console.log("Repo connected");
	      console.log(repository.issues);
	      console.log(repository.issues().get(function (err, issues) {
	          console.log(issues);
	        }));
	});
};

exports.getIssues = function(req,res){
	var bitbucket = require('bitbucket-api');
	var credentials = {username: 'pitC', password: 'bleble'};
	var client = bitbucket.createClient(credentials);
	client.getRepository({slug: 'adhocShow', owner: 'pitC'}, function (err, repository) {
	      if (err) {return done(err);}
	      console.log("Repo connected");
	      console.log(repository.issues);
	      console.log(repository.issues());
	});
};

var keen = null;

var KEEN_CLIENT_COLLECTION = "peershow_client";

var initKeen = function(){
	Keen = require('keen.io');
	keen = Keen.configure({
	    projectId: "534add50d97b85370300000f",
	    writeKey: "9d303030e2564557612c76dde191920bf249628230f20ee9d8cb4b0d7bd46f7df1cec46bab127e723e59c0eedde64324601e8498a05f7c5e928e55c39c33c234c1cc66d407357fdf4e02def7a95f2ade3bbdcebf9dc772e7e5d569e7c024914373643d9e059568328155143005f2552f",
	    readKey: "a2e3f92aa3f8a43037929bf6058980af15d01753351de0e51d471fe74f1766f8552ba2f8faa2280436af13e4e80000f95a5c0f88717d91a75352a3717afe1ca094317cd19346bdc240f2cf7b5975187bcba4e81cf845de812ff0ebfd4145c3cea64956a5aaa1392827fdff90aa08ef12"
	});
	console.log("Keen configured");
};

exports.logEvent = function(req, res){
	

	
	if (keen == null){
		initKeen();
	}
	
	var event = req.body;
	
	console.log(req);
	
	console.log("Log event: "+event);
	console.log(event);
	console.log("Origin: "+req.headers.host);
	var hostName = req.headers.host;
	
	// only if event is not null and no localhost - do not propagate dev errors to keen 
	if (event && hostName.indexOf("localhost") == -1){
		keen.addEvent(KEEN_CLIENT_COLLECTION, event, function(err, res) {
		    if (err) {
		        console.log("Oh no, an error!");
		    } else {
		        console.log("Hooray, it worked!");
		    }
		});
	}
	res.send(200);

};