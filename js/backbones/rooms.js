

(function($){
 
        var Rooms = {};
        window.Rooms = Rooms;
		
		Rooms.RoomCollection = Backbone.Collection.extend({
            localStorage : new Store('rooms')
        });
 
        var template = function(name,view) {
        	var tmpl = tpl.get(name);
            return Mustache.to_html(tmpl,view.model.toJSON());
        };
		
		
 
        Rooms.FormView = Backbone.View.extend({
        	initialize:function () {
                this.template = _.template(tpl.get('new-room-form'));
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
				name : this.$("#new-room-name").val()
				});
			}
 
        });
		
		Rooms.RoomThumbView = Backbone.View.extend({
            initialize:function () {
                this.template = _.template(tpl.get('room-thumb'));
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
 
            name : function(){
                return this.model.get('name');
            }
 
        });
		
        Rooms.RoomsView = Backbone.View.extend({
			
			initialize : function(){
				this.roomCollection = new Rooms.RoomCollection();
                
                this.roomCollection.fetch();
				this.roomCollection.on('all',this.render,this);
			},
 
            render : function(){
				this.$el.html('');
                var form = new Rooms.FormView({collection : this.roomCollection});
				
                this.$el.append(form.render().el);
				
				this.$el.append("<br><div id='rooms-group' class='row'></div>");
				this.roomCollection.each(this.renderRoomThumb,this);
                return this;
            },
			
			renderRoomThumb : function(room){
				var roomThumbView = new Rooms.RoomThumbView({model : room});
				
                $("#rooms-group").append(roomThumbView.render().el);
			}
        });
 
 
        Rooms.Router = Backbone.Router.extend({
            initialize : function(options){
                this.el = options.el;
            },
            routes : {
                "Rooms" : "rooms",
            },
            rooms : function(){
                var roomsView = new Rooms.RoomsView();          
                this.el.empty();
                this.el.append(roomsView.render().el);
				
                this.el.append(roomsView.render().el);
            }
        });
 
        
		
		
		
})(jQuery);

tpl.loadTemplates(['new-room-form', 'room-thumb'], function () {
	var router = new Rooms.Router({el : $('#main')});
    Backbone.history.start();
});
