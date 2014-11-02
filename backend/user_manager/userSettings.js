var User = require('../models/user');

exports.getSettings = function(req,res,section){
		var username = req.user.username;
		User.findOne({'username':username},function(err,user){
			if(err){
				//TODO: handle error
				null;
			}
			if (!user){
				
			}
			console.log("Got settings:");
			
			var object = user.settings[section];
			console.log(object);
			res.send(object);		
		});
};

exports.updateSettings = function(req,res,section){
	var newSettings = req.body;
	console.log(newSettings);
	req.user.settings[section] = newSettings;
	req.user.save(function(err){
		if (err){
			console.log(err);
			//TODO: handle error
			res.status(409);
			
			res.send(err);
			
		}else{
			res.send(newSettings);
		}
		
	});
};

