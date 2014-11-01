define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'app/settings',
         'app/globals',
         'text!templates/homeUser/homeUserMain.html',
         "i18n!nls/uiComponents"
         
], function($, _, Backbone, Settings, Globals,HomeUserTmpl,UIComponents){
	
	
	HomeUserView = Backbone.View.extend({
		initialize:function (options) {
			
			options = options || {};
			
			this.template = _.template(HomeUserTmpl);
			this.model = Globals.user;
        },
        
        render : function(){
        	console.log("Render user home!");
        	console.log(this.model.getUsername());
        	var data = $.extend({},UIComponents,{username:this.model.username});
        	console.log(data);
        	var mainElement = this.template(data);
        	this.$el.html(mainElement);
			return this;
        }
	});
	
	return HomeUserView;
});