define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'app/settings',
         'text!templates/index/cookieNotice.html',
         'text!templates/index/header.html',
         'text!templates/index/footer.html',
         'text!templates/index/languageMenuItem.html',
         "i18n!nls/uiComponents"
         
         
], function($, _, Backbone, Settings,CookieNoticeTmpl,HeaderTmpl,FooterTmpl,LanguageMenuItemTmpl, UIComponents){
	
	
	IndexView = Backbone.View.extend({
		initialize:function (options) {
			
			options = options || {};
			
			this.headerEl = options.headerEl;
			this.footerEl = options.footerEl;
			
			this.DEFAULT_LANGUAGE = "en";
			
			this.language = navigator.language || navigator.userLanguage;
			
			this.cookieNoticeTemplate = _.template(CookieNoticeTmpl);
			this.headerTemplate = _.template(HeaderTmpl);
			this.footerTemplate = _.template(FooterTmpl);
			this.languageMenuItemTemplate = _.template(LanguageMenuItemTmpl);
			
			console.log("Change locale!");

        },
               
        render : function(){
        	
        	console.log("Render index!");
        	
        	var data = $.extend({},UIComponents,{});
        	console.log(data);
        	var header = this.headerTemplate(data);
        	var footer = this.footerTemplate(data);
        	if (!this.isCookieAccepted()){
        		var cookie = this.cookieNoticeTemplate(data);
        		this.headerEl.append(cookie);
        		var self = this;
        		$('#cookie-alert').on('closed.bs.alert', self.cookieAccepted);
        	}
        	this.headerEl.append(header);
        	this.footerEl.html(footer);
        	
        	this.propagateLanguageList();
        	
        	this.setCurrentLanguage();
        	
			return this;
        },
        
        isCookieAccepted : function(){
        	var accepted = null;
        	if (localStorage){
        		accepted = localStorage.getItem('cookie-accepted');
        	}
        	return accepted;
        },
        
        cookieAccepted : function(ev){
        	if (localStorage){
        		localStorage.setItem('cookie-accepted', "1");
        	}
        },
        
        setCurrentLanguage : function(){
        	var proposedLang = "";
        	if (localStorage){
        		proposedLang = localStorage.getItem('locale') || navigator.language || navigator.userLanguage;
        	}
        	
        	console.log("proposed language: "+proposedLang+"?"+$.inArray(proposedLang,Settings.supportedLanguages));
        	var setLanguage = this.DEFAULT_LANGUAGE;
        	proposedLang = proposedLang.toLowerCase();
        	
        	for (var i in Settings.supportedLanguages){
        		var lang = Settings.supportedLanguages[i];
        		// if starts with
        		if (proposedLang.indexOf(lang) == 0){
        			setLanguage = lang;
        			break;
        		}
        	}
        	
        	$("#selectedLanguage").html(setLanguage);
        	
        	
        },
        
        propagateLanguageList : function(){
        	console.log("Propagate language list!");
        	
        	var languageList = Settings.supportedLanguages;
        	console.log(languageList);
        	var self = this;
        	
        	for (var i in languageList) {
        		var lang = languageList[i];
        		console.log("add "+lang);
        		var element = this.languageMenuItemTemplate({item:lang});
        		$("#language-list").append(element);
        	}
        	
        	$("#language-list li").click(self.switchLanguage);
        },
        
        switchLanguage : function(ev){
        	console.log(this);
        	// remove whitespaces and compare languages. If different, reload page
        	var selectedLanguage = $.trim($(this).text());
        	var currentLanguage = $.trim($("#selectedLanguage").text());
        	console.log(selectedLanguage+" vs "+currentLanguage);
        	if (selectedLanguage !== currentLanguage){
	        	console.log("Switch language!");
	        	console.log(ev);
				localStorage.setItem('locale', selectedLanguage);
				location.reload();
        	}
        },
	
	});
	
	return IndexView;
});