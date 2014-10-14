define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'app/settings',
         'text!templates/header.html',
         'text!templates/footer.html',
         "i18n!nls/uiComponents"
         
         
], function($, _, Backbone, Settings,HeaderTmpl,FooterTmpl, UIComponents){
	
	
	IndexView = Backbone.View.extend({
		initialize:function (options) {
			
			options = options || {};
			
			this.headerEl = options.headerEl;
			this.footerEl = options.footerEl;
			
			
			this.language = navigator.language || navigator.userLanguage;
			
			this.headerTemplate = _.template(HeaderTmpl);
			this.footerTemplate = _.template(FooterTmpl);
			
			console.log("Change locale!");
			localStorage.setItem('locale', 'pl');
//			location.reload();
        },
        events: {
        	
        },
        
        
        
        render : function(){
        	
        	console.log("Render index!");
        	
        	var data = $.extend({},UIComponents,{});
        	console.log(data);
        	var header = this.headerTemplate(data);
        	var footer = this.footerTemplate(data);
        	
        	this.headerEl.html(header);
        	this.footerEl.html(footer);
        	
			return this;
        },
        
        onShow : function(){
        	
        }
	
	});
	
	return IndexView;
});