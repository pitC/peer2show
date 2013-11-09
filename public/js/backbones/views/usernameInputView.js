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
            "click #apply-bt": "setUserName",
            "keypress input[type=text]": "onEnter"
        },
        onEnter : function(event){
        	if (event.keyCode != 13) return;
			this.setUserName(event);
        },
        setUserName : function(event){
        	var roomId =  location.href.replace( /\/|:|#|%|\.|\[|\]/g , '');
        	
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