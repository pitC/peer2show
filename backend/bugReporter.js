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