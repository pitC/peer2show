define([ 
         'jquery', 
         'underscore', 
         'backbone',
         'text!templates/rooms/new-room-form.html',
         'text!templates/rooms/room-thumb.html',
         'backbones/collections/room_collection'
], function($, _, Backbone, newRoomFormTmpl,roomThumbTmpl,RoomCollection){

		FormView = Backbone.View.extend({
        	initialize:function () {
                this.template = _.template(newRoomFormTmpl);
            },
			
			events : {
			"click button#add-room": "addRoomClick"
			},
			
            render : function(){
                this.$el.html(this.template());
                return this;
            },
			
			addRoomClick : function(event){
				this.collection.create({
				id : this.$("#new-room-name").val()
				});
			}
 
        });
// Room thumbnail view
		RoomThumbView = Backbone.View.extend({
            initialize:function () {
                this.template = _.template(roomThumbTmpl);
            },
            events : {
                'click .btn.remove-room' : 'removeRoom'
            },
            render : function(){
                this.$el.html(this.template(this.model.toJSON()));
                return this;
            },
            removeRoom : function(){
                this.model.destroy();
                return false;
            },
 
            id : function(){
                return this.model.get('id');
            }
 
        });


		RoomsView = Backbone.View.extend({
			
			initialize : function(){
				
				this.roomCollection = new RoomCollection();
                
                this.roomCollection.fetch();
				this.roomCollection.on('all',this.render,this);
				
			},
 
            render : function(){
				this.$el.html('');
                var form = new FormView({collection : this.roomCollection});
				
                this.$el.append(form.render().el);
				
                
				this.$el.append("<br><div id='rooms-group' class='row'></div>");
				this.roomCollection.each(this.renderRoomThumb,this);
				
                return this;
            },
			
			renderRoomThumb : function(room){
				var roomThumbView = new RoomThumbView({model : room});
				
                $("#rooms-group").append(roomThumbView.render().el);
			}
        });
		return RoomsView;
});