define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'text!templates/slideshowApp/usernameInput.html'
         
         
], function($, _, Backbone, UserInputTmpl){
	
	
	UsernameInputView = Backbone.View.extend({
		initialize:function (options) {
			this.callback = options.callback; 
			this.template = _.template(UserInputTmpl);
        },
        events: {
            "click #apply-bt": "setUserName"
        },
        setUserName : function(event){
        	var roomId = window.location.hash;
        	
        	var userName = $("#username-inp").val();
        	var options = {roomId : roomId, user : userName};
        	this.callback(options);
        },
        render : function(){
        	this.$el.html(this.template());
			return this;
        }
	});
	
	return UsernameInputView;
});