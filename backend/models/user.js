/**
 * New node file
 */

//heroku:pPXbFCuYc4C5LsEV61bx-Ot7DLQY2pjrumPYYkv9aqm0dOg3MbrDCUT_qkLlv8LFtBbWbC2Ly7t_t2a7ZdKP5g@linus.mongohq.com:10093/app28849408

var mongoose = require('mongoose');

module.exports = mongoose.model('User',{
    username: String,
    password: String,
    email: String,
    passwordResetToken : String,
    passwordResetExpire : Date,
    settings:{
    	imageSettings:{
    		processImage:Boolean,
    		maxWidth:{type:Number,min:400,max:5000},
    		maxHeight:Number,
    		quality:Number
    	}
    }
});