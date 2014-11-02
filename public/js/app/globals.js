define([
        "backbones/models/userModel"
], function (UserModel) {
	
	var globals =  {
		
		router : null,
		user : null,
		windowStyle : "landing-page-style",
		
		init : function(){
			this.user = new UserModel();
		},
		
		switchWindowStyle : function(newWindowStyle){
			console.log("Switch window style from "+this.windowStyle+" to "+newWindowStyle);
			var objectClass = "."+this.windowStyle;
			$(".landing-page-style").removeClass("landing-page-style").addClass(newWindowStyle);
			$(objectClass).removeClass(this.windowStyle).addClass(newWindowStyle);
			
			this.windowStyle = newWindowStyle;
		}
	};
	
	
	
	return globals;
});