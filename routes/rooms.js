var rooms = [
             {id:"test"},{id:"test2"}
             
             ];

exports.findAll = function(req,res){
	
	res.send(rooms);
};

exports.addRoom = function(req,res){
	var room = req.body;
	
	rooms.push(room);
};

exports.deleteRoom = function(req,res){
	var roomId = req.params.id;
	var index = 0;
	for (index=0; index<rooms.length; index++)
	{
		console.log("Loop "+index+":"+rooms[index].id);
		if (roomId == rooms[index].id){
			break;
		}
	}
	rooms.splice(index, 1);
};