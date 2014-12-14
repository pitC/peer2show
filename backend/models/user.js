/**
 * New node file
 */

//heroku:pPXbFCuYc4C5LsEV61bx-Ot7DLQY2pjrumPYYkv9aqm0dOg3MbrDCUT_qkLlv8LFtBbWbC2Ly7t_t2a7ZdKP5g@linus.mongohq.com:10093/app28849408

var mongoose = require('mongoose');
var validator = require('../validators/userValidator');

module.exports = mongoose.model('User',{
    username: {type: String, validate : [validator.validateUsername, validator.rules.username.error]},
    password: {type: String, validate : [validator.validatePassword, validator.rules.password.error]},
    email: {type: String, validate : [validator.validateEmail, validator.rules.email.error]},
    passwordResetToken : String,
    passwordResetExpire : Date,
    settings:{
    	imageSettings:{
    		processImage:Boolean,
    		maxWidth:{type:Number,min:validator.rules.maxWidth.min,max:validator.rules.maxWidth.max},
    		maxHeight:{type:Number,min:validator.rules.maxHeight.min,max:validator.rules.maxHeight.max},
    		quality:Number
    	}
    }
});