/**
 * New node file
 */

var LOCAL = 'mongodb://heroku_3z1rgh5v:ch5cjnla9sb2pgak967f1o23s2@ds151702.mlab.com:51702/heroku_3z1rgh5v'

module.exports = {
	  'url' : process.env.MONGOHQ_URL||LOCAL
};
