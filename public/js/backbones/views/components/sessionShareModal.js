define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'text!templates/modals/linkShareModal.html',
         'app/settings',
         
         // 'backbones/views/roomView' - no need to add it here, it's already another way round. Just user RoomView
         
], function($, _, Backbone, LinkShareModalTmpl, Settings
){
	
	SessionShareModalView = Backbone.View.extend({
		initialize:function (options) {
			this.template = _.template(LinkShareModalTmpl);
			this.modalEl = $('#session-share-modal');
        },
        
        render : function(){
            this.$el.html(this.template(({link:location.href})));
            return this;
        }
	});
	
	
	
	return SessionShareModalView;
});