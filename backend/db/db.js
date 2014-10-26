/**
 * New node file
 */

var LOCAL = 'mongodb://heroku:pPXbFCuYc4C5LsEV61bx-Ot7DLQY2pjrumPYYkv9aqm0dOg3MbrDCUT_qkLlv8LFtBbWbC2Ly7t_t2a7ZdKP5g@linus.mongohq.com:10093/app28849408';

module.exports = {
	  'url' : process.env.MONGOHQ_URL||LOCAL
};
