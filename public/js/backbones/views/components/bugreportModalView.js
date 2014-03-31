define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'text!templates/modals/bugreportModal.html'
         
         
], function($, _, Backbone, BugreportModalTmpl
){
	IssueModel = Backbone.Model.extend({"urlRoot":"issues"});
	
	BugreportModalView = Backbone.View.extend({
		
		
		initialize:function () {
			
			this.template = _.template(BugreportModalTmpl);
			this.model = new IssueModel({"title":""});
			
        },	
        
        render : function(){
        	 
            this.$el.html(this.template(this.model.toJSON()));
        	
            return this;
        },
        
        events: {
        	"click #bugreport-save-btn":"reportIssue"
        },
        
        reportIssue : function(e){
        	console.log("Report bug!");

        	this.model.set("title","test");
        	
        	this.model.save({success:function(){
        		console.log("Server saved!");
        	}});
        	
        	
        }
	});
	
	
	
	return BugreportModalView;
});