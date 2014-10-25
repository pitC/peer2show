define([ 'jquery', 'underscore', 'backbone',
		'text!templates/modals/notificationModal.html' ], 
		function($, _, Backbone, notificationModalTmpl) {

	var notificationManager = function(mode,rootEl) {

		this.APPEND_MODE = "append";
		this.ON_TOP_MODE = "on-top";
		this.APPEND_BELOW_MODE = "append-below";
		
		this.Z_INDEX_OFFSET = 10;
		
		this.rootEl = rootEl||'#notifications-container';
		this.mode = mode||this.APPEND_BELOW_MODE;
//		this.mode = mode||this.ON_TOP_MODE;
		

		this.notificationModal = _.template(notificationModalTmpl);
		
		this.id = 0;
		
		
		this.fadeOut = {"alert-info":5000,"alert-danger":60000};
		/*
		 * options:
		 * alert_class - used in template
		 * alert_message - used in template
		 * appendMode
		 */
		this.render = function(options) {
			if (options){
				options = $.extend({},options,{id:this.getId()});
				if (this.mode == this.APPEND_MODE) {
					this.appendToExisting(options);
				} else if (this.mode == this.ON_TOP_MODE) {
					// TODO: not supported yet, problems with correct display (css)
//					this.putOnTop(options);
				}
				else{
					this.appendBelow(options);
				}
			}
		};
		
		this.appendToExisting = function(options){
			
			var alertClassObj = '.notification.alert.'+options.alertClass;
			
			if ($(alertClassObj).length > 0) {
				
				$("<p>" + options.alertMessage + "</p>").hide().appendTo(
						$(alertClassObj)).fadeIn();
				delayFadeOut(alertClassObj,options.alertClass);
			} else {
				this.putOnTop(options);
			}
		};
		
		this.putOnTop = function(options){
			// put on top
			// set highest z-index value to position on top
			var zIndex = this.getTopZ();
			var rootEl = this.rootEl;
			var originalClass = options.alertClass;
			options.alertClass = options.alertClass+" on-top";
			var notification = this.notificationModal(options);
			$(notification).hide().prependTo(rootEl).fadeIn().css(
					'z-index', zIndex);
			this.delayFadeOut(options.id,originalClass);
		};
		
		this.appendBelow = function(options){
			var notification = this.notificationModal(options);
			var rootEl = this.rootEl;
			$(notification).hide().prependTo(rootEl).fadeIn();
			
			this.delayFadeOut(options.id,options.alertClass);
		};
		
		this.delayFadeOut = function(objectId,objectClass){
			var fadeOutVal = this.fadeOut[objectClass];
			setTimeout(function(){
			    $("#"+objectId).fadeOut("slow",function(){
			    	$(this).remove();
			    });
			},fadeOutVal);
		};
		
		this.getTopZ = function(){
			// firstly find max z-index value
			var maxz = this.Z_INDEX_OFFSET;
			$('.notification').each(function() {
				var z = parseInt($(this).css('z-index'), 10);
				if (maxz < z) {
					maxz = z;
				};
			});
			var topZ = maxz + 1;
			return topZ;
		};
		
		this.getId = function(){
			var idVal = "notification-"+this.id;
			this.id = this.id+1;
			return idVal;
		};

	};

	return notificationManager;
});
