define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'text!templates/modals/linkShareModal.html',
         'app/settings',
         "i18n!nls/uiComponents"
         
         // 'backbones/views/roomView' - no need to add it here, it's already another way round. Just user RoomView
         
], function($, _, Backbone, LinkShareModalTmpl, Settings, UIComponents
){
	
	SessionShareModalView = Backbone.View.extend({
		initialize:function (options) {
			this.template = _.template(LinkShareModalTmpl);
			this.modalEl = $('#session-share-modal');
        },
        
        render : function(){
        	var data = $.extend({},UIComponents,{link:location.href});
            this.$el.html(this.template(data));
            return this;
        }
	});
	
	
	
	return SessionShareModalView;
});