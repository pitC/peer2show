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
        	"change input": "resetFeedbackElements",
        	"submit form" : "submitForm"
        },
        
        submitForm : function(event){
        	event.preventDefault();
        	this.save();
        },
        
        save : function(){
        	
        	var self = this;
        	this.hideValidationErrors();
        	
        	this.$el.find(".model-input").each(function(){
        		console.log(this);
        		var id = $(this).attr("id");
        		var val = $(this).val();
        		self.model.set(id,val);
        	});
        	
        	this.model.on('invalid', function(model, errors) {
    		    _.each(errors, function(error, i) {
    		        self.showValidationError(error.field, error.error);
    		    });
    		});
        	
        	this.model.save({},{
        		
        		success:function(){
        			self.onSaveSuccess();
        		},
        		error:function(model,errors){
        			console.log("Saving error!");
        			console.log(errors);
        			self.onSaveError(model,errors);
        		}
        		
        	});
        	
        	
//        	this.wait();
        },
        

        render : function(){
        	var data = $.extend({},UIComponents,this.model.toJSON());
        	var mainElement = this.template(data);
        	this.$el.html(mainElement);
        	this.hideValidationErrors();
			return this;
        },
        
        toggleElements :function(disable){
        	this.$el.find("input").prop("disabled", disable);
        	this.$el.find(".save-btn").prop("disabled",disable);
        },
        
        hideValidationErrors : function(){
        	this.$el.find(".validation-error").hide();
        	this.$el.find(".has-error.has-feedback").removeClass("has-error");
        	
        },
        
        showValidationError : function(attribute, msg){
        	
        	var msgId = "#"+attribute+"-error";
        	var formId = "#"+attribute+"-form";
        	$(formId).addClass("has-error");
        	$(msgId).text(msg).show();
        },
        
        wait : function(){
        	this.toggleElements(true);
        	this.$el.find(".save-btn").text("Saving...");
        },
        
        done : function(){
        	this.toggleElements(false);
        },
        
        onSaveError : function(model,errors){
        	console.log("on save error");
        	this.done();
        	this.$el.find(".save-btn").text("Not saved!").addClass("btn-warning");
        },
        
        onSaveSuccess : function(){
        	console.log("on save success!");
        	this.done();
        	this.$el.find(".save-btn").text("Saved!").addClass("btn-success");
        },
        
        resetFeedbackElements : function(){
        	console.log("input change!");
        	this.$el.find(".save-btn").text("Save").removeClass("btn-success").removeClass("btn-warning");
        }
        
        
        
	});
	
	return UserSettingsView;
});