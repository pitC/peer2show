define([ 'jquery', 'underscore', 'backbone',
		'text!templates/modals/notificationModal.html' ], 
		function($, _, Backbone, notificationModalTmpl) {

	var notificationManager = function(rootEl) {

		this.rootEl = rootEl;

		this.notificationModal = _.template(notificationModalTmpl);

		/*
		 * options:
		 * alert_class - used in template
		 * alert_message - used in template
		 * appendMode
		 */
		this.render = function(options) {
			var notification = this.notificationModal(options);

			if (options.appendMode) {
				if ($('.notification.alert-info').length > 0) {

					$("<p>" + options.alert_message + "</p>").hide().appendTo(
							$('.notification.alert-info')).fadeIn();

				} else {
					$(notification).hide().prependTo(rootEl).fadeIn().css(
							'z-index', 1);
				}
			} else {
				// put on top
				// firstly find max z-index value
				var maxz = 0;
				$('.notification.alert-info').each(function() {
					var z = parseInt($(this).css('z-index'), 10);
					if (maxz < z) {

						maxz = z;
					}
				});
				var topZ = maxz + 1;
				// set highest z-index value to position on top
				$(notification).hide().prependTo(rootEl).fadeIn().css(
						'z-index', topZ);
			}

		};

	};

	return notificationManager;
});
