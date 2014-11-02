define([ 
         'jquery', 
         'underscore', 
         'backbone',
         "i18n!nls/uiComponents"
         
], function($, _, Backbone,UIComponents){
	
	
	UserSettingsView = Backbone.View.extend({
		initialize:function (options) {
			
			options = options || {};
			
			this.template = _.template(options.template);
			
			this.listenTo(this.model, "change", this.render);
        },
        
        events : {
        	"click .save-btn":"save",
        	"change input": "resetFeedbackElements"
        		
        },
        
        save : function(){
        	// TODO: validate and handle errors
        	var self = this;
        	this.$el.find(".model-input").each(function(){
        		console.log(this);
        		var id = $(this).attr("id");
        		var val = $(this).val();
        		self.model.set(id,val);
        	});
        	
        	this.model.save(null,{
        		error:function(obj,err){
        			console.log("Saving error!");
        			console.log(err);
        			self.onSaveError();
        		},
        		success:function(){
        			self.onSaveSuccess();
        		}
        	});
        	this.wait();
        },
        

        render : function(){
        	var data = $.extend({},UIComponents,this.model.toJSON());
        	var mainElement = this.template(data);
        	this.$el.html(mainElement);
			return this;
        },
        
        toggleElements :function(disable){
        	this.$el.find("input").prop("disabled", disable);
        	this.$el.find(".save-btn").prop("disabled",disable);
        },
        
        wait : function(){
        	this.toggleElements(true);
        	this.$el.find(".save-btn").text("Saving...");
        },
        
        done : function(){
        	this.toggleElements(false);
        },
        
        onSaveError : function(){
        	this.done();
        	this.$el.find(".save-btn").text("Not saved!");
        	//.addClass("btn-danger");
        },
        
        onSaveSuccess : function(){
        	console.log("on save success!");
        	this.done();
        	this.$el.find(".save-btn").text("Saved!").addClass("btn-success");
        },
        
        resetFeedbackElements : function(){
        	console.log("input change!");
        	this.$el.find(".save-btn").text("Save").removeClass("btn-success");
        }
        
        
        
	});
	
	return UserSettingsView;
});