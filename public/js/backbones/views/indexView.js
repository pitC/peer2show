define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'app/settings',
         'app/globals',
         'backbones/views/components/loginModal',
         'text!templates/index/cookieNotice.html',
         'text!templates/index/header.html',
         'text!templates/index/footer.html',
         'text!templates/index/languageMenuItem.html',
         'text!templates/index/userDropdown.html',
         'text!templates/index/userLogin.html',
         "i18n!nls/uiComponents",
         "backbones/models/userModel"
         
         
], function($, _, Backbone, Settings, Globals, LoginModal,CookieNoticeTmpl,HeaderTmpl,FooterTmpl,LanguageMenuItemTmpl,UserDropdownTmpl,UserLoginTmpl, UIComponents,UserModel){
	
	
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
			this.userDropdownTemplate = _.template(UserDropdownTmpl);
			this.userLoginTemplate = _.template(UserLoginTmpl);
			this.setTitle();
			
			console.log("Change locale!");
			
			this.userModel = new UserModel();
			this.listenTo(this.userModel,"authorised",this.onAuthorised);
			this.loginModal = new LoginModal({model:this.userModel});
        },
               
        render : function(){
        	
        	console.log("Render index!");
        	
        	
        	console.log(data);
        	this.renderHeader();
        	
        	var data = $.extend({},UIComponents,{});
        	var footer = this.footerTemplate(data);
        	this.footerEl.html(footer);
        	this.renderModals();
			return this;
        },
        
        renderHeader : function(){
        	this.headerEl.empty();
        	var data = $.extend({},UIComponents,{});
        	
        	var header = this.headerTemplate(data);
        	this.headerEl.append(header);
        	// render dropdown menu instead
        	if(this.userModel.isAuthorised()){
        		//TODO: exchange for userModel model
        		console.log("Render user dropdown");
        		var userDropdownData = $.extend({},UIComponents,{username:Settings.userName});
        		var userDropdown = this.userDropdownTemplate(userDropdownData);
        		console.log(userDropdown);
        		console.log($("#user-dropdown-li"));
        		$("#user-login-li").append(userDropdown);
        		$("#user-login-li").addClass("dropdown");
        	}
        	else{
        		console.log("Render user login btn");
        		var userLogin = this.userLoginTemplate(data);
        		$("#user-login-li").append(userLogin);
        	}
        	if (!this.isCookieAccepted()){
        		var cookie = this.cookieNoticeTemplate(data);
        		this.headerEl.append(cookie);
        		var self = this;
        		$('#cookie-alert').on('closed.bs.alert', self.cookieAccepted);
        	}
        	
           	this.propagateLanguageList();
           	this.setCurrentLanguage();
        },
        
        renderModals : function(){
        	$("#global-modal-container").append(this.loginModal.render().el);
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
        
        setTitle : function(){
        	$("title").text(UIComponents.title);
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
        
        onAuthorised : function(){
        	
//        	this.renderHeader();
        	var self = this;
        	var modal = $('#login-modal');
        	if (modal.data('bs.modal').isShown){
        		modal.modal('hide').on('hidden.bs.modal',function(){
            		self.renderHeader();
            		Globals.router.navigate("home/",{trigger:true,replace: true});
            	});
        	}else{
        		self.renderHeader();
        	}
        	
        },
        
        onShow : function(){
//        	this.loginModal.onShow();
        },
        
        
	
	});
	
	return IndexView;
});