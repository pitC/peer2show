var User = require('../models/user');
var bCrypt = require('bcrypt-nodejs');

var crypto = require('crypto');
var async = require('async');
var nodemailer = require('nodemailer');

exports.forgot = function(req, res){
	async.waterfall([
	                 // Step 1 - generate token
	                 function(done){
	                	 console.log("Step 1 - generate token");
	                	 crypto.randomBytes(20,function(err,buf){
	                		 var token = buf.toString('hex');
	                		 done(err,token);
	                	 });
	                 },
	                 // Step 2 - save token to database
	                 function(token, done){
	                	 console.log("Step 2 - save token to database");
	                	 User.findOne({email:req.body.email},function(err,user){
	                		 if (!user){
	                			 res.status(409);
		                         return res.send("No such user found");
	                		 }
	                		 user.passwordResetToken = token;
	                		 user.passwordResetExpire = Date.now()+900000; // 15 minutes
	                		 console.log("Date now: "+Date.now());
	                		 console.log("Password expires: "+user.passwordResetExpire);
	                		 user.save(function(err){
	                			 done(err,token,user);
	                		 });
	                	 });
	                 },
	                 // Step 3 - send email with reset link
	                 function(token,user,done){
	                	 console.log("Step 3 - send email");
	                	 var smtpTransport = nodemailer.createTransport({
	                		 service: 'SendGrid',
	                		 auth: {
	                			 user: 'peer2show',
	                			 pass: 'bUdrc4mdU'
	                		 }
	                	 });
	                	 var mailOptions = {
	                			 to: user.email,
	                			 from: 'passwordreset@peer2show.com',
	                			 subject: 'peer2show Password Reset',
	                			 text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
	                	          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
	                	          'http://' + req.headers.host + '/r/' + token + '\n\n' +
	                	          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
	                	 };
	                	 smtpTransport.sendMail(mailOptions, function(err) {
	                		 done(err, 'done');
	                	 });
	                 }
	                ],function(err) {
						console.log(err);
	    				if (err){
	    					res.send(err);
	    				}
	    				else{
	    					res.send("done");
	    				}
	    				
	  				}
	);
};


exports.reset = function(req, res){
	  async.waterfall([
	                   function(done) {
	                	 
	                	 var process = function(err, user) {
		                       if (!user) {
		                    	   	console.log('Password reset token is invalid or has expired.');
		                         	res.status(409);

		                         	return res.send("Password reset token is invalid or has expired.");
		                       }
		                       // if no token then check if old password is correct
		                       if (!req.body.token){
		                    	   if (!isValidPassword(user,req.body.oldPassword)){
		                    		   res.status(409);
		                    		   return res.send("Old password incorrect");
		                    	   }
		                       }
		                       
		                       if (req.body.password !== req.body.passwordConfirm){
		                    	   	res.status(409);
		                    	   	return res.send("Passwords not same");

		                       }

		                       user.password = createHash(req.body.password);
		                       
		                       user.passwordResetToken = undefined;
		                       user.passwordResetExpire = undefined;

		                       user.save(function(err) {
		                         req.logIn(user, function(err) {
		                           done(err, user);
		                         });
		                       });
		                     };
	                	 if (req.isAuthenticated()){
	                		 
	                		 User.findOne({'username':req.user.username},process);
	                	 }
	                	 else{
	                		 User.findOne({ passwordResetToken: req.body.token, passwordResetExpire: { $gt: Date.now() } }, process);
	                	 }
	                   },
	                   function(user, done) {
	                     var smtpTransport = nodemailer.createTransport({
	                       service: 'SendGrid',
	                       auth: {
	                    	   user: 'peer2show',
	                    	   pass: 'bUdrc4mdU'
	                       }
	                     });
	                     var mailOptions = {
	                       to: user.email,
	                       from: 'passwordreset@peer2show.com',
	                       subject: 'Your password has been changed',
	                       text: 'Hello,\n\n' +
	                         'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
	                     };
	                     smtpTransport.sendMail(mailOptions, function(err) {	                      
	                       done(err);
	                     });
	                   }
	                 ], function(err) {
		  					console.log(err);
		  					if (err){
		  						res.send(err);
		  					}
		  					else{
		  						res.send("done");
		  					}
	  					}
	  );
};

//Generates hash using bCrypt
var createHash = function(password){
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};

var isValidPassword = function(user, password){
	var check = false;
	try{
		check = bCrypt.compareSync(password, user.password);
	}
	catch(err){
		// do nothing
		null;
	}
    return	check; 
};