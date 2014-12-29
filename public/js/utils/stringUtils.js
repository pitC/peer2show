define([],function () {
	
	var stringUtils =  {
		
		
		
		replace : function(str,replacements){
			str = str.replace(/%\w+%/g, function(all) {
				   return replacements[all] || all;
			});
		}
		
	};
	
	return stringUtils;
});