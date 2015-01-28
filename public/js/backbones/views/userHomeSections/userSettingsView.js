define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'validation/rules',
         "i18n!nls/uiComponents"
         
], function($, _, Backbone,Rules,UIComponents){
	
	
	UserSettingsView = Backbone.View.extend({
		initialize:function (options) {
			
			options = options || {};
			
			this.template = _.template(options.template);
			
			this.listenTo(this.model, "change", this.renderValues);
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
        		if (val.length < 1){
        			val = ' ';
        		}
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
        			self.onSaveError(model,errors);
        		}
        	});
//        	this.wait();
        },
        

        render : function(){
        	var data = $.extend({},UIComponents,this.model.toJSON(),{rules:Rules});
        	console.log("*** USER SETTINGS ***");
        	console.log(data);
        	var mainElement = this.template(data);
        	this.$el.html(mainElement);
        	this.hideValidationErrors();
			return this;
        },
        
        renderValues : function(model,data){
        	console.log("Render values");
        	console.log(model);
        	for (var key in model.changed){
        		var id = '#'+key;
        		var value = model.changed[key];
        		$(id).val(value);
        	}
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
        	this.$el.find(".save-btn").text(UIComponents.savingBtn);
        },
        
        done : function(){
        	this.toggleElements(false);
        },
        
        handleBackendErrors : function(errors){
        	var errorMsg =  JSON.parse(errors.responseText);
        	var self = this;
        	for (var key in errorMsg.errors){
        		console.log(key);
        		var field = "";
        		var path = errorMsg.errors[key].path;
        		var message = errorMsg.errors[key].message;
        		// parse attribute name from path - last section in dot notation
        		try{
        		  field = path.substring(path.lastIndexOf(".")+1);
        		}catch(e){
        		  field = location;
        		}
        		self.showValidationError(field, message);
        	}
        },
        
        onSaveError : function(model,errors){
        	console.log("on save error");
        	this.handleBackendErrors(errors);
        	this.done();
        	this.$el.find(".save-btn").text(UIComponents.notSavedBtn).addClass("btn-warning");
        },
        
        onSaveSuccess : function(){
        	console.log("on save success!");
        	this.done();
        	this.$el.find(".save-btn").text(UIComponents.savedBtn).addClass("btn-success");
        },
        
        resetFeedbackElements : function(){
        	console.log("input change!");
        	this.$el.find(".save-btn").text(UIComponents.saveBtn).removeClass("btn-success").removeClass("btn-warning");
        }
        
        
        
        
	});
	
	return UserSettingsView;
});