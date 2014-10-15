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
			
			this.DEFAULT_LANGUAGE = "en";
			
			this.language = navigator.language || navigator.userLanguage;
			
			this.headerTemplate = _.template(HeaderTmpl);
			this.footerTemplate = _.template(FooterTmpl);
			
			console.log("Change locale!");

        },
        
        render : function(){
        	
        	console.log("Render index!");
        	
        	var data = $.extend({},UIComponents,{});
        	console.log(data);
        	var header = this.headerTemplate(data);
        	var footer = this.footerTemplate(data);
        	
        	this.headerEl.html(header);
        	this.footerEl.html(footer);
        	
        	this.propagateLanguageList();
        	
        	this.setCurrentLanguage();
        	
			return this;
        },
        
        setCurrentLanguage : function(){
        	var proposedLang = localStorage.getItem('locale') || navigator.language || navigator.userLanguage;
        	console.log("proposed language: "+proposedLang+"?"+$.inArray(proposedLang,Settings.supportedLanguages));
        	
        	if ($.inArray(proposedLang,Settings.supportedLanguages) > -1){
        		$("#selectedLanguage").html(proposedLang);
        	}
        	else{
        		$("#selectedLanguage").html(this.DEFAULT_LANGUAGE);
        	};
        	
        },
        
        propagateLanguageList : function(){
        	console.log("Propagate language list!");
        	
        	var languageList = Settings.supportedLanguages;
        	console.log(languageList);
        	var self = this;
        	
        	var liTemplateStart = '<li role="presentation"><a role="menuitem" tabindex="-1" >';
        	var liTemplateEnd = '</a></li>';
        	for (var i in languageList) {
        		var lang = languageList[i];
        		console.log("add "+lang);
        		var element = liTemplateStart+lang+liTemplateEnd;
        		$("#language-list").append(element);
        	}
        	
        	$("#language-list li a").click(self.switchLanguage);
        },
        
        switchLanguage : function(ev){

        	var selectedLanguage = $(this).text();
        	console.log("Switch language!");
        	console.log(ev);
			localStorage.setItem('locale', selectedLanguage);
			location.reload();
        },
	
	});
	
	return IndexView;
});