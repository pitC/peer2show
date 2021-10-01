/**
 * New node file
 */

var LOCAL = 'mongodb://localhost:51702/peershow'

module.exports = {
	  'url' : process.env.MONGOHQ_URL||LOCAL
};
