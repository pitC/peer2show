exports.addIssue = function(req, res) {
	var issue = req.body;
	console.log("New issue!");
	console.log(issue);
	res.send(issue);
	
};