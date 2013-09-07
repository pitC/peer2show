define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'text!templates/homepage/jumbo.html'
], function($, _, Backbone, jumboTmpl){


		HomepageView = Backbone.View.extend({
			
			initialize : function(){
				this.template = _.template(jumboTmpl);
			},
 
            render : function(){
            	this.$el.html(this.template());
                return this;
            },
		
        });
		return HomepageView;
});