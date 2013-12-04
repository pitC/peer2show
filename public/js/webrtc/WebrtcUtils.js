define(
	function(){
		return{
		  getLength : function(obj) {
	            var length = 0;
	            for (var o in obj)
	                if (o) length++;
	            return length;
		  }
		};
	}
);