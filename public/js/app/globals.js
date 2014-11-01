define([
        "backbones/models/userModel"
], function (UserModel) {
	
	var globals =  {
		
		router : null,
		user : null,
		
		init : function(){
			this.user = new UserModel();
		}
		
	};
	
	
	
	return globals;
});